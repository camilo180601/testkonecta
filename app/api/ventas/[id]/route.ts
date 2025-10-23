import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ventaSchema } from "@/lib/validations"

// GET - Obtener una venta por ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sql = getDb()
    const ventas = await sql.query(`
      SELECT 
        v.*,
        p.nombre as producto_nombre,
        p.requiere_tasa,
        p.requiere_franquicia,
        f.nombre as franquicia_nombre,
        e.nombre as estado_nombre,
        uc.nombre as usuario_creador_nombre,
        ua.nombre as usuario_actualizador_nombre
      FROM ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      LEFT JOIN franquicias f ON v.franquicia_id = f.id
      INNER JOIN estados_venta e ON v.estado_id = e.id
      INNER JOIN usuarios uc ON v.usuario_creador_id = uc.id
      LEFT JOIN usuarios ua ON v.usuario_actualizador_id = ua.id
      WHERE v.id = ${id}
    `)

    if (ventas.length === 0) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    const venta = ventas[0][0]

    // Si es asesor, solo puede ver sus propias ventas
    if (payload.rolNombre !== "Administrador" && venta.usuario_creador_id !== payload.userId) {
      return NextResponse.json({ error: "No tiene permisos para ver esta venta" }, { status: 403 })
    }

    return NextResponse.json({ venta })
  } catch (error) {
    console.error("[v0] Error obteniendo venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// PUT - Actualizar venta
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar datos
    const validation = ventaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.errors }, { status: 400 })
    }

    const { producto_id, cupo_solicitado, franquicia_id, tasa } = validation.data

    const sql = getDb()

    // Verificar que la venta existe
    const existingVenta = await sql.query(`
      SELECT usuario_creador_id FROM ventas WHERE id = ${id}
    `)

    if (existingVenta.length === 0) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Si es asesor, solo puede editar sus propias ventas
    if (payload.rolNombre !== "Administrador" && existingVenta[0][0].usuario_creador_id !== payload.userId) {
      return NextResponse.json({ error: "No tiene permisos para editar esta venta" }, { status: 403 })
    }

    // Obtener información del producto
    const productos = await sql.query(`
      SELECT requiere_tasa, requiere_franquicia
      FROM productos
      WHERE id = ${producto_id}
    `)

    if (productos.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const producto = productos[0][0]

    // Validar campos condicionales
    if (producto.requiere_franquicia && !franquicia_id) {
      return NextResponse.json({ error: "Este producto requiere seleccionar una franquicia" }, { status: 400 })
    }

    if (producto.requiere_tasa && (tasa === null || tasa === undefined)) {
      return NextResponse.json({ error: "Este producto requiere especificar una tasa" }, { status: 400 })
    }

    // Actualizar venta
    const updatedVenta = await sql.query(`
      UPDATE ventas
      SET 
        producto_id = ${producto_id},
        cupo_solicitado = ${cupo_solicitado},
        franquicia_id = ${franquicia_id || null},
        tasa = ${tasa || null},
        usuario_actualizador_id = ${payload.userId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `)

    return NextResponse.json({ venta: updatedVenta[0] })
  } catch (error) {
    console.error("[v0] Error actualizando venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar venta
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sql = getDb()

    // Verificar que la venta existe
    const existingVenta = await sql.query(`
      SELECT usuario_creador_id FROM ventas WHERE id = ${id}
    `)

    if (existingVenta.length === 0) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Si es asesor, solo puede eliminar sus propias ventas
    if (payload.rolNombre !== "Administrador" && existingVenta[0][0].usuario_creador_id !== payload.userId) {
      return NextResponse.json({ error: "No tiene permisos para eliminar esta venta" }, { status: 403 })
    }

    // Eliminar venta (el historial se elimina en cascada)
    await sql.query(`
      DELETE FROM ventas WHERE id = ${id}
    `)

    return NextResponse.json({ message: "Venta eliminada correctamente" })
  } catch (error) {
    console.error("[v0] Error eliminando venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
