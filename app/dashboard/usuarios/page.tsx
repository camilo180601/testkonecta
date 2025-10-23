"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsuariosTable } from "@/components/usuarios/usuarios-table"
import { UsuarioFormDialog } from "@/components/usuarios/usuario-form-dialog"
import { UsuarioViewDialog } from "@/components/usuarios/usuario-view-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Loader2 } from "lucide-react"
import type { UsuarioConRol, Rol } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function UsuariosPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConRol | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log("Cargando datos con token: ", token)
      const [usuariosRes, rolesRes] = await Promise.all([
        fetch("/api/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const usuariosData = await usuariosRes.json()
      const rolesData = await rolesRes.json()
      console.log("Datos cargados:", { usuariosData, rolesData })

      setUsuarios(usuariosData.usuarios || [])
      setRoles(rolesData.roles[0] || [])
    } catch (error) {
      console.error("[v0] Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedUsuario(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (usuario: UsuarioConRol) => {
    setSelectedUsuario(usuario)
    setFormDialogOpen(true)
  }

  const handleView = (usuario: UsuarioConRol) => {
    setSelectedUsuario(usuario)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (usuario: UsuarioConRol) => {
    setSelectedUsuario(usuario)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUsuario) return

    try {
      const response = await fetch(`/api/usuarios/${selectedUsuario.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })

      loadData()
    } catch (error) {
      console.error("[v0] Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedUsuario(null)
    }
  }

  return (
    <ProtectedRoute requiredRole={["Administrador"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">Administra los usuarios del sistema</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <UsuariosTable
                  usuarios={usuarios}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              )}
            </CardContent>
          </Card>

          <UsuarioFormDialog
            open={formDialogOpen}
            onOpenChange={setFormDialogOpen}
            usuario={selectedUsuario}
            roles={roles}
            onSuccess={loadData}
            token={token || ""}
          />

          <UsuarioViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} usuario={selectedUsuario} />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                  <strong>{selectedUsuario?.nombre}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
