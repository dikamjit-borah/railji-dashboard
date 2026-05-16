'use client'

import { RecentUploads } from './RecentUploads'
import { Upload, BookOpen, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    label: 'Upload Paper',
    description: 'Add a new exam paper to the system',
    icon: Upload,
    href: '/upload',
    accentBg: 'bg-amber-50',
    accentIcon: 'text-amber-600',
    accentBorder: 'border-amber-100',
  },
  {
    label: 'View Papers',
    description: 'Browse and manage all uploaded papers',
    icon: BookOpen,
    href: '/papers',
    accentBg: 'bg-rail-50',
    accentIcon: 'text-rail-600',
    accentBorder: 'border-rail-100',
  },
  {
    label: 'Manage Users',
    description: 'Review and manage user accounts',
    icon: Users,
    href: '/users',
    accentBg: 'bg-emerald-50',
    accentIcon: 'text-emerald-600',
    accentBorder: 'border-emerald-100',
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function Dashboard() {
  return (
    <div className="min-h-full bg-warm-50">
      {/* Page hero */}
      <div className="px-5 md:px-8 pt-7 pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-warm-400 mb-1">
              {getFormattedDate()}
            </p>
            <h1
              className="text-2xl md:text-3xl font-bold text-rail-900"
              style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
            >
              {getGreeting()}, Admin
            </h1>
            <p className="text-sm text-warm-500 mt-1">
              Here&rsquo;s what&rsquo;s happening on the Railji platform
            </p>
          </div>

          {/* Railway track decoration */}
          <div className="hidden md:flex items-center gap-1.5 opacity-20 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-rail-400"
                    style={{ opacity: 1 - j * 0.15 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Amber track accent */}
        <div className="track-amber mt-5 opacity-60" />
      </div>

      {/* Main content */}
      <div className="px-5 md:px-8 pb-8 space-y-8">

        {/* Quick actions */}
        <section>
          <div className="section-label">
            <span className="section-label-bar" />
            <span className="section-label-text">Quick Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Link key={action.href} href={action.href}>
                <div
                  className={`bg-white border ${action.accentBorder} rounded-xl p-4 flex items-start gap-3.5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer`}
                >
                  <div className={`${action.accentBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${action.accentIcon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-rail-800 text-sm">{action.label}</p>
                    <p className="text-xs text-warm-400 mt-0.5 leading-snug">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-warm-300 flex-shrink-0 mt-0.5 group-hover:text-rail-400 group-hover:translate-x-0.5 transition-all duration-150" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Analytics + Activity — main data section */}
        <section>
          <div className="section-label">
            <span className="section-label-bar" />
            <span className="section-label-text">Platform Overview</span>
          </div>
          <RecentUploads />
        </section>

      </div>
    </div>
  )
}
