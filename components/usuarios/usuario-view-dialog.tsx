"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import type { UsuarioConRol } from "@/lib/db"

interface UsuarioViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: UsuarioConRol | null
}

export function UsuarioViewDialog({ open, onOpenChange, usuario }: UsuarioViewDialogProps) {
  if (!usuario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-sm">{usuario.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge variant={usuario.activo ? "default" : "destructive"}>
                {usuario.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-sm">{usuario.nombre}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
            <p className="text-sm">{usuario.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Rol</p>
            <Badge variant={usuario.rol_nombre === "Administrador" ? "default" : "secondary"}>
              {usuario.rol_nombre}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm">{formatDate(usuario.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
              <p className="text-sm">{formatDate(usuario.updated_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
