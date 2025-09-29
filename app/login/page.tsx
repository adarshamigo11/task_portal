"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  const { login } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"login" | "signup">("login")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = login(email.trim(), password)
    if (!res.ok) {
      setError(res.message || "Login failed")
      return
    }
    if (email === "admin@admin.com") router.push("/admin/updates")
    else router.push("/tasks")
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-primary/40 p-6 bg-card shadow-[0_0_30px_-10px] shadow-primary/40">
        <div className="flex gap-2 mb-6">
          <button
            className={`px-3 py-2 rounded-md text-sm ${
              tab === "login" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm ${
              tab === "signup" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => setTab("signup")}
          >
            Signup
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="bg-primary text-primary-foreground">
              Sign In
            </Button>
            <p className="text-xs text-muted-foreground">
              Test users: 11@11.com, 22@22.com, 33@33.com (password 123). Admin: admin@admin.com
            </p>
          </form>
        ) : (
          <div className="grid gap-3">
            <p className="text-muted-foreground">
              Signup is a placeholder in this demo. Use one of the predefined accounts instead.
            </p>
            <Link href="/login">
              <Button variant="outline" className="border-primary/40 bg-transparent">
                Back to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
