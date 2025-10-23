import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// GET - Listar todas las franquicias
export async function GET(request: Request) {
  try {
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
    const franquicias = await sql.query(`
      SELECT id, nombre
      FROM franquicias
      ORDER BY nombre
    `)

    return NextResponse.json({ franquicias })
  } catch (error) {
    console.error("[v0] Error obteniendo franquicias:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
