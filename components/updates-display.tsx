"use client"
import { useApp } from "@/components/state/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UpdatesDisplay() {
  const { data } = useApp()
  const updates = data.updates || []

  if (updates.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400 drop-shadow-lg">
        Updates
      </h2>
      <Card className="bg-muted/50 border-primary/40 shadow-[0_0_24px_-10px] shadow-primary/40">
        <CardContent className="p-6">
          <ul className="space-y-4">
            {updates.map((update) => (
              <li key={update.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-medium">i</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-foreground">
                    {update.details}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
