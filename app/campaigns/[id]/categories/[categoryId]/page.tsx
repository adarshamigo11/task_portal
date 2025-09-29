"use client"
import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useApp } from "@/components/state/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CategoryPage() {
  const { id, categoryId } = useParams<{ id: string; categoryId: string }>()
  const router = useRouter()
  const { currentUser, data } = useApp()
  
  const campaign = useMemo(() => 
    (data.campaigns || []).find((c) => c.id === id) || null, 
    [data.campaigns, id]
  )
  
  const category = useMemo(() => 
    (data.categories || []).find((cat) => cat.id === categoryId) || null, 
    [data.categories, categoryId]
  )
  
  const tasks = useMemo(() => 
    (data.tasks || []).filter((task) => 
      task.categoryId === categoryId && task.status === "published"
    ), 
    [data.tasks, categoryId]
  )

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/create")
  }, [currentUser, router])

  if (!currentUser || !campaign || !category || currentUser.email === "admin@admin.com") return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/campaigns/${id}`} className="text-sm hover:underline text-muted-foreground mb-4 inline-block">
        ← Back to {campaign.name}
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">Tasks in {campaign.name} - {category.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            No tasks available in this category yet.
          </p>
        )}
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
