"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if (data?.ok) {
        router.push('/admin')
      } else {
        setError(data?.error || 'Login failed')
      }
    } catch (e) {
      setError((e as any)?.message || 'Network error')
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full border p-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex justify-end">
          <button className="bg-pink-500 text-white px-4 py-2 rounded" type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}
