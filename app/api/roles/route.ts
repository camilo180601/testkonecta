import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// GET - Listar todos los roles
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    console.log("Auth Header:", authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sql = getDb()
    const roles = await sql.query(`
      SELECT id, nombre, descripcion
      FROM roles
      ORDER BY nombre
    `)

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("[v0] Error obteniendo roles:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
