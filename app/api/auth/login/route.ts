import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.errors }, { status: 400 })
    }

    const { email, password, captcha } = validation.data

    // Validar captcha (decodificar el token)
    const captchaAnswer = Buffer.from(body.captchaToken || "", "base64").toString()
    if (captcha !== captchaAnswer) {
      return NextResponse.json({ error: "Captcha incorrecto" }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const sql = await getDb()
    const usuarios = await sql.query(`
      SELECT u.*, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = ? AND u.activo = true
    `, [email])
    
    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const usuario = usuarios[0][0]

    // Verificar contraseña
    const passwordMatch = await comparePassword(password, usuario.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const token = await generateToken({
      userId: usuario.id,
      email: usuario.email,
      rolId: usuario.rol_id,
      rolNombre: usuario.rol_nombre,
    })

    // Retornar token y datos del usuario (sin contraseña)
    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol_nombre,
        rolId: usuario.rol_id,
      },
    })
  } catch (error) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
