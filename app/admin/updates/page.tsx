"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminUpdatesPage() {
  const { currentUser, isAdmin, publishUpdate, data, deleteUpdate } = useApp()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser && !isAdmin) router.push("/tasks")
  }, [currentUser, isAdmin, router])

  if (!currentUser || !isAdmin) return null

  const onPublish = () => {
    if (!title.trim() || !details.trim()) return
    publishUpdate({
      title: title.trim(),
      details: details.trim(),
    })
    setTitle("")
    setDetails("")
  }

  const onDiscard = () => {
    setTitle("")
    setDetails("")
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 grid gap-8">
      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle>Create Update</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Update Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter update title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Update Details</Label>
            <Textarea 
              id="details" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter update details"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={onPublish} 
              className="bg-primary text-primary-foreground"
              disabled={!title.trim() || !details.trim()}
            >
              Publish Update
            </Button>
            <Button 
              variant="outline" 
              onClick={onDiscard} 
              className="border-primary/40 bg-transparent"
            >
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-xl font-semibold">Published Updates</h2>
        {(data.updates || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No updates published yet.</p>
        ) : (
          <ul className="grid gap-3">
            {(data.updates || []).map((update) => (
              <li
                key={update.id}
                className="rounded-md border border-primary/40 p-4 bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-2">{update.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {update.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Published: {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => deleteUpdate(update.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
