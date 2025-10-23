"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { token, usuario, isAuthenticated, logout } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token || !isAuthenticated) {
        router.push("/login")
        return
      }

      try {
        // Verificar token con el servidor
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          logout()
          router.push("/login")
          return
        }

        // Verificar rol si es necesario
        if (requiredRole && usuario && !requiredRole.includes(usuario.rol)) {
          router.push("/dashboard")
          return
        }

        setIsVerifying(false)
      } catch (error) {
        console.error("[v0] Error verificando autenticación:", error)
        logout()
        router.push("/login")
      }
    }

    verifyAuth()
  }, [token, isAuthenticated, usuario, requiredRole, router, logout])

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
