import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken, hashPassword } from "@/lib/auth"
import { usuarioSchema } from "@/lib/validations"

// GET - Obtener un usuario por ID
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
    const usuarios = await sql.query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.rol_id,
        u.activo,
        u.created_at,
        u.updated_at,
        r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = ${id}
    `)

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ usuario: usuarios[0] })
  } catch (error) {
    console.error("[v0] Error obteniendo usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// PUT - Actualizar usuario
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload || payload.rolNombre !== "Administrador") {
      return NextResponse.json({ error: "No tiene permisos para esta acción" }, { status: 403 })
    }

    const body = await request.json()

    // Validar datos (password es opcional en actualización)
    const validation = usuarioSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.errors }, { status: 400 })
    }

    const { nombre, email, password, rol_id, activo } = validation.data

    const sql = getDb()

    // Verificar que el usuario existe
    const existingUser = await sql.query(`
      SELECT id FROM usuarios WHERE id = ${id}
    `)

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el email no esté en uso por otro usuario
    const emailCheck = await sql.query(`
      SELECT id FROM usuarios WHERE email = ${email} AND id != ${id}
    `)

    if (emailCheck.length > 0) {
      return NextResponse.json({ error: "El correo electrónico ya está en uso" }, { status: 400 })
    }

    // Actualizar usuario
    let updatedUser
    if (password) {
      const hashedPassword = await hashPassword(password)
      updatedUser = await sql.query(`
        UPDATE usuarios
        SET nombre = ${nombre}, email = ${email}, password = ${hashedPassword}, 
            rol_id = ${rol_id}, activo = ${activo ?? true}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, nombre, email, rol_id, activo, created_at, updated_at
      `)
    } else {
      updatedUser = await sql.query(`
        UPDATE usuarios
        SET nombre = ${nombre}, email = ${email}, rol_id = ${rol_id}, 
            activo = ${activo ?? true}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, nombre, email, rol_id, activo, created_at, updated_at
      `)
    }

    return NextResponse.json({ usuario: updatedUser[0] })
  } catch (error) {
    console.error("[v0] Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload || payload.rolNombre !== "Administrador") {
      return NextResponse.json({ error: "No tiene permisos para esta acción" }, { status: 403 })
    }

    // No permitir eliminar el propio usuario
    if (payload.userId === Number.parseInt(id)) {
      return NextResponse.json({ error: "No puede eliminar su propio usuario" }, { status: 400 })
    }

    const sql = getDb()

    // Verificar que el usuario existe
    const existingUser = await sql.query(`
      SELECT id FROM usuarios WHERE id = ${id}
    `)

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar usuario
    await sql.query(`
      DELETE FROM usuarios WHERE id = ${id}
    `)

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("[v0] Error eliminando usuario:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
