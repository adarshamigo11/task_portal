"use client"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"

export default function LeaderboardPage() {
  const { data, currentUser } = useApp()
  const router = useRouter()

  const ranked = useMemo(
    () =>
      data.users
        .filter((u) => u.email !== "admin@admin.com")
        .slice()
        .sort((a, b) => b.points - a.points),
    [data.users],
  )

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/tasks")
  }, [currentUser, router])

  if (!currentUser || currentUser.email === "admin@admin.com") return null

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Leaderboard</h1>
      <ul className="grid gap-2">
        {ranked.map((u, idx) => (
          <li key={u.email} className="flex items-center justify-between rounded-md border border-primary/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-6">{idx + 1}.</span>
              <span className="font-medium">{u.name}</span>
              <span className="text-muted-foreground text-sm">({u.email})</span>
            </div>
            <span className="text-primary font-semibold">{u.points}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
