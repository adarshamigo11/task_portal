"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useApp } from "@/components/state/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategorySelector } from "@/components/category-selector"
import { UpdatesDisplay } from "@/components/updates-display"
import type { TaskCategory } from "@/components/state/auth-context"

export default function TasksPage() {
  const { currentUser, data } = useApp()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>("Preliminary")

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/updates")
  }, [currentUser, router])

  if (!currentUser || currentUser.email === "admin@admin.com") return null

  const tasks = data.tasks.filter((t) => t.status === "published" && t.category === selectedCategory)

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <UpdatesDisplay />
      <h1 className="text-2xl font-semibold mb-6 text-center">Tasks</h1>
      <CategorySelector 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 && <p className="text-muted-foreground col-span-full text-center">No tasks in the {selectedCategory} category yet. Check back later.</p>}
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <Card className="border-primary/40 hover:border-primary transition-colors shadow-[0_0_24px_-10px] shadow-primary/40">
              <CardHeader>
                <CardTitle className="text-balance">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Image
                  src={task.image || "/placeholder.svg?height=160&width=320&query=neon%20task%20image"}
                  alt={task.title}
                  width={640}
                  height={320}
                  className="rounded-md object-cover w-full h-40"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Points</span>
                  <span className="text-primary font-medium">{task.points}</span>
                </div>
                <div className="text-xs">
                  {(currentUser.visitedTaskIds || []).includes(task.id) ? (
                    <span className="px-2 py-1 rounded bg-accent text-accent-foreground">Visited</span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-primary/20 text-primary">Not Visited</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
