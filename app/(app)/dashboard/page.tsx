import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { StatTiles } from "@/components/dashboard/stat-tiles"
import { ThemesChart } from "@/components/dashboard/themes-chart"
import { ActionsChart } from "@/components/dashboard/actions-chart"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { MeetingCard } from "@/components/meeting-card"
import { meetings } from "@/lib/mock-data"

export default function DashboardPage() {
  const recent = meetings.slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
          title="Dashboard"
          description="Your meeting intelligence at a glance."
        >
          <Link href="/capture">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New capture
            </Button>
          </Link>
      </PageHeader>

      <StatTiles meetings={meetings} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityChart meetings={meetings} />
        <ActionsChart meetings={meetings} />
      </div>

      <ThemesChart meetings={meetings} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent meetings</h2>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
