"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/components/state/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdatesDisplay } from "@/components/updates-display"

export default function TasksPage() {
  const { currentUser, data } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser?.email === "admin@admin.com") router.push("/admin/create")
  }, [currentUser, router])

  if (!currentUser || currentUser.email === "admin@admin.com") return null

  const campaigns = data.campaigns || []

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <UpdatesDisplay />
      <h1 className="text-2xl font-semibold mb-6 text-center">Campaigns</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            No campaigns available yet. Check back later.
          </p>
        )}
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <Card className="border-primary/40 hover:border-primary transition-colors shadow-[0_0_24px_-10px] shadow-primary/40 h-full">
              <CardHeader>
                <CardTitle className="text-balance">{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {campaign.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="text-primary font-medium">
                    {(data.categories || []).filter(cat => cat.campaignId === campaign.id).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="text-primary font-medium">
                    {(data.tasks || []).filter(task => task.campaignId === campaign.id && task.status === "published").length}
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
