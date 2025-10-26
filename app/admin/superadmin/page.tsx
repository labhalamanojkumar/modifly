import SuperAdminPanel from '../../../components/SuperAdminPanel'

export const metadata = {
  title: 'Superadmin - Dashboard',
  description: 'Superadmin control panel for analytics and user management',
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <SuperAdminPanel />
    </main>
  )
}
