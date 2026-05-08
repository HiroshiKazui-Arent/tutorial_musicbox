# musicbox — 音楽配信アプリ

## 概要

閲覧モード（再生・停止・リピート・お気に入り・再生リスト・いいね）と
管理者モード（アーティスト・楽曲・ファイル登録）を持つ音楽配信 Web アプリ。

## Tech Stack

- **Frontend + API**: Next.js (App Router, TypeScript strict)
- **ORM**: Prisma
- **Database**: PostgreSQL (Docker Compose)
- **Auth**: NextAuth.js v5 beta (`next-auth@beta`) + Credentials provider + JWT
- **Storage**: ローカルファイルシステム (`data/uploads/`、`public/` 外)
- **Styling**: Tailwind CSS + shadcn/ui
- **Audio**: HTML5 Audio API

## コマンド

```bash
npm run dev       # 開発サーバー起動 (http://localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint チェック
npx prisma studio # DB GUI
npx prisma migrate dev --name <name>  # マイグレーション実行
npx prisma db seed                    # シードデータ投入
docker-compose up -d                  # PostgreSQL 起動
docker-compose down                   # PostgreSQL 停止
```

## アーキテクチャ

```
src/
├── app/
│   ├── (viewer)/     # 閲覧モード（認証不要）
│   ├── (admin)/      # 管理者モード（ADMIN ロール必須）
│   ├── (auth)/       # 認証ページ
│   └── api/          # Route Handlers
├── components/
│   ├── player/       # MiniPlayer など
│   ├── admin/        # 管理者用フォーム
│   └── ui/           # shadcn/ui
├── contexts/
│   └── PlayerContext.tsx  # グローバル音楽プレーヤー状態
├── lib/
│   ├── prisma.ts     # Prisma シングルトン
│   ├── auth.ts       # NextAuth v5 (Node.js 環境)
│   ├── auth.config.ts # Edge 互換設定
│   └── storage.ts    # ファイル保存・配信ヘルパー
└── types/
    └── next-auth.d.ts  # 型拡張

data/uploads/     # アップロードファイル保存先（public/ 外）
prisma/           # スキーマ・マイグレーション・シード
```

## 認証

- NextAuth v5 では `AUTH_SECRET`、`AUTH_URL` を使用（v4 の `NEXTAUTH_*` は廃止）
- Edge middleware では Prisma が使えないため `auth.config.ts`（Prisma 不使用）と `auth.ts` を分離
- ロール: `USER`（デフォルト）、`ADMIN`

## ファイル配信

- アップロードファイルは `data/uploads/{artists,songs,audio}/` に保存
- `/api/uploads/[...path]` ルートで配信（パストラバーサル対策済み）
- DB には `category/filename` 形式の相対パスのみ保存

## テストアカウント（シードデータ）

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| user@example.com  | user123  | USER  |
