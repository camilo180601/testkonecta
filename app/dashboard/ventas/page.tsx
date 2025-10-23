"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VentasTable } from "@/components/ventas/ventas-table"
import { VentaFormDialog } from "@/components/ventas/venta-form-dialog"
import { VentaViewDialog } from "@/components/ventas/venta-view-dialog"
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
import { Plus, Loader2, DollarSign } from "lucide-react"
import type { VentaCompleta, Producto, Franquicia } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"

export default function VentasPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  const [ventas, setVentas] = useState<VentaCompleta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [franquicias, setFranquicias] = useState<Franquicia[]>([])
  const [totalCupo, setTotalCupo] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [selectedVenta, setSelectedVenta] = useState<VentaCompleta | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [ventasRes, productosRes, franquiciasRes] = await Promise.all([
        fetch("/api/ventas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/productos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/franquicias", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const ventasData = await ventasRes.json()
      const productosData = await productosRes.json()
      const franquiciasData = await franquiciasRes.json()

      console.log("Datos cargados:", { ventasData, productosData, franquiciasData })

      setVentas(ventasData.ventas || [])
      setTotalCupo(ventasData.totalCupo || 0)
      setProductos(productosData.productos?.[0] || [])
      setFranquicias(franquiciasData.franquicias?.[0] || [])
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
    setSelectedVenta(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (venta: VentaCompleta) => {
    setSelectedVenta(venta)
    setFormDialogOpen(true)
  }

  const handleView = (venta: VentaCompleta) => {
    setSelectedVenta(venta)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (venta: VentaCompleta) => {
    setSelectedVenta(venta)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedVenta) return

    try {
      const response = await fetch(`/api/ventas/${selectedVenta.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast({
        title: "Venta eliminada",
        description: "La venta ha sido eliminada correctamente",
      })

      loadData()
    } catch (error) {
      console.error("[v0] Error eliminando venta:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la venta",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedVenta(null)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Ventas</h1>
              <p className="text-muted-foreground">Administra las ventas de productos financieros</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Radicar Venta
            </Button>
          </div>

          {/* Tarjeta de total de cupos */}
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Cupo Solicitado
              </CardTitle>
              <CardDescription>Suma de todos los cupos de las ventas mostradas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{formatCurrency(totalCupo)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventas Registradas</CardTitle>
              <CardDescription>Lista de todas las ventas de productos financieros</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <VentasTable ventas={ventas} onEdit={handleEdit} onDelete={handleDeleteClick} onView={handleView} />
              )}
            </CardContent>
          </Card>

          <VentaFormDialog
            open={formDialogOpen}
            onOpenChange={setFormDialogOpen}
            venta={selectedVenta}
            productos={productos}
            franquicias={franquicias}
            onSuccess={loadData}
            token={token || ""}
          />

          <VentaViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} venta={selectedVenta} />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la venta{" "}
                  <strong>#{selectedVenta?.id}</strong>.
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
