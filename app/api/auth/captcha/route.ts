import { NextResponse } from "next/server"
import { generateCaptcha } from "@/lib/auth"

export async function GET() {
  try {
    const captcha = generateCaptcha()

    // En producción, guardar la respuesta en sesión o Redis
    // Por ahora, la enviamos encriptada en el response
    return NextResponse.json({
      question: captcha.question,
      token: Buffer.from(captcha.answer).toString("base64"),
    })
  } catch (error) {
    console.error("[v0] Error generando captcha:", error)
    return NextResponse.json({ error: "Error generando captcha" }, { status: 500 })
  }
}
