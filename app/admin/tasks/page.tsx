"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminTasksPage() {
  const { currentUser, isAdmin, publishTask, data, deleteTask } = useApp()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [image, setImage] = useState("")
  const [points, setPoints] = useState<number>(10)

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser && !isAdmin) router.push("/tasks")
  }, [currentUser, isAdmin, router])

  if (!currentUser || !isAdmin) return null

  const onPublish = () => {
    if (!title.trim()) return
    publishTask({
      title: title.trim(),
      details: details.trim() || "No details provided.",
      image: image.trim() || "/task-image.jpg",
      points: Number(points) || 0,
    })
    setTitle("")
    setDetails("")
    setImage("")
    setPoints(10)
  }

  const onDiscard = () => {
    setTitle("")
    setDetails("")
    setImage("")
    setPoints(10)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 grid gap-8">
      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task name</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/neon-task.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onPublish} className="bg-primary text-primary-foreground">
              Publish
            </Button>
            <Button variant="outline" onClick={onDiscard} className="border-primary/40 bg-transparent">
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">Existing Tasks</h2>
        {data.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="grid gap-2">
            {data.tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-md border border-primary/40 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-xs text-muted-foreground">({t.points} pts)</span>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => deleteTask(t.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
