interface User {
  id: string
  name: string
  role: 'admin' | 'reviewer' | 'student'
  lastActive: string
  status: 'online' | 'idle' | 'offline'
}

const users: User[] = [
  { id: '1', name: 'Pramod Debnath', role: 'admin', lastActive: 'now', status: 'online' },
  { id: '2', name: 'Gurjit Ching', role: 'reviewer', lastActive: '5m ago', status: 'idle' },
  { id: '3', name: 'Amit Patel', role: 'reviewer', lastActive: '2h ago', status: 'offline' },
  { id: '4', name: 'Neha Singh', role: 'student', lastActive: '1h ago', status: 'offline' },
]

const roleColors = {
  admin: { bg: 'bg-rail-800', text: 'text-white' },
  reviewer: { bg: 'bg-rail-600', text: 'text-white' },
  student: { bg: 'bg-warm-200', text: 'text-rail-700' },
}

const statusIndicator = {
  online: 'bg-green-500',
  idle: 'bg-amber-500',
  offline: 'bg-warm-400',
}

export function ActiveUsers() {
  return (
    <div className="bg-white border border-warm-200 p-6 space-y-4 rounded-xl shadow-card">
      <div>
        <h2 className="text-sm font-semibold text-rail-900">Active Users</h2>
        <p className="text-xs text-warm-500 mt-1">{users.length} on platform</p>
      </div>

      <div className="track-warm"></div>

      <div className="space-y-3">
        {users.map((user) => {
          const colors = roleColors[user.role]
          const indicator = statusIndicator[user.status]

          return (
            <div key={user.id} className="flex items-center justify-between gap-3 p-3 hover:bg-warm-50 -mx-2 px-2 transition-colors rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${indicator} border border-white`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-rail-900 truncate">{user.name}</p>
                  <p className="text-xs text-warm-400">{user.lastActive}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} whitespace-nowrap`}>
                {user.role}
              </span>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-warm-100">
        <a href="/users" className="text-xs font-medium text-rail-700 hover:text-rail-900 inline-flex items-center gap-2 transition-colors">
          Manage users
          <span className="text-warm-400">→</span>
        </a>
      </div>
    </div>
  )
}
