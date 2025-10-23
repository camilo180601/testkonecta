import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el usuario siga activo
    const sql = getDb()
    const usuarios = await sql.query(`
      SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = ${payload.userId} AND u.activo = true
    `)

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o inactivo" }, { status: 401 })
    }

    const usuario = usuarios[0][0]

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol_nombre,
        rolId: usuario.rol_id,
      },
    })
  } catch (error) {
    console.error("[v0] Error verificando token:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
