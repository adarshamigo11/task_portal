"use client"
import { useEffect, useMemo, useState } from "react"
import type React from "react"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useApp } from "@/components/state/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentUser, data, submitTask, setVisited } = useApp()
  const [file, setFile] = useState<File | null>(null)
  const task = useMemo(() => (data.tasks || []).find((t) => t.id === id) || null, [data.tasks, id])
  const campaign = useMemo(() => 
    task ? (data.campaigns || []).find((c) => c.id === task.campaignId) || null : null, 
    [data.campaigns, task]
  )
  const category = useMemo(() => 
    task ? (data.categories || []).find((cat) => cat.id === task.categoryId) || null : null, 
    [data.categories, task]
  )

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/create")
  }, [currentUser, router])

  useEffect(() => {
    if (task && currentUser) setVisited(task.id)
  }, [task, currentUser, setVisited])

  if (!currentUser || !task || currentUser.email === "admin@admin.com") return null

  const mySubs = (data.submissions || []).filter((s) => s.userEmail === currentUser.email && s.taskId === task.id)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    const res = await submitTask(task.id, file)
    if (res.ok) {
      setFile(null)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
      <Link 
        href={campaign && category ? `/campaigns/${campaign.id}/categories/${category.id}` : "/tasks"} 
        className="text-sm hover:underline text-muted-foreground"
      >
        ← Back to {category?.name || "tasks"}
      </Link>
      {campaign && category && (
        <div className="text-sm text-muted-foreground">
          {campaign.name} → {category.name}
        </div>
      )}
      <Card className="border-primary/40 shadow-[0_0_24px_-10px] shadow-primary/40">
        <CardHeader>
          <CardTitle className="text-balance">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Image
            src={task.image || "/placeholder.svg?height=240&width=640&query=neon%20task%20detail"}
            alt={task.title}
            width={960}
            height={480}
            className="rounded-md w-full h-56 object-cover"
          />
          <p className="text-muted-foreground leading-relaxed">{task.details}</p>
          <div className="text-sm">
            <span className="text-muted-foreground">Points: </span>
            <span className="text-primary font-medium">{task.points}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-primary/40 p-4">
        <label className="text-sm">Upload file</label>
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button type="submit" className="bg-primary text-primary-foreground">
          Submit
        </Button>
      </form>

      <div className="grid gap-3">
        <h3 className="font-medium">Previous Submissions</h3>
        {mySubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <ul className="grid gap-2">
            {mySubs.map((s) => (
              <li
                key={s.id}
                className={`rounded-md p-3 border ${
                  s.status === "approved"
                    ? "border-primary bg-primary/10"
                    : s.status === "rejected"
                      ? "border-destructive bg-destructive/10"
                      : "border-accent bg-accent/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {s.fileName} —{" "}
                    {s.status === "approved" ? "Approved" : s.status === "rejected" ? "Rejected" : "Submitted"}
                  </span>
                  <a href={s.dataUrl} download={s.fileName} className="text-xs underline hover:no-underline">
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
