"use client"

import React, { useEffect, useState } from 'react'
import SuperAdminPanel from '../../components/SuperAdminPanel'

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // On mount check /api/admin/me to see if we're authenticated
    async function check() {
      try {
        const me = await fetch('/api/admin/me', { credentials: 'include' }).then(r => r.json())
        if (me?.ok) setToken('cookie')
      } catch (e) {
        // ignore
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [])

  async function login() {
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if (data?.ok) {
        setToken('cookie')
        setUsername('')
        setPassword('')
      } else {
        alert('Login failed: ' + (data?.error || 'unknown'))
      }
    } catch (e) {
      alert('Login error: ' + (e as any)?.message || String(e))
    }
  }

  function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(() => setToken(null))
  }

  if (checking) return <div className="p-6">Checking authentication...</div>

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Modifly — Admin</h1>
      {!token ? (
        <section className="mb-8">
          <h2 className="font-semibold">Admin Login</h2>
          <div className="mt-2">
            <input className="border p-2 mr-2" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="border p-2 mr-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="bg-pink-500 text-white px-3 py-2 rounded" onClick={login}>Login</button>
          </div>
        </section>
      ) : (
        <div>
          <div className="flex justify-end mb-4">
            <button className="bg-gray-200 px-3 py-1 mr-2" onClick={logout}>Logout</button>
          </div>
          <SuperAdminPanel />
        </div>
      )}
    </div>
  )
}
