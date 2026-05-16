'use client'

import { useState } from 'react'
import { validateCredentials, saveSession } from '@/lib/auth'
import { Lock, Mail, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await validateCredentials(email, password)
      if (user) {
        saveSession(user)
        onLoginSuccess()
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4 relative overflow-hidden">

      {/* Background track dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C8BFA8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      {/* Subtle gradient wash */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(238,244,255,0.7) 0%, transparent 70%)' }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card-hover border border-warm-200 overflow-hidden">

          {/* Amber top track */}
          <div
            className="h-[3px] w-full"
            style={{ background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)' }}
          />

          <div className="px-8 pt-8 pb-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#162254' }}
              >
                <div className="flex gap-[5px]">
                  {[0, 1].map(col => (
                    <div key={col} className="flex flex-col justify-between h-[18px]">
                      {[0, 1, 2].map(row => (
                        <div
                          key={row}
                          className="w-[3px] h-[3px] rounded-full"
                          style={{ backgroundColor: row === 1 ? '#FBBF24' : '#F59E0B' }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-rail-900 leading-none"
                  style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
                >
                  Railji
                </h1>
                <p className="text-xs text-warm-400 mt-0.5">Admin Platform</p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-rail-900"
                style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-warm-500 mt-1">Sign in to your admin account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-rail-700 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="admin@example.com"
                    className="input-minimal pl-9 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-rail-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className="input-minimal pl-9 disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading
                    ? '#1A3070'
                    : 'linear-gradient(135deg, #1A3070 0%, #162254 100%)',
                }}
                onMouseEnter={e => {
                  if (!loading) (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1E3E8C 0%, #1A3070 100%)'
                }}
                onMouseLeave={e => {
                  if (!loading) (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1A3070 0%, #162254 100%)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-warm-100 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-warm-400">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-warm-400 mt-5">
          Railway Exam Management System
        </p>
      </div>
    </div>
  )
}
