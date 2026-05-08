import { DefaultSession, DefaultJWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: { role: 'USER' | 'ADMIN' } & DefaultSession['user']
  }
  interface User {
    role: 'USER' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'USER' | 'ADMIN'
  }
}
