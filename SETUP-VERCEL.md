# 🚀 SETUP NOTEHUB PER VERCEL

## Prerequisiti
- Node.js 20+ 
- Account GitHub
- Account Vercel
- Account Supabase (già configurato)

---

## 📋 CONFIGURAZIONE LOCALE (Sviluppo)

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura Variabili Ambiente
Le credenziali Supabase sono già nel file `.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `ADMIN_EMAIL`
- ✅ Placeholder `ADMIN_PASSWORD_HASH`

### 3. Genera Password Hash Reale
Prima di continuare, genera il vero hash della password admin:

```bash
npm run generate-password-hash
```

Quando viene chiesto, inserisci una password admin forte.

Copia l'output (es: `$2a$10$...`) e aggiorna `.env.local`:
```
ADMIN_PASSWORD_HASH=<paste_hash_here>
```

### 4. Avvia il Server di Sviluppo
```bash
npm run dev
```

Visita: http://localhost:3000

### 5. Accedi all'Admin
- URL: http://localhost:3000/admin/login
- Email: `admin@notehub.local`
- Password: usa la password admin forte scelta da voi

---

## 🌐 DEPLOY SU VERCEL

### Prerequisiti Vercel
1. Crea account su https://vercel.com
2. Collega il tuo repository GitHub

### Step 1: Push su GitHub
```bash
git add .
git commit -m "Refactor: Modern UI, JWT auth, Vercel-ready"
git push origin main
```

### Step 2: Importa Progetto in Vercel
1. Vai su https://vercel.com/dashboard
2. Clicca "Add New Project"
3. Seleziona il repository `notehub`
4. Vercel rileverà automaticamente `next.js`

### Step 3: Configura Variabili Ambiente su Vercel
Nel dashboard di Vercel, vai in **Settings → Environment Variables** e aggiungi:

#### Variabili Pubbliche (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_APP_URL=https://notehub-your-username.vercel.app
```

#### Variabili Private (Segrete)
```
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
JWT_SECRET=<long_random_secret_32_chars>
SESSION_SECRET=<long_random_secret_32_chars>
ADMIN_EMAIL=admin@notehub.local
ADMIN_PASSWORD_HASH=$2a$10$...
```

### Step 4: Configura Build
Vercel rileverà automaticamente:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 20.x

✅ Nessuna modifica necessaria - funziona out-of-the-box!

### Step 5: Deploy
1. Clicca "Deploy"
2. Attendi il build (circa 2-3 minuti)
3. Visita la URL pubblica quando pronto

---

## 🔒 SICUREZZA POST-DEPLOY

### Proteggere le Credenziali
- ❌ Non commitare `.env.local`
- ✅ Usa Vercel Environment Variables per secrets
- ✅ Tutte le chiavi JWT sono rotated automatically

### Test Accesso Admin
```bash
curl -X POST https://notehub-your-url.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@notehub.local","password":"<password-admin-forte>"}'
```

---

## 🐛 TROUBLESHOOTING

### Errore: "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs --save
npm run build
```

### Errore: "Unauthorized" su Vercel
- Verifica che `ADMIN_PASSWORD_HASH` sia corretto in Vercel
- Usa il generator locale: `npm run generate-password-hash`

### Errore: "NEXT_PUBLIC_SUPABASE_URL is required"
- Aggiungi le variabili Supabase in Vercel Environment Variables
- Vanno configurate sia in production che in preview

### Errore: Build fallisce
```bash
# Pulisci cache locale
rm -rf .next
npm ci
npm run build
```

---

## 📱 FUNZIONALITÀ TESTATE

✅ Homepage con ricerca e filtri
✅ Upload file con Supabase Storage
✅ Admin login con JWT authentication
✅ Dashboard admin per gestire materie/professori
✅ Dark mode support
✅ Responsive mobile design
✅ Build Next.js ottimizzato per Vercel

---

## 🔄 FUTURE FEATURES (FASE 2)

- [ ] Google Drive API integration
- [ ] Role-based access control
- [ ] File versioning
- [ ] Advanced analytics
- [ ] Email notifications

---

## 📞 SUPPORTO

Se riscontri problemi:
1. Verifica i log su Vercel: `Deployments → Logs`
2. Controlla le variabili environment: `Settings → Environment Variables`
3. Esegui un test locale: `npm run build && npm run start`

---

**Ultima modifica**: Aprile 2026
**Versione**: 2.0.0 (Production-Ready)
