# Blueprint: musicbox — 音楽配信アプリ

**Objective:** 閲覧モード（再生・停止・リピート・お気に入り・再生リスト・いいね）と管理者モード（アーティスト・楽曲・ファイル登録）を持つ音楽配信 Web アプリを構築する。

**Tech Stack:**
- Frontend + API: Next.js 15 (App Router, TypeScript strict)
- ORM: Prisma
- Database: PostgreSQL (Docker Compose)
- Auth: NextAuth.js v5 beta (`next-auth@beta`) + credentials provider + JWT strategy
- Storage: ローカルファイルシステム（`/data/uploads/`、`public/` 外に配置）
- Styling: Tailwind CSS + shadcn/ui
- Audio: HTML5 Audio API

**Mode:** git なし → Direct mode（ファイル直接編集、ブランチなし）

**Created:** 2026-05-08
**Status:** READY
**Review:** PASS (adversarial review 2026-05-08)

---

## Complete Package Manifest

以下を **Step 1** で一括インストールすること（各ステップの個別インストール手順も記載するが、
このリストが正とする）:

```bash
# Runtime
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install bcryptjs zod react-hook-form @hookform/resolvers
npm install react-dropzone lucide-react sonner
npm install --save-dev @types/bcryptjs tsx @types/node
```

---

## Step Dependency Graph

```
Step 1 (Project Setup)
  └─ Step 2 (DB Schema + Prisma Init)
       └─ Step 3 (Auth: NextAuth v5)
            ├─ Step 4 (File Storage + Upload API helper)
            └─ Step 5 (Layout & Navigation + PlayerContext scaffold)
                 ├─ Step 6 (API: Artists & Songs)  ─┐ parallel
                 ├─ Step 7 (API: User Features)    ─┘
                 │
                 ├─ Step 8 (Browsing: Song & Artist Library)
                 ├─ Step 9 (Music Player: full audio + MiniPlayer)
                 ├─ Step 10 (Favorites & Likes UI)
                 ├─ Step 11 (Playlists UI)
                 └─ Step 12 (Admin Panel UI)
```

**Parallel opportunities:**
- Steps 6 + 7 (after Step 4)
- Steps 8, 9, 10, 11, 12 (after Step 5 — all depend on layout but not on each other)

---

## Step 1 — Project Setup & Architecture

**Model:** Strongest (Opus)
**Depends on:** —
**Blocks:** All subsequent steps

### Context Brief

新規プロジェクト `musicbox` を `C:\develop\Tutorials\music` に作成する。
Windows 11 + PowerShell 環境で実行する。

### Tasks

1. **プロジェクト作成:**
   ```powershell
   cd C:\develop\Tutorials\music
   npx create-next-app@latest musicbox --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd musicbox
   ```

2. **全パッケージをインストール（一括）:**
   ```powershell
   npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
   npm install bcryptjs zod react-hook-form @hookform/resolvers
   npm install react-dropzone lucide-react sonner
   npm install --save-dev @types/bcryptjs tsx @types/node
   ```

3. **shadcn/ui を初期化:**
   ```powershell
   npx shadcn@latest init
   # プロンプト: style=Default, base color=Zinc, CSS variables=Yes
   npx shadcn@latest add button card badge avatar tabs dialog sheet alert-dialog input label select textarea
   ```
   > 注意: 旧 `shadcn-ui` CLI は deprecated。必ず `shadcn@latest` を使う。
   > peerDependency エラーが出た場合: `--legacy-peer-deps` を付けて再実行。

4. **ディレクトリ構造を確立:**
   ```
   musicbox/
   ├── src/
   │   ├── app/
   │   │   ├── (viewer)/           # 閲覧モードのルートグループ
   │   │   ├── (admin)/            # 管理者モードのルートグループ
   │   │   ├── (auth)/             # 認証ページ (login)
   │   │   └── api/
   │   │       ├── auth/           # NextAuth handlers
   │   │       ├── artists/
   │   │       ├── songs/
   │   │       ├── favorites/
   │   │       ├── likes/
   │   │       ├── playlists/
   │   │       ├── admin/          # 管理者専用 API
   │   │       └── uploads/        # ファイル配信ルート
   │   ├── components/
   │   │   ├── player/
   │   │   ├── admin/
   │   │   └── ui/
   │   ├── contexts/
   │   ├── lib/
   │   │   ├── prisma.ts
   │   │   ├── auth.ts
   │   │   ├── auth.config.ts      # Edge 互換設定（Prisma 不使用）
   │   │   └── storage.ts
   │   └── types/
   │       └── next-auth.d.ts
   ├── prisma/
   │   └── schema.prisma
   ├── data/
   │   └── uploads/               # ファイル保存先（public/ 外）
   │       ├── artists/
   │       ├── songs/
   │       └── audio/
   └── .env.local
   ```

5. **`.env.local` を作成（以下の内容で）:**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/musicbox"
   AUTH_SECRET="change-this-to-a-random-32-char-string"
   AUTH_URL="http://localhost:3000"
   ```
   > NextAuth v5 では `NEXTAUTH_SECRET` → `AUTH_SECRET`、`NEXTAUTH_URL` → `AUTH_URL` に変更。

6. **`next.config.ts` を更新:**
   ```typescript
   import type { NextConfig } from 'next'
   
   const nextConfig: NextConfig = {
     images: {
       remotePatterns: [],
     },
   }
   
   export default nextConfig
   ```

7. **`data/uploads/` ディレクトリを作成:**
   ```powershell
   New-Item -ItemType Directory -Path "data\uploads\artists" -Force
   New-Item -ItemType Directory -Path "data\uploads\songs" -Force
   New-Item -ItemType Directory -Path "data\uploads\audio" -Force
   ```

8. **`CLAUDE.md` を作成してプロジェクト概要・コマンド・アーキテクチャを記載**

### Verification

```powershell
npm run dev
# http://localhost:3000 で Next.js デフォルトページが表示されること
```

### Exit Criteria

- `npm run build` がエラーなく通る
- `data/uploads/` 配下に3サブディレクトリがある
- `.env.local` に3つの環境変数がある

---

## Step 2 — Database Schema (Prisma + PostgreSQL)

**Model:** Strongest (Opus)
**Depends on:** Step 1
**Blocks:** Step 3

### Context Brief

Prisma を初期化し、PostgreSQL スキーマを設計・実装する。
`musicbox/` ディレクトリで実行すること。

### Tasks

1. **Docker Compose で PostgreSQL を起動:**
   `docker-compose.yml` を `musicbox/` ルートに作成:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:16
       environment:
         POSTGRES_DB: musicbox
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   volumes:
     postgres_data:
   ```
   ```powershell
   docker-compose up -d
   ```

2. **Prisma を初期化:**
   ```powershell
   npx prisma init --datasource-provider postgresql
   ```
   → `prisma/schema.prisma` と `.env` が生成される。`.env.local` の `DATABASE_URL` を `.env` にも追加する（Prisma は `.env.local` を読まない）。

3. **`prisma/schema.prisma` を以下の内容で置き換え:**
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   
   enum Role {
     USER
     ADMIN
   }
   
   model User {
     id        String     @id @default(cuid())
     email     String     @unique
     password  String
     name      String?
     role      Role       @default(USER)
     createdAt DateTime   @default(now())
     playlists Playlist[]
     favorites Favorite[]
     likes     Like[]
   }
   
   model Artist {
     id           String   @id @default(cuid())
     name         String
     thumbnailPath String?  // data/uploads/ からの相対パス
     bio          String?
     createdAt    DateTime @default(now())
     songs        Song[]
   }
   
   model Song {
     id            String        @id @default(cuid())
     title         String
     artistId      String
     thumbnailPath String?
     audioPath     String        // data/uploads/audio/ からの相対パス
     duration      Int?          // 秒単位
     createdAt     DateTime      @default(now())
     artist        Artist        @relation(fields: [artistId], references: [id], onDelete: Cascade)
     playlistSongs PlaylistSong[]
     favorites     Favorite[]
     likes         Like[]
   
     @@index([artistId])
   }
   
   model Playlist {
     id        String        @id @default(cuid())
     name      String
     userId    String
     createdAt DateTime      @default(now())
     user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
     songs     PlaylistSong[]
   
     @@index([userId])
   }
   
   model PlaylistSong {
     id         String   @id @default(cuid())
     playlistId String
     songId     String
     order      Int      @default(0)
     playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
     song       Song     @relation(fields: [songId], references: [id], onDelete: Cascade)
   
     @@unique([playlistId, songId])
     @@index([playlistId])
   }
   
   model Favorite {
     id        String   @id @default(cuid())
     userId    String
     songId    String
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     song      Song     @relation(fields: [songId], references: [id], onDelete: Cascade)
   
     @@unique([userId, songId])
   }
   
   model Like {
     id        String   @id @default(cuid())
     userId    String
     songId    String
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     song      Song     @relation(fields: [songId], references: [id], onDelete: Cascade)
   
     @@unique([userId, songId])
   }
   ```

4. **マイグレーションを実行:**
   ```powershell
   npx prisma migrate dev --name init
   ```

5. **`src/lib/prisma.ts` を実装（シングルトンパターン）:**
   ```typescript
   import { PrismaClient } from '@prisma/client'
   
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
   
   export const prisma = globalForPrisma.prisma ?? new PrismaClient()
   
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

6. **`prisma/seed.ts` を作成:**
   ```typescript
   import { PrismaClient, Role } from '@prisma/client'
   import bcrypt from 'bcryptjs'
   
   const prisma = new PrismaClient()
   
   async function main() {
     const adminPassword = await bcrypt.hash('admin123', 10)
     const userPassword = await bcrypt.hash('user123', 10)
   
     await prisma.user.upsert({
       where: { email: 'admin@example.com' },
       update: {},
       create: { email: 'admin@example.com', password: adminPassword, name: 'Admin', role: Role.ADMIN },
     })
     await prisma.user.upsert({
       where: { email: 'user@example.com' },
       update: {},
       create: { email: 'user@example.com', password: userPassword, name: 'User', role: Role.USER },
     })
   
     const artist = await prisma.artist.upsert({
       where: { id: 'sample-artist-1' },
       update: {},
       create: { id: 'sample-artist-1', name: 'Sample Artist', bio: 'A sample artist for testing.' },
     })
   
     console.log('Seed complete:', { artist })
   }
   
   main().catch(console.error).finally(() => prisma.$disconnect())
   ```

7. **`package.json` に seed 設定を追加:**
   ```json
   "prisma": {
     "seed": "tsx prisma/seed.ts"
   }
   ```

8. **シードデータを投入:**
   ```powershell
   npx prisma db seed
   ```

### Verification

```powershell
npx prisma validate
npx prisma studio
# ブラウザで User・Artist テーブルとシードデータを確認
```

### Exit Criteria

- `npx prisma validate` がエラーなし
- `prisma/migrations/` にマイグレーションファイルが生成されている
- Prisma Studio で全テーブルとシードデータが確認できる

---

## Step 3 — Authentication (NextAuth.js v5)

**Model:** Strongest (Opus)
**Depends on:** Step 2
**Blocks:** Steps 4, 5

### Context Brief

NextAuth.js v5 (beta) を使い、ADMIN/USER ロールによるアクセス制御を実装する。
**重要:** NextAuth v5 では Edge middleware と Prisma が共存できないため、
`auth.config.ts`（Edge 互換、Prisma 不使用）と `auth.ts`（Node.js 環境、Prisma 使用）を分離する。

### Tasks

1. **`src/lib/auth.config.ts` を作成（Edge 互換 — Prisma を使わない）:**
   ```typescript
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
     providers: [],  // Credentials は auth.ts で追加
   }
   ```

2. **`src/lib/auth.ts` を作成（Node.js 環境 — Prisma 使用可）:**
   ```typescript
   import NextAuth from 'next-auth'
   import Credentials from 'next-auth/providers/credentials'
   import bcrypt from 'bcryptjs'
   import { prisma } from '@/lib/prisma'
   import { authConfig } from './auth.config'
   
   export const { handlers, auth, signIn, signOut } = NextAuth({
     ...authConfig,
     providers: [
       Credentials({
         credentials: {
           email: { label: 'Email', type: 'email' },
           password: { label: 'Password', type: 'password' },
         },
         async authorize(credentials) {
           if (!credentials?.email || !credentials?.password) return null
           const user = await prisma.user.findUnique({
             where: { email: credentials.email as string },
           })
           if (!user) return null
           const valid = await bcrypt.compare(credentials.password as string, user.password)
           if (!valid) return null
           return { id: user.id, email: user.email, name: user.name, role: user.role }
         },
       }),
     ],
   })
   ```

3. **`src/middleware.ts` を作成（Edge 互換 `authConfig` を使用）:**
   ```typescript
   import NextAuth from 'next-auth'
   import { authConfig } from '@/lib/auth.config'
   
   export default NextAuth(authConfig).auth
   
   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
   }
   ```

4. **`src/app/api/auth/[...nextauth]/route.ts` を作成:**
   ```typescript
   import { handlers } from '@/lib/auth'
   export const { GET, POST } = handlers
   ```

5. **`src/types/next-auth.d.ts` で型を拡張:**
   ```typescript
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
   ```

6. **`src/app/(auth)/login/page.tsx` を作成（シンプルなログインフォーム）:**
   - email / password フィールド
   - `signIn('credentials', { email, password, redirectTo: '/' })` を呼び出す
   - shadcn/ui の `Card`, `Input`, `Button`, `Label` を使用

### Verification

```powershell
npm run dev
# /admin → /login にリダイレクトされること
# admin@example.com / admin123 でログイン → /admin にアクセスできること
# user@example.com / user123 でログイン → /admin が 403/redirect されること
```

### Exit Criteria

- `npm run build` がエラーなし
- admin ユーザーで `/admin` にアクセスできる
- 未認証・USER ロールで `/admin` にアクセスするとリダイレクトされる

---

## Step 4 — File Storage & Upload Route

**Model:** Default
**Depends on:** Step 3
**Blocks:** Steps 6, 12

### Context Brief

音楽ファイルとサムネイル画像のアップロード・配信を実装する。
**重要:** Next.js の `public/` ディレクトリはビルド時にバンドルされるため、
実行時に書き込んだファイルは本番では消える。代わりに `data/uploads/`（プロジェクトルート外も可）に保存し、
専用の API ルートで配信する。

### Tasks

1. **`src/lib/storage.ts` を実装:**
   ```typescript
   import { writeFile, mkdir } from 'fs/promises'
   import path from 'path'
   
   const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads')
   
   export type UploadCategory = 'artists' | 'songs' | 'audio'
   
   const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
   const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg']
   const MAX_IMAGE_SIZE = 5 * 1024 * 1024   // 5 MB
   const MAX_AUDIO_SIZE = 50 * 1024 * 1024  // 50 MB
   
   export function validateFile(file: File, category: UploadCategory): string | null {
     const isImage = category === 'artists' || category === 'songs'
     const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES
     const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
   
     if (!allowedTypes.includes(file.type)) {
       return `Invalid file type: ${file.type}`
     }
     if (file.size > maxSize) {
       return `File too large: max ${maxSize / 1024 / 1024}MB`
     }
     return null
   }
   
   export async function saveFile(file: File, category: UploadCategory): Promise<string> {
     const error = validateFile(file, category)
     if (error) throw new Error(error)
   
     const bytes = await file.arrayBuffer()
     const buffer = Buffer.from(bytes)
     const ext = path.extname(file.name).toLowerCase()
     const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
     const dir = path.join(UPLOAD_DIR, category)
     await mkdir(dir, { recursive: true })
     await writeFile(path.join(dir, filename), buffer)
     return `${category}/${filename}`   // DB には相対パスのみ保存
   }
   ```

2. **`src/app/api/uploads/[...path]/route.ts` を作成（ファイル配信エンドポイント）:**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { readFile } from 'fs/promises'
   import path from 'path'
   
   const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads')
   
   export async function GET(
     _req: NextRequest,
     { params }: { params: Promise<{ path: string[] }> }
   ) {
     const { path: segments } = await params
     // パストラバーサル対策
     const safePath = segments.map(s => path.basename(s)).join(path.sep)
     const filePath = path.join(UPLOAD_DIR, safePath)
   
     try {
       const buffer = await readFile(filePath)
       const ext = path.extname(filePath).slice(1).toLowerCase()
       const mimeMap: Record<string, string> = {
         jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
         webp: 'image/webp', mp3: 'audio/mpeg', mp4: 'audio/mp4',
         wav: 'audio/wav', ogg: 'audio/ogg',
       }
       const contentType = mimeMap[ext] ?? 'application/octet-stream'
       return new NextResponse(buffer, { headers: { 'Content-Type': contentType } })
     } catch {
       return NextResponse.json({ error: 'Not found' }, { status: 404 })
     }
   }
   ```

3. **ヘルパー関数 `getFileUrl(storedPath: string): string` を `storage.ts` に追加:**
   ```typescript
   export function getFileUrl(storedPath: string | null | undefined): string | null {
     if (!storedPath) return null
     return `/api/uploads/${storedPath.replace(/\\/g, '/')}`
   }
   ```

4. **App Router のデフォルトボディサイズ制限を確認:**
   App Router の route handler はデフォルト 4MB。大きいファイルには以下を追加:
   ```typescript
   // 各ファイルアップロードルートの先頭に追加
   export const config = { api: { bodyParser: false } }  // App Router では不要
   // App Router では Request.formData() が自動的にストリーミング処理する
   ```
   > 注意: 50MB 超のファイルが必要な場合は `next.config.ts` に `serverExternalPackages` 設定が必要になる場合がある。

### Verification

```powershell
# テスト画像を data/uploads/artists/ に手動で置き、
# http://localhost:3000/api/uploads/artists/test.jpg でアクセスできること
```

### Exit Criteria

- `src/lib/storage.ts` が TypeScript エラーなし
- `/api/uploads/[...path]` エンドポイントでファイルが配信される
- パストラバーサル対策 (`path.basename`) が実装されている

---

## Step 5 — Layout & Navigation + PlayerContext Scaffold

**Model:** Default
**Depends on:** Step 3
**Blocks:** Steps 6, 7, 8, 9, 10, 11, 12

### Context Brief

アプリ全体のシェルとグローバル PlayerContext を確立する。
PlayerContext はこのステップでスキャフォールド（型定義のみ）し、
Step 9 で Audio ロジックを実装する。
Steps 8–12 はこのステップの完了後に並列実行できる。

### Tasks

1. **shadcn/ui コンポーネントを追加:**
   ```powershell
   npx shadcn@latest add sonner dropdown-menu separator navigation-menu
   ```

2. **`src/contexts/PlayerContext.tsx` を作成（スキャフォールド）:**
   ```typescript
   'use client'
   import { createContext, useContext, useState, useRef, ReactNode } from 'react'
   
   export interface SongForPlayer {
     id: string
     title: string
     artistName: string
     thumbnailPath: string | null
     audioPath: string
   }
   
   export type RepeatMode = 'off' | 'one' | 'all'
   
   interface PlayerContextType {
     currentSong: SongForPlayer | null
     queue: SongForPlayer[]
     isPlaying: boolean
     repeatMode: RepeatMode
     currentTime: number
     duration: number
     play: (song: SongForPlayer, queue?: SongForPlayer[]) => void
     pause: () => void
     toggle: () => void
     next: () => void
     prev: () => void
     seek: (time: number) => void
     toggleRepeat: () => void
   }
   
   const PlayerContext = createContext<PlayerContextType | null>(null)
   
   export function PlayerProvider({ children }: { children: ReactNode }) {
     const [currentSong, setCurrentSong] = useState<SongForPlayer | null>(null)
     const [queue, setQueue] = useState<SongForPlayer[]>([])
     const [isPlaying, setIsPlaying] = useState(false)
     const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
     const [currentTime, setCurrentTime] = useState(0)
     const [duration, setDuration] = useState(0)
     const audioRef = useRef<HTMLAudioElement | null>(null)
   
     // Step 9 で Audio ロジックを実装する
     const play = (song: SongForPlayer, newQueue?: SongForPlayer[]) => {
       setCurrentSong(song)
       if (newQueue) setQueue(newQueue)
     }
     const pause = () => setIsPlaying(false)
     const toggle = () => setIsPlaying(p => !p)
     const next = () => {}
     const prev = () => {}
     const seek = (_time: number) => {}
     const toggleRepeat = () => {
       setRepeatMode(m => m === 'off' ? 'one' : m === 'one' ? 'all' : 'off')
     }
   
     return (
       <PlayerContext.Provider value={{
         currentSong, queue, isPlaying, repeatMode, currentTime, duration,
         play, pause, toggle, next, prev, seek, toggleRepeat,
       }}>
         <audio ref={audioRef} />
         {children}
       </PlayerContext.Provider>
     )
   }
   
   export function usePlayer() {
     const ctx = useContext(PlayerContext)
     if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
     return ctx
   }
   ```

3. **`src/app/(viewer)/layout.tsx` を作成:**
   ```typescript
   import { PlayerProvider } from '@/contexts/PlayerContext'
   import { Header } from '@/components/Header'
   import { MiniPlayerPlaceholder } from '@/components/player/MiniPlayerPlaceholder'
   
   export default function ViewerLayout({ children }: { children: React.ReactNode }) {
     return (
       <PlayerProvider>
         <div className="min-h-screen flex flex-col">
           <Header />
           <main className="flex-1 container mx-auto px-4 py-6 pb-24">
             {children}
           </main>
           <MiniPlayerPlaceholder />
         </div>
       </PlayerProvider>
     )
   }
   ```

4. **`src/components/Header.tsx` を作成:**
   - ロゴ、ナビゲーション（曲一覧 `/songs`・アーティスト `/artists`・お気に入り `/favorites`・再生リスト `/playlists`）
   - ログイン状態に応じたユーザーメニュー（`auth()` でサーバー側取得）
   - ADMIN ロール時のみ「管理者モード」リンク表示

5. **`src/components/player/MiniPlayerPlaceholder.tsx` を作成:**
   ```typescript
   export function MiniPlayerPlaceholder() {
     return (
       <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex items-center px-4">
         <span className="text-zinc-500 text-sm">プレーヤーは Step 9 で実装</span>
       </div>
     )
   }
   ```

6. **`src/app/(admin)/layout.tsx` を作成:**
   - サイドバー: ダッシュボード `/admin`・アーティスト管理 `/admin/artists`・曲管理 `/admin/songs`
   - 閲覧モードへの切り替えリンク

7. **`src/app/(viewer)/page.tsx` と `src/app/(admin)/admin/page.tsx` のスケルトンを作成**

8. **`src/app/loading.tsx`、`src/app/error.tsx`、`src/app/not-found.tsx` を作成**

### Verification

```powershell
npm run dev
# / と /admin のレイアウトが表示されること
# ヘッダーのナビリンクが機能すること
# ADMIN でログイン → 「管理者モード」リンクが表示されること
```

### Exit Criteria

- 閲覧・管理者の両レイアウトが表示される
- PlayerContext が全ページに注入されている
- TypeScript エラーなし

---

## Step 6 — Backend API: Artists & Songs

**Model:** Default
**Depends on:** Steps 4, 5
**Blocks:** Steps 8, 9, 12
**Parallel with:** Step 7

### Context Brief

アーティストと楽曲の CRUD API を実装する。
App Router の route handler で `request.formData()` を使いファイルアップロードを処理する。
管理者専用エンドポイントは `/api/admin/` プレフィックスで分ける（middleware が保護する）。

### Tasks

1. **Artists API**
   - `src/app/api/artists/route.ts` — `GET`: 全アーティスト一覧（ページネーション）
   - `src/app/api/artists/[id]/route.ts` — `GET`: アーティスト詳細 + 関連曲リスト
   - `src/app/api/admin/artists/route.ts` — `POST`: 作成（`request.formData()` でファイル受け取り）
   - `src/app/api/admin/artists/[id]/route.ts` — `PUT`, `DELETE`

2. **Songs API**
   - `src/app/api/songs/route.ts` — `GET`: 全曲一覧（アーティスト情報込み、ページネーション）
   - `src/app/api/songs/[id]/route.ts` — `GET`: 曲詳細（likeCount、isLiked 含む）
   - `src/app/api/admin/songs/route.ts` — `POST`: 作成（サムネイル + 音楽ファイル）
   - `src/app/api/admin/songs/[id]/route.ts` — `PUT`, `DELETE`

3. **ファイルアップロードの実装パターン（App Router）:**
   ```typescript
   // src/app/api/admin/artists/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   import { auth } from '@/lib/auth'
   import { prisma } from '@/lib/prisma'
   import { saveFile } from '@/lib/storage'
   
   export async function POST(req: NextRequest) {
     const session = await auth()
     if (session?.user?.role !== 'ADMIN') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
     }
   
     const formData = await req.formData()
     const name = formData.get('name') as string
     const thumbnail = formData.get('thumbnail') as File | null
   
     if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
   
     let thumbnailPath: string | undefined
     if (thumbnail && thumbnail.size > 0) {
       thumbnailPath = await saveFile(thumbnail, 'artists')
     }
   
     const artist = await prisma.artist.create({
       data: { name, thumbnailPath, bio: formData.get('bio') as string | undefined },
     })
   
     return NextResponse.json(artist, { status: 201 })
   }
   ```

4. **`src/types/api.ts` でレスポンス型を定義**

### Verification

```powershell
# Bruno or curl でエンドポイントをテスト
curl http://localhost:3000/api/artists
curl http://localhost:3000/api/songs
```

### Exit Criteria

- 全エンドポイントが期待どおりのレスポンスを返す
- 管理者認証なしで POST/PUT/DELETE するとエラーが返る
- ファイルアップロードが `data/uploads/` に保存される
- `/api/uploads/` 経由でアップロードしたファイルにアクセスできる

---

## Step 7 — Backend API: User Features

**Model:** Default
**Depends on:** Step 5
**Blocks:** Steps 10, 11
**Parallel with:** Step 6

### Context Brief

ログインユーザー向けの API（お気に入り、いいね、再生リスト）を実装する。
全エンドポイントで `auth()` による認証チェックと所有権チェックを行う。

### Tasks

1. **Favorites API** (`src/app/api/favorites/`)
   - `GET /api/favorites` — ログインユーザーのお気に入り曲一覧（曲・アーティスト情報込み）
   - `POST /api/favorites` — 追加 `{ songId }`
   - `DELETE /api/favorites/[songId]` — 削除（自分のお気に入りのみ削除可）

2. **Likes API** (`src/app/api/likes/`)
   - `POST /api/likes` — いいね `{ songId }`
   - `DELETE /api/likes/[songId]` — 取り消し（自分のいいねのみ）

3. **Playlists API** (`src/app/api/playlists/`)
   - `GET /api/playlists` — ログインユーザーの再生リスト一覧
   - `POST /api/playlists` — 作成 `{ name }`（名前は必須、1〜50文字）
   - `GET /api/playlists/[id]` — 詳細（曲リスト込み）— 所有者のみ
   - `DELETE /api/playlists/[id]` — 削除（所有者のみ）
   - `POST /api/playlists/[id]/songs` — 曲追加 `{ songId, order? }`
   - `DELETE /api/playlists/[id]/songs/[songId]` — 曲削除

4. **所有権チェックの実装パターン:**
   ```typescript
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   
   const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
   if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
   if (playlist.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
   ```

5. **Zod でリクエストバリデーション:**
   ```typescript
   import { z } from 'zod'
   const createPlaylistSchema = z.object({ name: z.string().min(1).max(50) })
   ```

### Verification

```powershell
# user@example.com でログインした状態でAPIテスト
# お気に入り追加・取得・削除が正常動作すること
# 他人のプレイリストへのアクセスが 403 になること
```

### Exit Criteria

- 未認証リクエストは 401 を返す
- 他人のリソースへのアクセスは 403 を返す
- お気に入り・いいね・プレイリスト CRUD が正常動作する

---

## Step 8 — Frontend: Browsing Mode — Song & Artist Library

**Model:** Default
**Depends on:** Step 5
**Blocks:** —
**Parallel with:** Steps 9, 10, 11, 12

### Context Brief

曲一覧・アーティスト一覧・詳細ページを実装する。
React Server Components で API から直接データを取得する（`fetch` ではなく Prisma を直接使う）。
`SongCard` から `usePlayer().play()` を呼び出す。

### Tasks

1. **`src/components/SongCard.tsx` を作成（Client Component）:**
   - サムネイル（`<img>` or Next.js `<Image>`）、タイトル、アーティスト名
   - 再生ボタン → `usePlayer().play(song, queue)` を呼び出す
   - `FavoriteButton` と `LikeButton` のプレースホルダー（Step 10 で実装）

2. **`src/app/(viewer)/songs/page.tsx` を作成（Server Component）:**
   - Prisma で曲一覧を取得（アーティスト情報含む）
   - `SongCard` グリッドを表示
   - シンプルなページネーション

3. **`src/app/(viewer)/artists/page.tsx` を作成（Server Component）:**
   - アーティストカードグリッド

4. **`src/app/(viewer)/artists/[id]/page.tsx` を作成（Server Component）:**
   - アーティスト情報 + 関連曲リスト

5. **`src/app/(viewer)/page.tsx` を充実させる:**
   - 最新曲セクション（最新6曲）
   - アーティスト一覧セクション

6. **各ページに `loading.tsx` を追加（Suspense skeleton）**

### Verification

```powershell
# シードデータのアーティスト・曲が一覧に表示されること
# 曲をクリックして再生ボタンが機能すること（スキャフォールドした PlayerContext が呼ばれる）
```

### Exit Criteria

- 曲一覧・アーティスト一覧が DB データで表示される
- TypeScript エラーなし

---

## Step 9 — Music Player (Full Implementation)

**Model:** Strongest (Opus)
**Depends on:** Step 5
**Blocks:** Step 11
**Parallel with:** Steps 8, 10, 12

### Context Brief

Step 5 でスキャフォールドした `PlayerContext` に HTML5 Audio ロジックを実装し、
`MiniPlayerPlaceholder` を本物の `MiniPlayer` に差し替える。

### Tasks

1. **`src/contexts/PlayerContext.tsx` を完全実装（スキャフォールドを上書き）:**
   ```typescript
   // useEffect で audioRef.current のイベントリスナーを設定:
   // - timeupdate → setCurrentTime
   // - loadedmetadata → setDuration
   // - ended → repeatMode に応じて next() または再生
   
   const play = (song: SongForPlayer, newQueue?: SongForPlayer[]) => {
     setCurrentSong(song)
     if (newQueue) setQueue(newQueue)
     if (audioRef.current) {
       audioRef.current.src = `/api/uploads/${song.audioPath}`
       audioRef.current.play()
       setIsPlaying(true)
     }
   }
   
   const toggle = () => {
     if (!audioRef.current) return
     if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
     else { audioRef.current.play(); setIsPlaying(true) }
   }
   
   const seek = (time: number) => {
     if (audioRef.current) audioRef.current.currentTime = time
   }
   
   const next = () => { /* queue から次の曲を play() */ }
   const prev = () => { /* queue から前の曲を play() */ }
   ```

2. **`src/components/player/MiniPlayer.tsx` を作成:**
   - 曲サムネイル・タイトル・アーティスト名
   - ⏮ 前の曲 / ▶/⏸ 再生停止 / ⏭ 次の曲 ボタン
   - プログレスバー（`<input type="range">` + `seek()`）
   - リピートボタン（🔁 off → 🔂 one → 🔁 all）
   - ボリュームスライダー

3. **`src/app/(viewer)/layout.tsx` の `MiniPlayerPlaceholder` を `MiniPlayer` に差し替え**

4. キーボードショートカット（オプション）:
   - Space: toggle、→ / ←: ±10秒シーク

### Verification

```powershell
# 曲一覧で曲をクリックして再生されること
# プログレスバーが進行に合わせて動くこと
# リピートボタンで繰り返し動作すること
# シークが機能すること
```

### Exit Criteria

- 再生・停止・次へ・前へが動作する
- リピートモード 3種（off/one/all）が動作する
- プログレスバーのシークが機能する

---

## Step 10 — Frontend: Favorites & Likes

**Model:** Default
**Depends on:** Steps 5, 7
**Blocks:** —
**Parallel with:** Steps 8, 9, 11, 12

### Context Brief

お気に入り（ハート）といいね（サムズアップ）機能を実装する。
`useOptimistic` を使った Optimistic UI で即座に反映する。

### Tasks

1. **`src/components/FavoriteButton.tsx`** (Client Component):
   - ハートアイコン（塗りつぶし/アウトライン）
   - `POST/DELETE /api/favorites` を呼び出す
   - `useOptimistic` で楽観的 UI 更新
   - 未ログイン時はログインダイアログを表示

2. **`src/components/LikeButton.tsx`** (Client Component):
   - サムズアップアイコン + いいね数表示
   - `POST/DELETE /api/likes` を呼び出す
   - `useOptimistic` で楽観的 UI 更新

3. **`src/app/(viewer)/favorites/page.tsx`** (Server Component):
   - ログインユーザーのお気に入り曲一覧
   - 未ログイン時はログイン促進メッセージ

4. **`SongCard` に `FavoriteButton` と `LikeButton` を組み込む**

### Exit Criteria

- お気に入り追加・削除が動作し、ページリロード後も維持される
- いいね数がリアルタイムに更新される
- 未ログイン時の適切な UI

---

## Step 11 — Frontend: Playlists

**Model:** Default
**Depends on:** Steps 5, 7, 9
**Blocks:** —
**Parallel with:** Steps 10, 12

### Context Brief

ユーザーが自分の再生リストを作成・管理・再生できる機能を実装する。
「すべて再生」は Step 9 の PlayerContext を使う。

### Tasks

1. **`src/app/(viewer)/playlists/page.tsx`**: 一覧 + 新規作成ダイアログ
2. **`src/app/(viewer)/playlists/[id]/page.tsx`**: 詳細 + 曲リスト + 「すべて再生」
3. **`src/components/AddToPlaylistButton.tsx`**: 曲カードから再生リストに追加するドロップダウン
4. 「すべて再生」: `usePlayer().play(songs[0], songs)` を呼び出す

### Exit Criteria

- 再生リストの作成・削除が動作する
- 曲の追加・削除が動作する
- 「すべて再生」でプレーヤーに全曲がキューイングされる

---

## Step 12 — Frontend: Admin Panel

**Model:** Default
**Depends on:** Steps 5, 6
**Blocks:** —
**Parallel with:** Steps 8, 9, 10, 11

### Context Brief

管理者モードの UI を実装する。
ファイルアップロードには `react-dropzone` または HTML5 input を使用。
shadcn/ui の `Sonner` でトーストメッセージを表示する。

### Tasks

1. **`src/app/(admin)/admin/page.tsx`**: ダッシュボード（統計表示）
2. **`src/app/(admin)/admin/artists/page.tsx`**: アーティスト一覧テーブル
3. **`src/components/admin/ArtistForm.tsx`**: 追加・編集フォーム（サムネイルアップロード含む）
4. **`src/app/(admin)/admin/songs/page.tsx`**: 曲一覧テーブル
5. **`src/components/admin/SongForm.tsx`**: 追加・編集フォーム（サムネイル + 音楽ファイルアップロード）
   - `react-dropzone` でドラッグ&ドロップ
   - ファイル選択後の音楽プレビュー（`<audio>` 要素）
   - `FormData` で `POST /api/admin/songs` に送信
6. **削除確認ダイアログ** (`AlertDialog`)
7. **Sonner トースト** でアクション結果を表示

### Verification

```powershell
# /admin/artists でアーティストを追加できること
# /admin/songs で曲を追加（ファイル含む）できること
# 追加後に閲覧モードの一覧に反映されること
```

### Exit Criteria

- アーティスト CRUD が動作する
- 曲（サムネイル + 音楽ファイル）の追加が動作する
- バリデーションエラーが適切に表示される

---

## Rollback Strategy

- **Step 2 (DB)**: `npx prisma migrate reset` でリセット
- **Step 3 (Auth)**: `src/middleware.ts` を削除で認証を一時無効化
- **Steps 6–7 (API)**: 対象の route.ts ファイルを削除
- **Steps 8–12 (Frontend)**: 対象コンポーネント・ページファイルを削除

---

## Invariants (全ステップ共通)

- `npm run build` がエラーなく通ること
- TypeScript strict モードでエラーなし
- 管理者 API は必ず `auth()` + ロールチェックを実施すること
- ファイルアップロードは MIME タイプとサイズを検証すること
- DB 操作は Prisma ORM 経由のみ（直接 SQL 禁止）
- `data/uploads/` 配信エンドポイントはパストラバーサル対策を実施すること
- Prisma は Edge runtime で使用不可（middleware では `auth.config.ts` のみ使用）

---

## Total Steps: 12
## Parallel Opportunities:
- Steps 6 + 7 (after Step 5)
- Steps 8, 9, 10, 11, 12 (after Step 5; Step 11 additionally needs Step 9)
## Estimated Sessions: 6–8 (1–2 steps per session)
