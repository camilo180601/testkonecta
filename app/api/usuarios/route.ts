import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";
import { usuarioSchema } from "@/lib/validations";

export const runtime = "nodejs";

/**
 * Middleware simple para verificar token y rol administrador
 */
async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401 };
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return { error: "Token inválido o expirado", status: 401 };
  }

  if (payload.rolNombre !== "Administrador") {
    return { error: "No tiene permisos para esta acción", status: 403 };
  }

  return { payload };
}

/**
 * GET - Listar todos los usuarios
 */
export async function GET(request: Request) {
  try {
    const check = await requireAdmin(request);
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const db = getDb();
    const [usuarios] = await db.query(
      `SELECT 
         u.id,
         u.nombre,
         u.email,
         u.rol_id,
         u.activo,
         u.created_at,
         u.updated_at,
         r.nombre AS rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("[v0] Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

/**
 * POST - Crear nuevo usuario
 */
export async function POST(request: Request) {
  try {
    const check = await requireAdmin(request);
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json();
    const validation = usuarioSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { nombre, email, password, rol_id, activo } = validation.data;

    const db = getDb();

    // Verificar que el email no exista
    const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (Array.isArray(exists) && exists.length > 0) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar usuario
    const [result] = await db.query("INSERT INTO usuarios (nombre, email, password, rol_id, activo) VALUES (?, ?, ?, ?, ?)",
      [nombre ?? null, email, hashedPassword, rol_id ?? null, activo ? 1 : 0]
    );

    const userId = result.insertId;

    // Consultar usuario creado
    const [rows]: any = await db.query(
      `SELECT 
         u.id,
         u.nombre,
         u.email,
         u.rol_id,
         u.activo,
         u.created_at,
         u.updated_at,
         r.nombre AS rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    return NextResponse.json({ usuario: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creando usuario:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
