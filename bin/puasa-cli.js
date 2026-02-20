#!/usr/bin/env node

const https = require('https');

// ─── UCAPAN RAMADAN RANDOM ───────────────────────────────────────────────────
const ucapan = [
    "Ramadan Kareem! Semoga ibadah puasamu diterima Allah SWT 🤲",
    "Sabar dan ikhlas, sebentar lagi buka! 💪",
    "Makan sahur yang cukup ya, biar kuat seharian! 🍚",
    "Puasa bukan cuma menahan lapar, tapi juga menjaga hati ❤️",
    "Semangat! Setiap detik puasa adalah pahala 🌟",
    "Ramadan adalah bulan penuh berkah, manfaatkan sebaik mungkin ✨",
    "Jangan lupa perbanyak doa di bulan mulia ini 🙏",
    "Berbagi takjil itu sunnah, yuk berbagi! 🍉",
];

// ─── HELPER: HTTP GET ─────────────────────────────────────────────────────────
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'puasa-cli/1.0.0 (npm package; ramadan prayer times)',
                'Accept': 'application/json',
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) {
                    reject(new Error(`Gagal parse response (status: ${res.statusCode})`));
                }
            });
        }).on('error', reject);
    });
}

// ─── HELPER: FORMAT WAKTU ────────────────────────────────────────────────────
function formatWaktu(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── HELPER: COUNTDOWN ───────────────────────────────────────────────────────
function hitungCountdown(timeStr) {
    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    const diff = target - now;
    if (diff < 0) return null;
    const jam = Math.floor(diff / 3600000);
    const menit = Math.floor((diff % 3600000) / 60000);
    return `${jam > 0 ? jam + 'j ' : ''}${menit}m`;
}

// ─── HELPER: HIJRI DATE ──────────────────────────────────────────────────────
function getHariRamadan(hijriDay) {
    return hijriDay;
}

// ─── ASCII ART ───────────────────────────────────────────────────────────────
function printBanner() {
    const art = `
██████╗ ██╗   ██╗ █████╗ ███████╗ █████╗
██╔══██╗██║   ██║██╔══██╗██╔════╝██╔══██╗
██████╔╝██║   ██║███████║███████╗███████║
██╔═══╝ ██║   ██║██╔══██║╚════██║██╔══██║
██║     ╚██████╔╝██║  ██║███████║██║  ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`;
    console.log('\x1b[33m' + art + '\x1b[0m');
    console.log('\x1b[32m  🌙 puasa-cli — Jadwal Sahur & Buka Puasa Indonesia\x1b[0m');
    console.log('\x1b[90m  Sahur • Buka • Ramadan\x1b[0m\n');
}

// ─── WARNA ───────────────────────────────────────────────────────────────────
const warna = {
    reset: '\x1b[0m',
    kuning: '\x1b[33m',
    hijau: '\x1b[32m',
    biru: '\x1b[34m',
    merah: '\x1b[31m',
    abu: '\x1b[90m',
    tebal: '\x1b[1m',
    cyan: '\x1b[36m',
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
    const kota = process.argv[2];

    if (!kota) {
        console.log('\n\x1b[31m  ✗ Masukkan nama kota!\x1b[0m');
        console.log('\x1b[90m  Contoh: npx puasa-cli bogor\x1b[0m\n');
        process.exit(1);
    }

    printBanner();
    console.log(`\x1b[90m  Mengambil data untuk "${kota}"...\x1b[0m\n`);

    try {
        // 1. Geocoding: nama kota → koordinat
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kota)}&format=json&limit=1`;
        const geoData = await httpGet(geoUrl);

        if (!geoData || geoData.length === 0) {
            console.log(`\x1b[31m  ✗ Kota "${kota}" tidak ditemukan.\x1b[0m\n`);
            process.exit(1);
        }

        const { lat, lon, display_name } = geoData[0];

        // 2. Jadwal sholat dari Aladhan API
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const prayerUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=11`;
        const prayerData = await httpGet(prayerUrl);

        const timings = prayerData.data.timings;
        const hijri = prayerData.data.date.hijri;
        const gregorian = prayerData.data.date.gregorian;

        const sahur = formatWaktu(timings.Fajr);
        const buka = formatWaktu(timings.Maghrib);

        const hariRamadan = parseInt(hijri.day);
        const bulanHijri = hijri.month.en;
        const tahunHijri = hijri.year;
        const tanggalMilad = gregorian.date; // DD-MM-YYYY

        // Status & countdown
        const now = new Date();
        const [maghribH, maghribM] = timings.Maghrib.split(':').map(Number);
        const [fajrH, fajrM] = timings.Fajr.split(':').map(Number);

        const maghribTime = new Date(now); maghribTime.setHours(maghribH, maghribM, 0, 0);
        const fajrTime = new Date(now); fajrTime.setHours(fajrH, fajrM, 0, 0);

        let status, berikutnya, countdownStr;

        if (now < fajrTime) {
            status = `${warna.kuning}⏳ Sahur masih tersisa${warna.reset}`;
            countdownStr = hitungCountdown(timings.Fajr);
            berikutnya = `Sahur berakhir dalam ${warna.kuning}${countdownStr}${warna.reset}`;
        } else if (now < maghribTime) {
            status = `${warna.hijau}✅ Sedang berpuasa${warna.reset}`;
            countdownStr = hitungCountdown(timings.Maghrib);
            berikutnya = `Buka puasa dalam ${warna.kuning}${countdownStr}${warna.reset}`;
        } else {
            status = `${warna.biru}🍽️  Sudah buka puasa${warna.reset}`;
            berikutnya = `Selamat berbuka! Jangan lupa sahur besok 😄`;
        }

        // ─── OUTPUT ────────────────────────────────────────────────────────────
        const garis = warna.abu + '  ' + '─'.repeat(58) + warna.reset;

        console.log(`  ${warna.tebal}Jadwal Hari Ini${warna.reset}`);
        console.log(`  📍 ${warna.cyan}${display_name.split(',').slice(0, 2).join(',').trim()}${warna.reset}\n`);

        console.log(garis);
        console.log(`  ${warna.abu}Puasa ke   Sahur        Buka          Tanggal${warna.reset}`);
        console.log(garis);
        console.log(
            `  ${warna.kuning}${String(hariRamadan).padEnd(10)}${warna.reset}` +
            `${warna.hijau}${sahur.padEnd(13)}${warna.reset}` +
            `${warna.merah}${buka.padEnd(14)}${warna.reset}` +
            `${warna.abu}${tanggalMilad}${warna.reset}`
        );
        console.log(garis);

        console.log(`\n  ${warna.abu}Hijriyah   : ${warna.reset}${hariRamadan} ${bulanHijri} ${tahunHijri} H`);
        console.log(`  ${warna.abu}Status     : ${warna.reset}${status}`);
        console.log(`  ${warna.abu}Berikutnya : ${warna.reset}${berikutnya}`);

        // Ucapan random
        const randomUcapan = ucapan[Math.floor(Math.random() * ucapan.length)];
        console.log(`\n  ${warna.kuning}💬 ${randomUcapan}${warna.reset}\n`);

    } catch (err) {
        console.log(`\x1b[31m  ✗ Error: ${err.message}\x1b[0m`);
        console.log(`\x1b[90m  Cek koneksi internet kamu.\x1b[0m\n`);
        process.exit(1);
    }
}

main();