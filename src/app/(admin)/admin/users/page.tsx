import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChangeRoleButton } from './ChangeRoleButton'
import { DeleteUserButton } from './DeleteUserButton'

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  const currentUserId = session?.user?.id

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <span className="text-zinc-500 text-sm">{users.length}人</span>
      </div>
      <div className="space-y-2">
        {users.map(user => {
          const isSelf = user.id === currentUserId
          return (
            <div key={user.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium truncate">{user.name ?? '（名前なし）'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {user.role}
                  </span>
                  {isSelf && <span className="text-xs text-zinc-500">（自分）</span>}
                </div>
                <p className="text-zinc-400 text-sm truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ChangeRoleButton id={user.id} currentRole={user.role} isSelf={isSelf} />
                <DeleteUserButton id={user.id} isSelf={isSelf} />
              </div>
            </div>
          )
        })}
        {users.length === 0 && <p className="text-zinc-400">ユーザーがいません</p>}
      </div>
    </div>
  )
}
