import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <AdminHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
