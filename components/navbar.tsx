"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useApp } from "@/components/state/auth-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { currentUser, isAdmin, logout } = useApp()
  const pathname = usePathname()
  const router = useRouter()

  const leftLinks =
    currentUser && isAdmin
      ? [
          { href: "/admin/tasks", label: "Tasks" },
          { href: "/admin/updates", label: "Updates" },
          { href: "/admin/submissions", label: "Submissions" },
        ]
      : currentUser
        ? [
            { href: "/tasks", label: "Tasks" },
            { href: "/profile", label: "Profile" },
            { href: "/leaderboard", label: "Leaderboard" },
          ]
        : [
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ]

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-primary/30">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-primary text-pretty">
          Neon Tasks
        </Link>
        <nav className="flex items-center gap-2">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          {currentUser ? (
            <Button
              variant="outline"
              className="border-primary/40 hover:bg-primary hover:text-primary-foreground bg-transparent"
              onClick={() => {
                logout()
                router.push("/")
              }}
            >
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
