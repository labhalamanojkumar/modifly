"use client"

import React, { useEffect, useState } from 'react'

type Analytics = { visits: number; totalEvents: number; eventsByTool: Record<string, number>; lastUpdated?: string | null }
type Settings = {
  ga: string
  adsense: { client: string; slot: string; metaName: string; accountId: string; publisherId: string; enabled: boolean }
  monetag: { content: string; enabled: boolean }
  monetization: { metaName: string; accountId: string; publisherId: string; enabled: boolean; additionalMeta: Record<string, string> }
  adVendors: Array<{ name: string; enabled: boolean; client?: string; slot?: string; content?: string; type: string }>
  superadmins: string[]
  users: any[]
  externalConversion: { url: string; apiKey: string }
  jwtSecret: string
  databaseUrl: string
}

export default function SuperAdminPanel() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Settings>>({})
  const [editingVendor, setEditingVendor] = useState<number | null>(null)
  const [newVendor, setNewVendor] = useState({ name: '', enabled: false, client: '', slot: '', content: '', type: 'google' })
  const [activeTab, setActiveTab] = useState<'analytics' | 'integrations' | 'users'>('analytics')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const a = await fetch('/api/admin/analytics')
      if (!a.ok) throw new Error('analytics fetch failed')
      const analyticsJson = await a.json()
      setAnalytics(analyticsJson)

      const u = await fetch('/api/admin/users')
      if (!u.ok) throw new Error('users fetch failed')
      const usersJson = await u.json()
      setUsers(usersJson.users || usersJson)

      const s = await fetch('/api/admin/settings')
      if (!s.ok) throw new Error('settings fetch failed')
      const settingsJson = await s.json()
      setSettings(settingsJson)
      setFormData({
        ga: settingsJson.ga || '',
        adsense: settingsJson.adsense || { client: '', slot: '', metaName: '', accountId: '', publisherId: '', enabled: false },
        monetization: settingsJson.monetization || { metaName: '', accountId: '', publisherId: '', enabled: false, additionalMeta: {} },
        adVendors: settingsJson.adVendors || [],
        superadmins: settingsJson.superadmins || [],
        users: settingsJson.users || [],
        externalConversion: settingsJson.externalConversion || { url: '', apiKey: '' },
        jwtSecret: settingsJson.jwtSecret || '',
        databaseUrl: settingsJson.databaseUrl || ''
      })
    } catch (e: any) {
      console.error(e)
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to save settings')
      const updated = await res.json()
      setSettings(updated.config)
      setEditing(false)
      alert('Settings saved!')
    } catch (e: any) {
      alert('Error saving settings: ' + e.message)
    }
  }

  async function addVendor() {
    if (!newVendor.name.trim()) return
    const updatedVendors = [...(formData.adVendors || []), newVendor]
    setFormData({ ...formData, adVendors: updatedVendors })
    setNewVendor({ name: '', enabled: false, client: '', slot: '', content: '', type: 'google' })
  }

  async function updateVendor(index: number, vendor: any) {
    const updatedVendors = [...(formData.adVendors || [])]
    updatedVendors[index] = vendor
    setFormData({ ...formData, adVendors: updatedVendors })
    setEditingVendor(null)
  }

  async function removeVendor(index: number) {
    const updatedVendors = (formData.adVendors || []).filter((_, i) => i !== index)
    setFormData({ ...formData, adVendors: updatedVendors })
  }

  async function downloadReport() {
    try {
      const res = await fetch('/api/admin/reports')
      if (!res.ok) throw new Error('Failed to generate report')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'analytics-report.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      alert('Error downloading report: ' + e.message)
    }
  }

  if (loading) return <div className="p-6 bg-white rounded shadow">Loading...</div>
  if (error) return <div className="p-6 bg-red-50 rounded shadow text-red-700">{error}</div>

  return (
    <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Superadmin Dashboard</h1>

      <nav className="mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="tablist">
          <button
            role="tab"
            onClick={() => setActiveTab('analytics')}
            className={"px-4 py-2 rounded-l-md border " + (activeTab === 'analytics' ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-100 text-gray-600')}
          >
            Analytics
          </button>
          <button
            role="tab"
            onClick={() => setActiveTab('integrations')}
            className={"px-4 py-2 border-t border-b " + (activeTab === 'integrations' ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-100 border-gray-200 text-gray-600')}
          >
            Integrations
          </button>
          <button
            role="tab"
            onClick={() => setActiveTab('users')}
            className={"px-4 py-2 rounded-r-md border " + (activeTab === 'users' ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-100 text-gray-600')}
          >
            Users
          </button>
        </div>
      </nav>

      {activeTab === 'analytics' && (
        <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Website Analytics</h2>
        {analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Visits</div>
              <div className="text-3xl font-bold text-blue-600">{analytics.visits}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-3xl font-bold text-green-600">{analytics.totalEvents}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-lg font-semibold text-purple-600">{analytics.lastUpdated || '—'}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No analytics data available</div>
        )}
        <div className="mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={downloadReport}>
            Download Analytics Report (CSV)
          </button>
        </div>
        </section>
      )}

      {activeTab === 'integrations' && (
        <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Integrations & Settings</h2>
        {settings ? (
          editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Google Analytics ID</label>
                <input
                  type="text"
                  value={formData.ga || ''}
                  onChange={(e) => setFormData({ ...formData, ga: e.target.value })}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">AdSense Client</label>
                  <input
                    type="text"
                    value={formData.adsense?.client || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      adsense: { ...formData.adsense!, client: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">AdSense Slot</label>
                  <input
                    type="text"
                    value={formData.adsense?.slot || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      adsense: { ...formData.adsense!, slot: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.adsense?.enabled || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    adsense: { ...formData.adsense!, enabled: e.target.checked }
                  })}
                  className="mr-2"
                />
                <label className="text-sm">Enable AdSense</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">AdSense Meta Name</label>
                  <input
                    type="text"
                    value={formData.adsense?.metaName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      adsense: { ...formData.adsense!, metaName: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">AdSense Account ID</label>
                  <input
                    type="text"
                    value={formData.adsense?.accountId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      adsense: { ...formData.adsense!, accountId: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">AdSense Publisher ID</label>
                  <input
                    type="text"
                    value={formData.adsense?.publisherId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      adsense: { ...formData.adsense!, publisherId: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Monetization Meta Name</label>
                  <input
                    type="text"
                    value={formData.monetization?.metaName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monetization: { ...formData.monetization!, metaName: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Monetization Account ID</label>
                  <input
                    type="text"
                    value={formData.monetization?.accountId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monetization: { ...formData.monetization!, accountId: e.target.value }
                    })}
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Monetization Publisher ID</label>
                <input
                  type="text"
                  value={formData.monetization?.publisherId || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    monetization: { ...formData.monetization!, publisherId: e.target.value }
                  })}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.monetization?.enabled || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    monetization: { ...formData.monetization!, enabled: e.target.checked }
                  })}
                  className="mr-2"
                />
                <label className="text-sm">Enable Monetization</label>
              </div>

              <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Advanced Integrations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">External Conversion API URL</label>
                    <input
                      type="text"
                      value={formData.externalConversion?.url || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        externalConversion: { ...formData.externalConversion!, url: e.target.value }
                      })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">External Conversion API Key</label>
                    <input
                      type="password"
                      value={formData.externalConversion?.apiKey || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        externalConversion: { ...formData.externalConversion!, apiKey: e.target.value }
                      })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">JWT Secret</label>
                    <input
                      type="password"
                      value={formData.jwtSecret || ''}
                      onChange={(e) => setFormData({ ...formData, jwtSecret: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Database URL</label>
                    <input
                      type="text"
                      value={formData.databaseUrl || ''}
                      onChange={(e) => setFormData({ ...formData, databaseUrl: e.target.value })}
                      className="mt-1 block w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </section>

              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={saveSettings}>
                  Save Settings
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>Google Analytics:</strong> {settings.ga || 'Not set'}
                </div>
                <div>
                  <strong>AdSense Enabled:</strong> {settings.adsense.enabled ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>AdSense Client:</strong> {settings.adsense.client || 'Not set'}
                </div>
                <div>
                  <strong>AdSense Slot:</strong> {settings.adsense.slot || 'Not set'}
                </div>
                <div>
                  <strong>AdSense Meta Name:</strong> {settings.adsense.metaName || 'Not set'}
                </div>
                <div>
                  <strong>AdSense Account ID:</strong> {settings.adsense.accountId || 'Not set'}
                </div>
                <div>
                  <strong>AdSense Publisher ID:</strong> {settings.adsense.publisherId || 'Not set'}
                </div>
                <div>
                  <strong>Monetization Enabled:</strong> {settings.monetization.enabled ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Monetization Meta Name:</strong> {settings.monetization.metaName || 'Not set'}
                </div>
                <div>
                  <strong>Monetization Account ID:</strong> {settings.monetization.accountId || 'Not set'}
                </div>
                <div>
                  <strong>Monetization Publisher ID:</strong> {settings.monetization.publisherId || 'Not set'}
                </div>
                <div>
                  <strong>External Conversion URL:</strong> {settings.externalConversion?.url || 'Not set'}
                </div>
                <div>
                  <strong>JWT Secret:</strong> {settings.jwtSecret ? 'Configured' : 'Not set'}
                </div>
                <div>
                  <strong>Database URL:</strong> {settings.databaseUrl ? 'Configured' : 'Not set'}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Ad Vendors</h3>
                {settings.adVendors?.length ? (
                  <ul className="space-y-2">
                    {settings.adVendors.map((v, i) => (
                      <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{v.name}</div>
                          <div className="text-sm text-gray-500">Type: {v.type} | Enabled: {v.enabled ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => setEditingVendor(i)}>Edit</button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => removeVendor(i)}>Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500">No ad vendors configured</div>
                )}

                {editingVendor !== null && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <h4 className="font-medium mb-2">Edit Vendor</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Vendor Name" value={formData.adVendors?.[editingVendor]?.name || ''} onChange={(e) => {
                        const updated = [...(formData.adVendors || [])]
                        updated[editingVendor] = { ...updated[editingVendor], name: e.target.value }
                        setFormData({ ...formData, adVendors: updated })
                      }} className="border rounded px-3 py-2" />
                      <select value={formData.adVendors?.[editingVendor]?.type || 'google'} onChange={(e) => {
                        const updated = [...(formData.adVendors || [])]
                        updated[editingVendor] = { ...updated[editingVendor], type: e.target.value }
                        setFormData({ ...formData, adVendors: updated })
                      }} className="border rounded px-3 py-2">
                        <option value="google">Google AdSense</option>
                        <option value="meta">Meta Tag</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-2">
                      <input type="checkbox" checked={formData.adVendors?.[editingVendor]?.enabled || false} onChange={(e) => {
                        const updated = [...(formData.adVendors || [])]
                        updated[editingVendor] = { ...updated[editingVendor], enabled: e.target.checked }
                        setFormData({ ...formData, adVendors: updated })
                      }} className="mr-2" />
                      <label>Enabled</label>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => updateVendor(editingVendor!, formData.adVendors?.[editingVendor!])}>Update</button>
                      <button className="px-3 py-2 bg-gray-600 text-white rounded" onClick={() => setEditingVendor(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-green-50 rounded">
                  <h4 className="font-medium mb-2">Add New Vendor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Vendor Name" value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} className="border rounded px-3 py-2" />
                    <select value={newVendor.type} onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value })} className="border rounded px-3 py-2">
                      <option value="google">Google AdSense</option>
                      <option value="meta">Meta Tag</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mt-3 flex items-center">
                    <input type="checkbox" checked={newVendor.enabled} onChange={(e) => setNewVendor({ ...newVendor, enabled: e.target.checked })} className="mr-2" />
                    <label>Enabled</label>
                  </div>
                  <div className="mt-3">
                    <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={addVendor}>Add Vendor</button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-gray-500">No settings data available</div>
        )}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div>
            {users.length === 0 ? (
              <div className="text-gray-500">No users</div>
            ) : (
              <ul className="divide-y">
                {users.map((u: any) => (
                  <li key={u.id || u.username} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{u.username}</div>
                      <div className="text-sm text-gray-500">Created: {u.created_at || '—'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <div className="mt-6">
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={fetchData}>
          Refresh Data
        </button>
      </div>
    </div>
  )
}
