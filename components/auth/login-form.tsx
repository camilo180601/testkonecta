"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2, AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
  })

  const [captchaData, setCaptchaData] = useState<{ question: string; token: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar captcha al montar el componente
  useEffect(() => {
    loadCaptcha()
  }, [])

  const loadCaptcha = async () => {
    try {
      const response = await fetch("/api/auth/captcha")
      const data = await response.json()
      setCaptchaData(data)
    } catch (error) {
      console.error("[v0] Error cargando captcha:", error)
      setError("Error cargando captcha")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaData?.token,
        }),
      })

      const data = await response.json()

      // Guardar token y usuario en el estado global
      login(data.token, data.usuario)

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error en login:", error)
      setError(error instanceof Error ? error.message : "Error en el inicio de sesión")
      // Recargar captcha en caso de error
      loadCaptcha()
      setFormData({ ...formData, captcha: "" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">Sistema de Gestión de Productos Financieros</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              maxLength={50}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="captcha">Verificación</Label>
            <p className="text-sm text-muted-foreground">{captchaData?.question}</p>
            <Input
              id="captcha"
              type="text"
              placeholder="Respuesta"
              value={formData.captcha}
              onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Usuarios de prueba:</p>
          <p className="mt-1">Admin: admin@banco.com</p>
          <p>Asesor: asesor@banco.com</p>
          <p className="mt-1 text-xs">Contraseña: Admin123!</p>
        </div>
      </CardContent>
    </Card>
  )
}
