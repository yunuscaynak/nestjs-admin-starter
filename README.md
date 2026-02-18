# Nest CRUD (NestJS + Prisma + PostgreSQL + Next.js)

Basit bir full-stack kullanıcı CRUD projesi.

- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js (App Router)

## Özellikler

- Kullanıcı oluşturma, listeleme, tek kayıt getirme, güncelleme, silme
- Swagger dokümantasyonu (`/docs`)
- Prisma ile PostgreSQL bağlantısı
- Basit frontend CRUD arayüzü

## Proje Yapısı

```text
nest-crud/
  backend/   # NestJS API
  frontend/  # Next.js UI
```

## Gereksinimler

- Node.js 20+
- pnpm (backend için)
- npm (frontend için)
- Docker Desktop (PostgreSQL için)

## Hızlı Başlangıç

### 1) PostgreSQL'i başlat

```bash
cd backend
docker compose up -d
```

### 2) Backend'i kur ve veritabanını hazırla

```bash
cd backend
pnpm install
pnpm db:generate
pnpm db:push
pnpm start:dev
```

Backend varsayılan: `http://localhost:3000`  
Swagger: `http://localhost:3000/docs`

### 3) Frontend'i çalıştır

```bash
cd frontend
npm install
npm run dev -- --port 3001
```

Frontend: `http://localhost:3001`

## Ortam Değişkenleri

`backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestcrud?schema=public"
```

## Backend Scriptleri

```bash
pnpm start:dev
pnpm build
pnpm lint
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## Sık Karşılaşılan Hatalar

### `EADDRINUSE: address already in use :::3000`

3000 portu doludur.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill <PID>
```

### `Database "nestcrud" does not exist`

Veritabanı oluşturulmamıştır. Önce compose ile Postgres'i başlat, sonra:

```bash
cd backend
pnpm db:push
```

### `ECONNREFUSED` / `Service Unavailable`

PostgreSQL ayakta değildir veya bağlantı URL'i yanlıştır.

- Docker Desktop'ın açık olduğundan emin ol
- `docker compose up -d` çalıştır
- `backend/.env` içindeki `DATABASE_URL` değerini kontrol et

## Lisans

UNLICENSED
