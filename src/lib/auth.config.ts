import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as any)?.role === 'ADMIN'
      const isAdminPath = nextUrl.pathname.startsWith('/admin') ||
                          nextUrl.pathname.startsWith('/api/admin')
      const isProtectedPath = nextUrl.pathname.startsWith('/playlists') ||
                              nextUrl.pathname.startsWith('/favorites')

      if (isAdminPath) return isAdmin
      if (isProtectedPath) return isLoggedIn
      return true
    },
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  providers: [],
}
