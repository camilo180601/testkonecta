import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// GET - Obtener estadísticas
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

    // Estadísticas generales
    const [totalVentas] =  await sql.query(`
      SELECT COUNT(*) as total FROM ventas
    `)

    const [totalCupo] = await sql.query(`
      SELECT COALESCE(SUM(cupo_solicitado), 0) as total FROM ventas
    `)

    // Ventas por producto
    const ventasPorProducto = await sql.query(`
      SELECT 
        p.nombre as producto,
        COUNT(v.id) as cantidad,
        COALESCE(SUM(v.cupo_solicitado), 0) as total_cupo
      FROM productos p
      LEFT JOIN ventas v ON p.id = v.producto_id
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
    `)

    // Ventas por asesor (solo para administradores)
    let ventasPorAsesor = []
    if (payload.rolNombre === "Administrador") {
      ventasPorAsesor = await sql.query(`
        SELECT 
          u.nombre as asesor,
          COUNT(v.id) as cantidad,
          COALESCE(SUM(v.cupo_solicitado), 0) as total_cupo
        FROM usuarios u
        LEFT JOIN ventas v ON u.id = v.usuario_creador_id
        WHERE u.rol_id = (SELECT id FROM roles WHERE nombre = 'Asesor')
        GROUP BY u.id, u.nombre
        ORDER BY cantidad DESC
      `)
    }

    // Ventas por estado
    const ventasPorEstado = await sql.query(`
      SELECT 
        e.nombre as estado,
        COUNT(v.id) as cantidad
      FROM estados_venta e
      LEFT JOIN ventas v ON e.id = v.estado_id
      GROUP BY e.id, e.nombre, e.orden
      ORDER BY e.orden
    `)

    // Ventas por fecha (últimos 30 días)
    const ventasPorFecha = await sql.query(`
      SELECT 
        DATE(created_at) AS fecha,
        COUNT(*) AS cantidad,
        COALESCE(SUM(cupo_solicitado), 0) AS total_cupo
      FROM ventas
      WHERE created_at >= CURDATE() - INTERVAL 30 DAY
      GROUP BY DATE(created_at)
      ORDER BY fecha DESC
      LIMIT 30
    `)


    return NextResponse.json({
      totalVentas: Number(totalVentas[0].total),
      totalCupo: Number(totalCupo[0].total),
      ventasPorProducto: ventasPorProducto[0],
      ventasPorAsesor: ventasPorAsesor[0][0] ? ventasPorAsesor[0] : [],
      ventasPorEstado: ventasPorEstado[0][0] ? ventasPorEstado[0] : [],
      ventasPorFecha: ventasPorFecha[0][0] ? ventasPorFecha[0] : [],
    })
  } catch (error) {
    console.error("[v0] Error obteniendo estadísticas:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
