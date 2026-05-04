# Lüğət AZ — Azərbaycan Dili Lüğəti

Next.js 15 + Turso (SQLite) ilə qurulmuş Azərbaycan dili lüğəti.

## Xüsusiyyətlər
- 📚 Sözlər siyahısı (axtarış + kateqoriya filtri)
- 📖 Söz detail səhifəsi (tərif, nümunə, sinonim)
- 🔐 Admin paneli (söz əlavə/düzəliş/silmə)
- ☁️ Vercel + Turso ilə tamamilə serverless

---

## 1. Node.js Quraşdırma

https://nodejs.org saytından LTS versiyasını yükləyin və quraşdırın.

---

## 2. Turso Quraşdırma

### a) Hesab açın
https://turso.tech saytında pulsuz hesab açın.

### b) Turso CLI quraşdırın
```bash
winget install ChiselStrike.turso
```
və ya PowerShell-də:
```powershell
iwr https://get.tur.so/dev/windows | iex
```

### c) Giriş edin
```bash
turso auth login
```

### d) Database yaradın
```bash
turso db create luget-db
```

### e) Credentials əldə edin
```bash
turso db show luget-db --url
turso db tokens create luget-db
```

### f) .env.local faylını doldurun
```
TURSO_DATABASE_URL=libsql://luget-db-<username>.turso.io
TURSO_AUTH_TOKEN=<token>
ADMIN_PASSWORD=sizin-şifrəniz
JWT_SECRET=uzun-random-string
```

---

## 3. Lokal İşlətmə

```bash
npm install
npm run dev
```

Sonra http://localhost:3000/api/init ünvanına GET sorğusu göndərin (brauzer ilə açmaq kifayətdir) — bu database cədvəllərini yaradacaq.

---

## 4. Vercel Deploy

### a) Vercel CLI
```bash
npm i -g vercel
vercel
```

### b) Environment Variables
Vercel dashboard → Settings → Environment Variables bölməsinə:
```
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
ADMIN_PASSWORD
JWT_SECRET
```

### c) DB Init
Deploy etdikdən sonra `https://your-site.vercel.app/api/init` ünvanına bir dəfə daxil olun.

---

## Admin Panel

- URL: `/admin`
- Default şifrə: `.env.local`-da `ADMIN_PASSWORD` dəyəri
