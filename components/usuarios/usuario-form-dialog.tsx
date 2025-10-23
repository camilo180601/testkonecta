"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { UsuarioConRol, Rol } from "@/lib/db"

interface UsuarioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: UsuarioConRol | null
  roles: Rol[]
  onSuccess: () => void
  token: string
}

export function UsuarioFormDialog({ open, onOpenChange, usuario, roles, onSuccess, token }: UsuarioFormDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: "",
    activo: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: "",
        rol_id: usuario.rol_id.toString(),
        activo: usuario.activo,
      })
    } else {
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol_id: "",
        activo: true,
      })
    }
    setError(null)
  }, [usuario, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = usuario ? "PUT" : "POST"

      const body: any = {
        nombre: formData.nombre,
        email: formData.email,
        rol_id: Number.parseInt(formData.rol_id),
        activo: formData.activo,
      }

      // Solo incluir password si se proporcionó
      if (formData.password) {
        body.password = formData.password
      } else if (!usuario) {
        // Password es obligatorio al crear
        setError("La contraseña es obligatoria")
        setIsLoading(false)
        return
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar usuario")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error guardando usuario:", error)
      setError(error instanceof Error ? error.message : "Error al guardar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
          <DialogDescription>
            {usuario ? "Modifica los datos del usuario" : "Completa el formulario para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              maxLength={50}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={50}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña {usuario ? "(dejar vacío para no cambiar)" : "*"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              maxLength={20}
              required={!usuario}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select value={formData.rol_id} onValueChange={(value) => setFormData({ ...formData, rol_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol.id} value={`${rol.id}`}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              disabled={isLoading}
            />
            <Label htmlFor="activo">Usuario activo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : usuario ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
