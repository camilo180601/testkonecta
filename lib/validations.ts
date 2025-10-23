import { z } from "zod"

// Validación para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .max(50, "El correo no puede exceder 50 caracteres")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria").max(20, "La contraseña no puede exceder 20 caracteres"),
  captcha: z.string().min(1, "El captcha es obligatorio"),
})

export type LoginInput = z.infer<typeof loginSchema>

// Validación para crear/actualizar usuario
export const usuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre no puede exceder 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .max(50, "El correo no puede exceder 50 caracteres")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(20, "La contraseña no puede exceder 20 caracteres")
    .optional(),
  rol_id: z.number().int().positive("Debe seleccionar un rol"),
  activo: z.boolean().optional(),
})

export type UsuarioInput = z.infer<typeof usuarioSchema>

// Validación para crear/actualizar venta
export const ventaSchema = z
  .object({
    producto_id: z.number().int().positive("Debe seleccionar un producto"),
    cupo_solicitado: z
      .number()
      .positive("El cupo debe ser mayor a 0")
      .max(999999999999.99, "El cupo excede el límite permitido"),
    franquicia_id: z.number().int().positive().optional().nullable(),
    tasa: z
      .number()
      .min(0, "La tasa no puede ser negativa")
      .max(99.99, "La tasa no puede exceder 99.99")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Si el producto requiere franquicia, debe estar presente
      return true // La validación específica se hará en el servidor con los datos del producto
    },
    {
      message: "Validación de campos condicionales",
    },
  )

export type VentaInput = z.infer<typeof ventaSchema>

// Validación para cambio de estado
export const cambioEstadoSchema = z.object({
  venta_id: z.number().int().positive(),
  estado_nuevo_id: z.number().int().positive(),
  comentario: z.string().max(500).optional(),
})

export type CambioEstadoInput = z.infer<typeof cambioEstadoSchema>
