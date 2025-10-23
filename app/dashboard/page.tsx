"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, DollarSign, FileText, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { token, usuario } = useAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/estadisticas", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("[v0] Error cargando estadísticas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bienvenido, {usuario?.nombre}</h1>
            <p className="text-muted-foreground">Resumen de tu actividad en el sistema</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Tarjetas de estadísticas principales */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalVentas || 0}</div>
                    <p className="text-xs text-muted-foreground">Ventas registradas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cupo Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalCupo || 0)}</div>
                    <p className="text-xs text-muted-foreground">Suma de todos los cupos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.ventasPorProducto?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Tipos de productos</p>
                  </CardContent>
                </Card>

                {usuario?.rol === "Administrador" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Asesores</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.ventasPorAsesor?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Asesores activos</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ventas por producto */}
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Producto</CardTitle>
                  <CardDescription>Distribución de ventas según tipo de producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.ventasPorProducto?.map((item: any) => (
                      <div key={item.producto} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.producto}</p>
                          <p className="text-sm text-muted-foreground">{item.cantidad} ventas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(Number(item.total_cupo))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ventas por estado */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de las Ventas</CardTitle>
                  <CardDescription>Distribución de ventas por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.ventasPorEstado?.map((item: any) => (
                      <div key={item.estado} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.estado}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{item.cantidad}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ventas por asesor (solo admin) */}
              {usuario?.rol === "Administrador" && stats?.ventasPorAsesor?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ventas por Asesor</CardTitle>
                    <CardDescription>Rendimiento de cada asesor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.ventasPorAsesor.map((item: any) => (
                        <div key={item.asesor} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.asesor}</p>
                            <p className="text-sm text-muted-foreground">{item.cantidad} ventas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(Number(item.total_cupo))}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
