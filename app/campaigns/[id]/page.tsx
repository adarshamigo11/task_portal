"use client"
import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/components/state/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentUser, data } = useApp()
  
  const campaign = useMemo(() => 
    (data.campaigns || []).find((c) => c.id === id) || null, 
    [data.campaigns, id]
  )
  
  const categories = useMemo(() => 
    (data.categories || []).filter((cat) => cat.campaignId === id), 
    [data.categories, id]
  )

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/create")
  }, [currentUser, router])

  if (!currentUser || !campaign || currentUser.email === "admin@admin.com") return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/tasks" className="text-sm hover:underline text-muted-foreground mb-4 inline-block">
        ← Back to campaigns
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
        <p className="text-muted-foreground">{campaign.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            No categories available in this campaign yet.
          </p>
        )}
        {categories.map((category) => (
          <Link key={category.id} href={`/campaigns/${id}/categories/${category.id}`}>
            <Card className="border-primary/40 hover:border-primary transition-colors shadow-[0_0_24px_-10px] shadow-primary/40 h-full">
              <CardHeader>
                <CardTitle className="text-balance">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="text-primary font-medium">
                    {(data.tasks || []).filter(task => 
                      task.categoryId === category.id && 
                      task.status === "published"
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Total Points</span>
                  <span className="text-primary font-medium">
                    {(data.tasks || []).filter(task => 
                      task.categoryId === category.id && 
                      task.status === "published"
                    ).reduce((sum, task) => sum + task.points, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
