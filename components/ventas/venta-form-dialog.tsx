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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { VentaCompleta, Producto, Franquicia } from "@/lib/db"

interface VentaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta?: VentaCompleta | null
  productos: Producto[]
  franquicias: Franquicia[]
  onSuccess: () => void
  token: string
}

export function VentaFormDialog({
  open,
  onOpenChange,
  venta,
  productos,
  franquicias,
  onSuccess,
  token,
}: VentaFormDialogProps) {
  const [formData, setFormData] = useState({
    producto_id: "",
    cupo_solicitado: "",
    franquicia_id: "",
    tasa: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Producto seleccionado para validaciones condicionales
  const productoSeleccionado = productos.find((p) => p.id === Number.parseInt(formData.producto_id))

  useEffect(() => {
    if (venta) {
      setFormData({
        producto_id: venta.producto_id.toString(),
        cupo_solicitado: venta.cupo_solicitado.toString(),
        franquicia_id: venta.franquicia_id?.toString() || "",
        tasa: venta.tasa?.toString() || "",
      })
    } else {
      setFormData({
        producto_id: "",
        cupo_solicitado: "",
        franquicia_id: "",
        tasa: "",
      })
    }
    setError(null)
  }, [venta, open])

  const formatCupoInput = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, "")
    // Formatear con separadores de miles
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleCupoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCupoInput(e.target.value)
    setFormData({ ...formData, cupo_solicitado: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const url = venta ? `/api/ventas/${venta.id}` : "/api/ventas"
      const method = venta ? "PUT" : "POST"

      // Parsear cupo (remover puntos)
      const cupoNumerico = Number.parseFloat(formData.cupo_solicitado.replace(/\./g, ""))

      const body: any = {
        producto_id: Number.parseInt(formData.producto_id),
        cupo_solicitado: cupoNumerico,
        franquicia_id: formData.franquicia_id ? Number.parseInt(formData.franquicia_id) : null,
        tasa: formData.tasa ? Number.parseFloat(formData.tasa) : null,
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
        throw new Error(data.error || "Error al guardar venta")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error guardando venta:", error)
      setError(error instanceof Error ? error.message : "Error al guardar venta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{venta ? "Editar Venta" : "Radicar Venta"}</DialogTitle>
          <DialogDescription>
            {venta ? "Modifica los datos de la venta" : "Completa el formulario para radicar una nueva venta"}
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
            <Label htmlFor="producto">Producto *</Label>
            <Select
              value={formData.producto_id}
              onValueChange={(value) => setFormData({ ...formData, producto_id: value, franquicia_id: "", tasa: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((producto) => (
                  <SelectItem key={producto.id} value={`${producto.id}`}>
                    {producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cupo">Cupo Solicitado *</Label>
            <Input
              id="cupo"
              value={formData.cupo_solicitado}
              onChange={handleCupoChange}
              placeholder="1.000.000"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Formato: 1.000.000</p>
          </div>

          {productoSeleccionado?.requiere_franquicia && (
            <div className="space-y-2">
              <Label htmlFor="franquicia">Franquicia *</Label>
              <Select
                value={formData.franquicia_id}
                onValueChange={(value) => setFormData({ ...formData, franquicia_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar franquicia" />
                </SelectTrigger>
                <SelectContent>
                  {franquicias.map((franquicia) => (
                    <SelectItem key={franquicia.id} value={franquicia.id.toString()}>
                      {franquicia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {productoSeleccionado?.requiere_tasa && (
            <div className="space-y-2">
              <Label htmlFor="tasa">Tasa (%) *</Label>
              <Input
                id="tasa"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                value={formData.tasa}
                onChange={(e) => setFormData({ ...formData, tasa: e.target.value })}
                placeholder="10.58"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Ejemplo: 10.58</p>
            </div>
          )}

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
              ) : venta ? (
                "Actualizar"
              ) : (
                "Radicar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
