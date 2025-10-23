"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import type { UsuarioConRol } from "@/lib/db"

interface UsuariosTableProps {
  usuarios: UsuarioConRol[]
  onEdit: (usuario: UsuarioConRol) => void
  onDelete: (usuario: UsuarioConRol) => void
  onView: (usuario: UsuarioConRol) => void
}

export function UsuariosTable({ usuarios, onEdit, onDelete, onView }: UsuariosTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.id}</TableCell>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.rol_nombre === "Administrador" ? "default" : "secondary"}>
                    {usuario.rol_nombre}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.activo ? "default" : "destructive"}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(usuario.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(usuario)} title="Ver detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(usuario)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(usuario)}
                      title="Eliminar"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
