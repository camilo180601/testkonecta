"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Users, FileText, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Radicar Venta",
      href: "/dashboard/ventas",
      icon: FileText,
      show: true,
    },
    {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: Users,
      show: usuario?.rol === "Administrador",
    },
    {
      name: "Estadísticas",
      href: "/dashboard/estadisticas",
      icon: BarChart3,
      show: true,
    },
  ]

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b p-6">
        <h2 className="text-xl font-bold">Banco Productos</h2>
        <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-sm font-medium">{usuario?.nombre}</p>
          <p className="text-xs text-muted-foreground">{usuario?.email}</p>
          <p className="mt-1 text-xs font-semibold text-primary">{usuario?.rol}</p>
        </div>
        <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 border-r lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center gap-4 px-6">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="flex-1">
              <h1 className="text-lg font-semibold">Sistema de Productos Financieros</h1>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <div className="text-right">
                <p className="text-sm font-medium">{usuario?.nombre}</p>
                <p className="text-xs text-muted-foreground">{usuario?.rol}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
