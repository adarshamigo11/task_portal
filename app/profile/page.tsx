"use client"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"

export default function ProfilePage() {
  const { currentUser } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/tasks")
  }, [currentUser, router])

  if (!currentUser || currentUser.email === "admin@admin.com") return null

  return (
    <section className="mx-auto max-w-xl px-4 py-12 grid gap-6">
      <div className="flex items-center gap-4">
        <Image
          src={currentUser.profilePhoto || "/placeholder-user.jpg"}
          alt="Profile photo"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-semibold">{currentUser.name}</h1>
          <p className="text-muted-foreground">{currentUser.email}</p>
        </div>
      </div>
      <div className="rounded-lg border border-primary/40 p-4">
        <p className="text-sm">
          Total Points: <span className="text-primary font-medium">{currentUser.points}</span>
        </p>
      </div>
    </section>
  )
}
