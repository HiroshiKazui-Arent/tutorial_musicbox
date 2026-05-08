'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'ダッシュボード', testId: 'admin-nav-dashboard', exact: true },
  { href: '/admin/artists', label: 'アーティスト管理', testId: 'admin-nav-artists' },
  { href: '/admin/songs', label: '楽曲管理', testId: 'admin-nav-songs' },
  { href: '/admin/users', label: 'ユーザー管理', testId: 'admin-nav-users' },
]

export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-4">
      {links.map(({ href, label, testId, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            data-testid={testId}
            className={`text-sm transition-colors ${
              isActive
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
