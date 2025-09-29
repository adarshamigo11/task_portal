export default function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-balance">Metallic Dark Mode Task Platform</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Submit tasks, track approvals, and climb the leaderboard. Admins can publish tasks and review submissions. Log
        in to get started.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-primary/40 p-4 bg-card shadow-[0_0_20px_-6px] shadow-primary/30">
          <h3 className="font-medium">Users</h3>
          <p className="text-sm text-muted-foreground">Complete tasks and earn points.</p>
        </div>
        <div className="rounded-lg border border-primary/40 p-4 bg-card shadow-[0_0_20px_-6px] shadow-primary/30">
          <h3 className="font-medium">Admins</h3>
          <p className="text-sm text-muted-foreground">Publish tasks and review submissions.</p>
        </div>
        <div className="rounded-lg border border-primary/40 p-4 bg-card shadow-[0_0_20px_-6px] shadow-primary/30">
          <h3 className="font-medium">Leaderboard</h3>
          <p className="text-sm text-muted-foreground">See who’s on top.</p>
        </div>
      </div>
    </section>
  )
}
