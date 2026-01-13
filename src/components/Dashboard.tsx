'use client'

import { TrendingUp, Users as UsersIcon, FileCheck } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { StatCard } from './StatCard'
import { RecentUploads } from './RecentUploads'
import { ActiveUsers } from './ActiveUsers'
import { ExamTimeline } from './ExamTimeline'

export function Dashboard() {
  const stats = [
    {
      label: 'Active Exams',
      value: '24',
      icon: FileCheck,
      change: '+2 this week',
    },
    {
      label: 'Total Users',
      value: '1,847',
      icon: UsersIcon,
      change: '+142 this month',
    },
    {
      label: 'Papers Uploaded',
      value: '342',
      icon: TrendingUp,
      change: '+58 this month',
    },
  ]

  return (
    <div className="ml-56 bg-slate-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your examination system"
      />

      {/* Main Content */}
      <div className="px-8 py-8 space-y-12">
        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        {/* Track divider */}
        <div className="track"></div>

        {/* Middle section - Timeline and Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline - Main focus */}
          <div className="lg:col-span-2">
            <ExamTimeline />
          </div>

          {/* Active Users */}
          <div className="lg:col-span-1">
            <ActiveUsers />
          </div>
        </section>

        {/* Track divider */}
        <div className="track"></div>

        {/* Recent Uploads */}
        <section>
          <RecentUploads />
        </section>
      </div>
    </div>
  )
}
