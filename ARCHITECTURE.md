# TrackFit - Proje Mimarisi

## Genel Bakis

TrackFit, kullanicilarin antrenman programlarini olusturup gunluk egzersiz performanslarini takip etmelerini saglayan bir fitness uygulamasidir.

## Teknoloji Stack

- **Framework:** Nuxt 4
- **Styling:** Tailwind CSS v4
- **Icons:** Font Awesome 6 (CDN)
- **State:** Composables + localStorage (su an)
- **Hedef:** Drizzle ORM + PostgreSQL

---

## Veri Modelleri

### User (Kullanici)
```typescript
interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
}
```

### Exercise (Egzersiz)
```typescript
interface Exercise {
  id: string;
  name: string;           // "Bench Press", "Squat" vb.
  day: DayOfWeek;         // Hangi gun yapilacak
  notes: string;          // Coaching notlari
  targetSets: number;     // Hedef set sayisi
  targetReps: string;     // Hedef tekrar ("8-12" gibi)
  imageUrl?: string;      // Egzersiz gorseli (base64)
}
```

### WorkoutLog (Antrenman Kaydi)
```typescript
interface WorkoutLog {
  id: string;
  exerciseId: string;     // Hangi egzersiz
  date: string;           // YYYY-MM-DD format
  weight: number;         // Kaldirilan kilo (kg)
}
```

### Iliskiler
```
User (1) -----> (N) Exercise
Exercise (1) -----> (N) WorkoutLog
```

Bir kullanicinin birden fazla egzersizi olabilir.
Her egzersizin birden fazla gunluk kaydi olabilir.

---

## Sayfa Yapisi

### 1. Landing Page (`/`)
- **Layout:** auth (minimal, header/nav yok)
- **Amac:** Uygulamayi tanitma, kullaniciyi login'e yonlendirme
- **Ozellikler:**
  - Hero section (baslik + aciklama)
  - "Start Training Now" butonu
  - Ozellik listesi (No Ads, Local Data, AI Tips)

### 2. Login Page (`/login`)
- **Layout:** auth
- **Amac:** Kullanici girisi / kaydi
- **Ozellikler:**
  - Login/Register toggle
  - Email + Password formu
  - Basarili giriste `/train`'e yonlendirme

### 3. Train Page (`/train`) - ANA SAYFA
- **Layout:** default (header + bottom nav)
- **Amac:** Gunluk antrenman takibi
- **Ozellikler:**
  - **Streak Counter:** Kac gun ust uste antrenman yapildi
  - **Rest Timer:** 60 saniyelik dinlenme sayaci (manuel)
  - **Day Selector:** Haftanin gunleri (Mon-Sun)
  - **Exercise Table:**
    - Egzersiz adi
    - Hedef (3x10 gibi)
    - Onceki kilo
    - Bugunun kilosu (input)
    - PR badge (kisisel rekor)

### 4. Plan Page (`/plan`)
- **Layout:** default
- **Amac:** Antrenman programi olusturma/duzenleme
- **Ozellikler:**
  - Yeni egzersiz ekleme formu
    - Gorsel yukleme
    - Isim, gun, set/rep, notlar
  - Gunlere gore gruplanmis egzersiz listesi
  - Egzersiz silme

### 5. Stats Page (`/stats`)
- **Layout:** default
- **Amac:** Ilerleme takibi ve istatistikler
- **Ozellikler:**
  - AI Coach karti (placeholder)
  - Grafik alani (su an placeholder)
  - Egzersiz bazli son kilo listesi
  - Trend gostergesi

---

## Dosya Yapisi

```
app/
├── app.vue                 # Root component
├── assets/
│   └── css/
│       └── main.css        # Tailwind + custom utilities
├── composables/
│   └── useAppState.ts      # Global state yonetimi
├── constants/
│   └── index.ts            # DAYS, INITIAL_EXERCISES
├── layouts/
│   ├── auth.vue            # Minimal layout (landing/login)
│   └── default.vue         # Header + bottom nav
├── pages/
│   ├── index.vue           # Landing
│   ├── login.vue           # Auth
│   ├── train.vue           # Dashboard
│   ├── plan.vue            # Program yonetimi
│   └── stats.vue           # Istatistikler
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## Mevcut State Yonetimi (useAppState)

```typescript
// Fonksiyonlar
login(email, name)      // Kullanici girisi
logout()                // Cikis + state temizleme
addExercise(exercise)   // Yeni egzersiz ekle
removeExercise(id)      // Egzersiz sil
updateLog(exerciseId, weight)  // Gunluk kilo kaydet

// Computed
user        // Aktif kullanici
exercises   // Tum egzersizler
logs        // Tum antrenman kayitlari
```

**Veri Akisi:**
1. Uygulama acildiginda localStorage'dan state yuklenir
2. Her degisiklikte localStorage'a kaydedilir
3. Logout'ta localStorage temizlenir

---

## Onemli Is Mantiklari

### PR (Personal Record) Hesaplama
```typescript
const isPR = (exerciseId, weight) => {
  const historicalMax = Math.max(...logs.filter(l => l.exerciseId === exerciseId).map(l => l.weight), 0);
  return weight >= historicalMax && weight > 0;
};
```
Eger bugunun kilosu, o egzersiz icin simdi kadar kaldirilan en yuksek kiloya esit veya buyukse PR sayilir.

### Streak Hesaplama
```typescript
const streak = computed(() => {
  const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
  return uniqueDates.length;
});
```
Kayit olan benzersiz gun sayisi. (Not: Gercek streak icin ardisik gun kontrolu yapilmali)

### Onceki Kilo
```typescript
const getPreviousLog = (exerciseId) => {
  const exLogs = logs.filter(l => l.exerciseId === exerciseId && l.date !== today);
  return exLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
```
O egzersiz icin bugun haric en son girilen kilo.

---

## Drizzle + PostgreSQL Entegrasyonu Plani

### Yeni Dosya Yapisi
```
server/
├── database/
│   ├── schema.ts         # Drizzle tablo tanimlari
│   ├── index.ts          # DB baglantisi
│   └── migrations/       # SQL migration dosyalari
├── api/
│   ├── auth/
│   │   ├── login.post.ts
│   │   └── register.post.ts
│   ├── exercises/
│   │   ├── index.get.ts
│   │   ├── index.post.ts
│   │   └── [id].delete.ts
│   └── logs/
│       ├── index.get.ts
│       └── index.post.ts
└── utils/
    └── db.ts             # DB helper fonksiyonlar
```

### Degisecekler
1. `useAppState` -> API cagrilarina donusecek
2. localStorage -> PostgreSQL
3. Client-side state -> Server-side + client cache
4. ID'ler string'den UUID/serial'e donusecek

---

## UI/UX Ozellikleri

- **Tema:** Dark mode (zinc-950 background)
- **Accent:** Violet (#8b5cf6) + Emerald (#10b981)
- **Font:** System font, black weight, italic uppercase
- **Mobile-first:** max-w-md container
- **Glass effect:** Backdrop blur + transparan border
- **Animasyonlar:** Pulse, bounce, scale transitions
