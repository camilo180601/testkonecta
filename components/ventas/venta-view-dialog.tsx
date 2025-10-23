"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { VentaCompleta } from "@/lib/db"

interface VentaViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: VentaCompleta | null
}

export function VentaViewDialog({ open, onOpenChange, venta }: VentaViewDialogProps) {
  if (!venta) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-sm">{venta.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge>{venta.estado_nombre}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Producto</p>
            <p className="text-sm font-semibold">{venta.producto_nombre}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Cupo Solicitado</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(Number(venta.cupo_solicitado))}</p>
          </div>

          {venta.franquicia_nombre && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Franquicia</p>
              <p className="text-sm">{venta.franquicia_nombre}</p>
            </div>
          )}

          {venta.tasa && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasa</p>
              <p className="text-sm">{venta.tasa}%</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Creado Por</p>
              <p className="text-sm">{venta.usuario_creador_nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm">{formatDate(venta.created_at)}</p>
            </div>
          </div>

          {venta.usuario_actualizador_nombre && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actualizado Por</p>
                <p className="text-sm">{venta.usuario_actualizador_nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-sm">{formatDate(venta.updated_at)}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
