"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { VentaCompleta } from "@/lib/db"

interface VentasTableProps {
  ventas: VentaCompleta[]
  onEdit: (venta: VentaCompleta) => void
  onDelete: (venta: VentaCompleta) => void
  onView: (venta: VentaCompleta) => void
}

export function VentasTable({ ventas, onEdit, onDelete, onView }: VentasTableProps) {
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return "default"
      case "En Proceso":
        return "secondary"
      case "Finalizado":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cupo Solicitado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado Por</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No hay ventas registradas
              </TableCell>
            </TableRow>
          ) : (
            ventas[0].map((venta) => (
              <TableRow key={venta.id}>
                <TableCell className="font-medium">{venta.id}</TableCell>
                <TableCell>{venta.producto_nombre}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(Number(venta.cupo_solicitado))}</TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(venta.estado_nombre)}>{venta.estado_nombre}</Badge>
                </TableCell>
                <TableCell>{venta.usuario_creador_nombre}</TableCell>
                <TableCell>{formatDate(venta.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(venta)} title="Ver detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(venta)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(venta)}
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
