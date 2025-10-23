import mysql from "mysql2/promise"

// Pool de conexiones para mejor rendimiento
let pool: mysql.Pool | null = null

// Función para obtener el pool de conexiones
export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  return pool
}

// Función helper para ejecutar queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const db = getDb()
  const [rows] = await db.execute(sql, params)
  return rows as T[]
}

// Función helper para ejecutar una sola query que retorna un registro
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results.length > 0 ? results[0] : null
}

// Tipos de datos
export interface Usuario {
  id: number
  nombre: string
  email: string
  password: string
  rol_id: number
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface UsuarioConRol extends Omit<Usuario, "password"> {
  rol_nombre: string
}

export interface Rol {
  id: number
  nombre: string
  descripcion: string | null
  created_at: Date
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  requiere_tasa: boolean
  requiere_franquicia: boolean
  created_at: Date
}

export interface Franquicia {
  id: number
  nombre: string
  created_at: Date
}

export interface EstadoVenta {
  id: number
  nombre: string
  orden: number
  created_at: Date
}

export interface Venta {
  id: number
  producto_id: number
  cupo_solicitado: number
  franquicia_id: number | null
  tasa: number | null
  estado_id: number
  usuario_creador_id: number
  usuario_actualizador_id: number | null
  created_at: Date
  updated_at: Date
}

export interface VentaCompleta extends Venta {
  producto_nombre: string
  franquicia_nombre: string | null
  estado_nombre: string
  usuario_creador_nombre: string
  usuario_actualizador_nombre: string | null
}

export interface HistorialEstado {
  id: number
  venta_id: number
  estado_anterior_id: number | null
  estado_nuevo_id: number
  usuario_id: number
  comentario: string | null
  created_at: Date
}
