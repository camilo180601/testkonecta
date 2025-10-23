"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

export default function EstadisticasPage() {
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Estadísticas</h1>
            <p className="text-muted-foreground">Análisis detallado de ventas y rendimiento</p>
          </div>

          {/* Resumen general */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.totalVentas || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cupo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(stats?.totalCupo || 0)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio por Venta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {stats?.totalVentas > 0 ? formatCurrency(stats.totalCupo / stats.totalVentas) : "$0"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ventas por producto */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Producto</CardTitle>
              <CardDescription>Cantidad de ventas y cupo total por tipo de producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.ventasPorProducto?.map((item: any) => (
                  <div key={item.producto} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{item.producto}</p>
                        <p className="text-sm text-muted-foreground">{item.cantidad} ventas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(Number(item.total_cupo))}</p>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${stats.totalCupo > 0 ? (Number(item.total_cupo) / stats.totalCupo) * 100 : 0}%`,
                        }}
                      />
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
                <CardTitle>Rendimiento por Asesor</CardTitle>
                <CardDescription>Cantidad de ventas y cupo total por asesor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.ventasPorAsesor.map((item: any, index: number) => (
                    <div key={item.asesor} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{item.asesor}</p>
                            <p className="text-sm text-muted-foreground">{item.cantidad} ventas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(Number(item.total_cupo))}</p>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${stats.totalCupo > 0 ? (Number(item.total_cupo) / stats.totalCupo) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ventas por estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Cantidad de ventas en cada estado del proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.ventasPorEstado?.map((item: any) => (
                  <div key={item.estado} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.estado}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${stats.totalVentas > 0 ? (item.cantidad / stats.totalVentas) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <p className="w-12 text-right text-2xl font-bold">{item.cantidad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ventas por fecha */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes (Últimos 30 días)</CardTitle>
              <CardDescription>Cantidad de ventas y cupo por fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.ventasPorFecha?.slice(0, 10).map((item: any) => (
                  <div key={item.fecha} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{formatDateShort(item.fecha)}</p>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
