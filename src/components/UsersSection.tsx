'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Shield, BookOpen } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'examiner' | 'student'
  joinDate: string
  status: 'active' | 'inactive'
}

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Pramod Debnath',
      email: 'rajesh@example.com',
      role: 'admin',
      joinDate: '2023-11-01',
      status: 'active',
    },
    {
      id: '2',
      name: 'Gurjit Ching',
      email: 'priya@example.com',
      role: 'examiner',
      joinDate: '2023-12-15',
      status: 'active',
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      role: 'examiner',
      joinDate: '2024-01-01',
      status: 'active',
    },
    {
      id: '4',
      name: 'Neha Singh',
      email: 'neha@example.com',
      role: 'student',
      joinDate: '2024-01-08',
      status: 'inactive',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string; role: string }>({
    name: '',
    role: 'student',
  })

  const roleIcons = {
    admin: Shield,
    examiner: BookOpen,
    student: BookOpen,
  }

  const roleColors = {
    admin: { bg: 'bg-slate-900', text: 'text-slate-50' },
    examiner: { bg: 'bg-slate-700', text: 'text-slate-50' },
    student: { bg: 'bg-slate-200', text: 'text-slate-800' },
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditValues({ name: user.name, role: user.role })
  }

  const handleSaveEdit = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              name: editValues.name,
              role: editValues.role as 'admin' | 'examiner' | 'student',
            }
          : user
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const handleAddNew = () => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New User',
      email: 'user@example.com',
      role: 'student',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    setUsers([newUser, ...users])
  }

  const activeCount = users.filter((u) => u.status === 'active').length

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader
        title="Users"
        subtitle={`Manage platform users (${activeCount} active)`}
        action={{
          label: 'Add User',
          onClick: handleAddNew,
        }}
      />

      <div className="px-8 py-12">
        <div className="space-y-0 border border-slate-200 bg-white overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-6 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-widest">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Joined</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          {users.map((user, index) => {
            const colors = roleColors[user.role]

            return (
              <div
                key={user.id}
                className={`grid grid-cols-5 gap-6 px-6 py-4 items-center hover:bg-slate-50 transition-colors ${
                  index !== users.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                {/* Name */}
                <div className="min-w-0">
                  {editingId === user.id ? (
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      className="input-minimal"
                    />
                  ) : (
                    <>
                      <p className="font-medium text-slate-950 truncate">
                        {user.name}
                      </p>
                      <p
                        className={`text-xs mt-1 px-2 py-0.5 w-fit rounded ${
                          user.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.status}
                      </p>
                    </>
                  )}
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{user.email}</p>
                </div>

                {/* Role */}
                <div>
                  {editingId === user.id ? (
                    <select
                      value={editValues.role}
                      onChange={(e) =>
                        setEditValues({ ...editValues, role: e.target.value })
                      }
                      className="input-minimal text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="examiner">Examiner</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded capitalize ${colors.bg} ${colors.text}`}
                    >
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Joined */}
                <div className="text-sm text-slate-600">{user.joinDate}</div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {editingId === user.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(user.id)}
                        className="text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors px-2 py-1 border border-slate-300 hover:border-slate-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-2 py-1"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-slate-500 hover:text-slate-700 transition-colors p-1"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-500 hover:text-slate-700 transition-colors p-1"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No users created yet</p>
            <button
              onClick={handleAddNew}
              className="btn-minimal-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First User
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
