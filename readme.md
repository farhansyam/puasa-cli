# 🌙 puasa-cli

CLI untuk cek jadwal sahur & buka puasa langsung dari terminal. Made in Indonesia 🇮🇩

## Penggunaan

```bash
npx puasa-cli <nama-kota>
```

Contoh:
```bash
npx puasa-cli bogor
npx puasa-cli jakarta
npx puasa-cli bandung
npx puasa-cli surabaya
```

## Fitur

- 📅 Jadwal sahur & buka puasa hari ini
- ⏳ Countdown waktu buka puasa
- 🗓️ Info hari ke berapa puasa + tanggal Hijriyah
- 💬 Ucapan Ramadan random
- 📍 Support semua kota di Indonesia (dan dunia!)

## Install Global (opsional)

```bash
npm install -g puasa-cli
puasa-cli bogor
```

## Data

- Koordinat kota dari [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)
- Jadwal sholat dari [Aladhan API](https://aladhan.com/prayer-times-api) (metode Kemenag Indonesia)

## Lisensi

MIT