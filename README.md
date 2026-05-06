# Nest CRUD (NestJS + Prisma + SQLite + Next.js)

Basit bir full-stack kullanıcı CRUD projesi.

- Backend: NestJS + Prisma + SQLite
- Frontend: Next.js (App Router)

## Özellikler

- Login / register / refresh / logout endpoint'leri
- Access + refresh token tabanli kimlik dogrulama
- Remember me secenegi ile kalici oturum
- Admin korumalı kullanıcı oluşturma, listeleme, tek kayıt getirme, güncelleme, silme
- Swagger dokümantasyonu (`/docs`)
- Prisma ile SQLite bağlantısı
- Login ekranı ve admin paneli içeren frontend arayüzü
- API prefix: `/api`

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

## Hızlı Başlangıç

### 1) Backend'i kur ve veritabanını hazırla

```bash
cd backend
pnpm install
pnpm db:generate
pnpm db:push
pnpm start:dev
```

Backend varsayılan: `http://localhost:3002`  
API: `http://localhost:3002/api`  
Swagger: `http://localhost:3002/docs`

### 2) Frontend'i çalıştır

```bash
cd frontend
npm install
npm run dev -- --port 3001
```

Frontend: `http://localhost:3001`

## Ortam Değişkenleri

`backend/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3002
SWAGGER_PATH=docs
```

İstersen frontend için API adresini override edebilirsin:

`frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
```

## Makefile Kullanımı

Kök dizinden:

```bash
make install
make db-generate
make db-push
make backend
make frontend
```

Backend klasörü içinden:

```bash
make install
make setup
make backend
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

## API Uçları

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

## Auth Notları

- Sistemde parola set edilmiş ilk hesap `ADMIN` rolüyle oluşturulur.
- `users` endpoint'leri sadece `ADMIN` rolündeki kullanıcılar için açıktır.
- Access token kisa omurludur; frontend gerekirse refresh token ile oturumu otomatik yeniler.
- `remember me` seciliyse refresh token daha uzun omurlu uretilir ve oturum `localStorage` tarafinda tutulur.
- `remember me` kapaliysa oturum `sessionStorage` tarafinda tutulur; tarayici sekmesi kapaninca temizlenir.
- Eski veritabanında auth öncesinden kalan kullanıcı kayıtları varsa bu kayıtların `passwordHash` alanı boş olabilir; bu kullanıcılar doğrudan login olamaz.
- Böyle bir durumda yeni bir hesap açarsan, sistemde daha önce parola set edilmiş kullanıcı yoksa bu yeni hesap otomatik olarak `ADMIN` olur.

## Sık Karşılaşılan Hatalar

### `EADDRINUSE: address already in use :::3002`

3002 portu doludur.

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
kill <PID>
```

### `Cannot GET /api/users`

Backend çalışıyor olabilir ama API prefix eksik sürüm ayağa kalkmış olabilir. Güncel backend koduyla:

```bash
cd backend
pnpm start:dev
```

ve `http://localhost:3002/api/users` adresini kontrol et.

### `The table main.User does not exist`

SQLite şeması henüz oluşturulmamıştır:

```bash
cd backend
pnpm db:push
```

## Lisans

UNLICENSED
