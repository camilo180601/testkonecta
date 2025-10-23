import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { cambioEstadoSchema } from "@/lib/validations"

// PUT - Cambiar estado de una venta
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
    const validation = cambioEstadoSchema.safeParse({ ...body, venta_id: Number.parseInt(id) })
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.errors }, { status: 400 })
    }

    const { estado_nuevo_id, comentario } = validation.data

    const sql = getDb()

    // Obtener estado actual de la venta
    const ventas = await sql.query(`
      SELECT estado_id FROM ventas WHERE id = ${id}
    `)

    if (ventas.length === 0) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    const estadoAnterior = ventas[0][0].estado_id

    // Actualizar estado de la venta
    await sql.query(`
      UPDATE ventas
      SET estado_id = ${estado_nuevo_id}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `)

    // Registrar en historial
    await sql.query(`
      INSERT INTO historial_estados (venta_id, estado_anterior_id, estado_nuevo_id, usuario_id, comentario)
      VALUES (${id}, ${estadoAnterior}, ${estado_nuevo_id}, ${payload.userId}, ${comentario || null})
    `)

    return NextResponse.json({ message: "Estado actualizado correctamente" })
  } catch (error) {
    console.error("[v0] Error actualizando estado:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
