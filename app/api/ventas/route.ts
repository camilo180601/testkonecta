import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ventaSchema } from "@/lib/validations"

// GET - Listar ventas (filtradas por rol)
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

    // Si es administrador, ver todas las ventas
    // Si es asesor, solo ver sus ventas
    let ventas
    if (payload.rolNombre === "Administrador") {
      ventas = await sql.query(`
        SELECT 
          v.id,
          v.producto_id,
          v.cupo_solicitado,
          v.franquicia_id,
          v.tasa,
          v.estado_id,
          v.usuario_creador_id,
          v.usuario_actualizador_id,
          v.created_at,
          v.updated_at,
          p.nombre as producto_nombre,
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
        ORDER BY v.created_at DESC
      `)
    } else {
      ventas = await sql.query(`
        SELECT 
          v.id,
          v.producto_id,
          v.cupo_solicitado,
          v.franquicia_id,
          v.tasa,
          v.estado_id,
          v.usuario_creador_id,
          v.usuario_actualizador_id,
          v.created_at,
          v.updated_at,
          p.nombre as producto_nombre,
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
        WHERE v.usuario_creador_id = ${payload.userId}
        ORDER BY v.created_at DESC
      `)
    }

    // Calcular sumatoria de cupos
    const totalCupo = ventas.reduce((sum, venta) => sum + Number(venta.cupo_solicitado), 0)

    return NextResponse.json({ ventas, totalCupo })
  } catch (error) {
    console.error("[v0] Error obteniendo ventas:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// POST - Crear nueva venta
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validación con Zod
    const parsed = ventaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { producto_id, cupo_solicitado, franquicia_id, tasa } = parsed.data;

    const db = getDb();

    // Validar requisitos del producto
    const [prodRows] = await db.query(
      `SELECT requiere_tasa, requiere_franquicia
         FROM productos
        WHERE id = ?`,
      [producto_id]
    );
    const productos = prodRows as any[];
    if (productos.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    const producto = productos[0];

    if (producto.requiere_franquicia && !franquicia_id) {
      return NextResponse.json(
        { error: "Este producto requiere seleccionar una franquicia" },
        { status: 400 }
      );
    }

    if (producto.requiere_tasa && (tasa === null || tasa === undefined)) {
      return NextResponse.json(
        { error: "Este producto requiere especificar una tasa" },
        { status: 400 }
      );
    }

    // Crear venta (MySQL: sin RETURNING)
    const [insertRes]: any = await db.query(
      `INSERT INTO ventas (
         producto_id,
         cupo_solicitado,
         franquicia_id,
         tasa,
         estado_id,
         usuario_creador_id,
         usuario_actualizador_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        producto_id,
        cupo_solicitado,
        franquicia_id ?? null,
        tasa ?? null,
        1, // estado inicial
        payload.userId,
        payload.userId,
      ]
    );

    const ventaId = insertRes.insertId;

    // Registrar historial de estados
    await db.query(
      `INSERT INTO historial_estados (venta_id, estado_nuevo_id, usuario_id, comentario)
       VALUES (?, ?, ?, ?)`,
      [ventaId, 1, payload.userId, "Venta creada"]
    );

    // Traer la venta recién creada con joins completos
    const [ventaRows] = await db.query(
      `SELECT 
         v.id,
         v.producto_id,
         v.cupo_solicitado,
         v.franquicia_id,
         v.tasa,
         v.estado_id,
         v.usuario_creador_id,
         v.usuario_actualizador_id,
         v.created_at,
         v.updated_at,
         p.nombre AS producto_nombre,
         f.nombre AS franquicia_nombre,
         e.nombre AS estado_nombre,
         uc.nombre AS usuario_creador_nombre,
         ua.nombre AS usuario_actualizador_nombre
       FROM ventas v
       INNER JOIN productos p ON v.producto_id = p.id
       LEFT JOIN franquicias f ON v.franquicia_id = f.id
       INNER JOIN estados_venta e ON v.estado_id = e.id
       INNER JOIN usuarios uc ON v.usuario_creador_id = uc.id
       LEFT JOIN usuarios ua ON v.usuario_actualizador_id = ua.id
       WHERE v.id = ?`,
      [ventaId]
    );

    const venta = (ventaRows as any[])[0];

    return NextResponse.json({ venta }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creando venta:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}