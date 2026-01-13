interface User {
  id: string
  name: string
  role: 'admin' | 'examiner' | 'student'
  lastActive: string
  status: 'online' | 'idle' | 'offline'
}

const users: User[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'admin',
    lastActive: 'now',
    status: 'online',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'examiner',
    lastActive: '5m ago',
    status: 'idle',
  },
  {
    id: '3',
    name: 'Amit Patel',
    role: 'examiner',
    lastActive: '2h ago',
    status: 'offline',
  },
  {
    id: '4',
    name: 'Neha Singh',
    role: 'student',
    lastActive: '1h ago',
    status: 'offline',
  },
]

const roleColors = {
  admin: { bg: 'bg-slate-900', text: 'text-slate-50' },
  examiner: { bg: 'bg-slate-700', text: 'text-slate-50' },
  student: { bg: 'bg-slate-200', text: 'text-slate-800' },
}

const statusIndicator = {
  online: 'bg-green-500',
  idle: 'bg-amber-500',
  offline: 'bg-slate-400',
}

export function ActiveUsers() {
  return (
    <div className="bg-white border border-slate-200 p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-950">
          Active Users
        </h2>
        <p className="text-xs text-slate-600 mt-1">{users.length} on platform</p>
      </div>

      <div className="track"></div>

      <div className="space-y-3">
        {users.map((user) => {
          const colors = roleColors[user.role]
          const indicator = statusIndicator[user.status]

          return (
            <div key={user.id} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 -mx-2 px-2 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className={`w-8 h-8 ${colors.bg} rounded-sm flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${colors.text}`}>
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${indicator} border border-white`}
                  ></div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-950 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{user.lastActive}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} whitespace-nowrap`}>
                {user.role}
              </span>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-slate-100">
        <a
          href="/users"
          className="text-xs font-medium text-slate-700 hover:text-slate-950 inline-flex items-center gap-2 transition-colors"
        >
          Manage users
          <span className="text-slate-400">→</span>
        </a>
      </div>
    </div>
  )
}
