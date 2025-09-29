"use client"
import { AuthProvider } from "@/components/state/auth-context"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
