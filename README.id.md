<!-- portfolio -->
<!-- slug: mcp-developer-playground -->
<!-- title: MCP Developer Playground -->
<!-- description: Asisten pengembang interaktif bertenaga MCP dengan alat analisis ruang kerja berbasis LLM dan penalaran cerdas -->
<!-- image: https://github.com/user-attachments/assets/108a0dcd-3857-4489-a3d6-5954f5f42816 -->
<!-- tags: typescript, nodejs, express, react, mcp, llm, ai-tools, asisten-developer, otomasi-workspace, vite -->

# Workspace Developer MCP (MCP Developer Workspace)

<img width="1545" height="882" alt="image" src="https://github.com/user-attachments/assets/108a0dcd-3857-4489-a3d6-5954f5f42816" />

**Asisten pengembang bertenaga AI yang secara aman mengekspos konteks proyek melalui alat MCP (Model Context Protocol) standar.**

Sistem ini mendemonstrasikan bagaimana LLM dapat berinteraksi dengan basis kode dunia nyata melalui arsitektur klien-server yang bersih, memberikan transparansi, keamanan, dan ekstensibilitas.

---

## 🎯 Fitur

- **6 Alat MCP**: Membaca file, daftar file, cari konten, metadata file, struktur direktori, statistik workspace.
- **Desain Safety-First**: Workspace dalam sandbox, perlindungan path traversal, pembatasan tingkat permintaan (rate limiting).
- **Pemanggilan Alat Transparan**: Timeline visual yang menunjukkan setiap pemanggilan alat beserta input dan outputnya.
- **Antarmuka Web Modern**: Antarmuka React + TypeScript dengan mode gelap dan desain profesional.
- **Penalaran Sederhana**: Klasifikasi niat (intent) yang memetakan bahasa alami ke pemanggilan alat.
- **Berfokus pada Pengembang**: Dirancang untuk memahami konteks proyek, bukan menjalankan perintah arbiter.

---

## 🏗️ Arsitektur

```
┌─────────────┐
│   Web UI    │  ← React + TypeScript + Vite
│  (Port 5173)│
└──────┬──────┘
       │ HTTP
┌──────▼──────┐
│ Klien MCP   │  ← Klasifikasi Niat + Pemilihan Alat
│ (Browser)   │
└──────┬──────┘
       │ HTTP POST /invoke
┌──────▼──────┐
│  Server MCP │  ← Express + Tool Registry
│  (Port 3000)│
└──────┬──────┘
       │ Akses Sandbox
┌──────▼──────┐
│  Direktori  │  ← ./workspace/* (read-only)
│  Workspace  │
└─────────────┘
```

---

## 📋 Alat MCP yang Tersedia

| Alat | Deskripsi | Input | Keamanan |
|------|-------------|-------|--------|
| `read_file` | Membaca konten file | `{ path: string }` | Batas ukuran 1MB, validasi path |
| `list_files` | Mencantumkan file dengan pola opsional | `{ directory?, pattern?, recursive? }` | Dibatasi dalam sandbox workspace |
| `search_files` | Mencari teks dalam file | `{ query, file_pattern?, case_sensitive? }` | Batas 100 hasil |
| `file_metadata` | Mendapatkan statistik file | `{ path: string }` | Operasi baca-saja |
| `directory_tree` | Struktur direktori visual | `{ depth?: number }` | Kedalaman maks 5 tingkat |
| `workspace_stats` | Statistik proyek | `{}` | Komputasi yang dicache |

---

## 🚀 Memulai

### Prasyarat

- **Node.js 20+**
- **npm 9+**

### Instalasi

1. **Install dependensi server**:
   ```bash
   npm install
   ```

2. **Install dependensi UI**:
   ```bash
   cd src/ui && npm install && cd ../..
   ```

### Menjalankan Sistem

1. **Jalankan Server MCP** (Terminal 1):
   ```bash
   npm run server
   ```
   Server berjalan di `http://localhost:3000`

2. **Jalankan Web UI** (Terminal 2):
   ```bash
   npm run ui
   ```
   UI berjalan di `http://localhost:5173`

3. **Buka browser Anda**: Navigasi ke `http://localhost:5173`

---

## 💡 Contoh Pertanyaan

Coba pertanyaan bahasa alami ini di UI:

- **"Tampilkan semua file TypeScript"** → Memanggil `list_files` dengan `pattern: "*.ts"`
- **"Baca utils.txt"** → Memanggil `read_file` dengan `path: "utils.txt"`
- **"Cari kata 'function'"** → Memanggil `search_files` dengan `query: "function"`
- **"Tampilkan pohon direktori"** → Memanggil `directory_tree`
- **"Tampilkan statistik workspace"** → Memanggil `workspace_stats`
- **"Dapatkan metadata untuk utils.txt"** → Memanggil `file_metadata`

---

## 🛠️ Struktur Proyek

```
mcp-playground/
├── src/
│   ├── server/           # Server MCP (Express + TypeScript)
│   │   ├── index.ts      # Titik masuk server, rute, middleware
│   │   ├── tools.ts      # Pendaftaran alat dan handler
│   │   ├── middleware/   # Pembatas tingkat permintaan
│   │   └── utils/        # Utilitas validasi
│   │
│   ├── client/           # Klien MCP (CLI + Penalaran)
│   │   ├── index.ts      # Titik masuk klien
│   │   └── reasoning.ts  # Klasifikasi niat
│   │
│   ├── ui/               # Web UI (React + TypeScript + Vite)
│   │   ├── src/
│   │   │   ├── components/  # Komponen React
│   │   │   ├── services/    # Klien API
│   │   │   ├── types/       # Tipe TypeScript
│   │   │   └── styles/      # CSS Global
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── types/            # Tipe TypeScript bersama
│       └── mcp.ts
│
├── workspace/            # Direktori workspace dalam sandbox
│   └── utils.txt
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Mode CLI (Opsional)

Anda juga dapat menggunakan klien MCP dari baris perintah:

```bash
npm run client -- "Tampilkan semua file TypeScript"
```

---

## 🔒 Mekanisme Keamanan

| Mekanisme | Implementasi | Tujuan |
|-----------|---------------|---------|
| **Validasi Jalur** | `validatePath()` di `utils/validation.ts` | Mencegah serangan directory traversal |
| **Batas Ukuran File** | Maks 1MB untuk operasi baca | Mencegah penipisan memori |
| **Batas Hasil** | Maks 100 hasil untuk pencarian | Mencegah serangan DoS |
| **Pembatasan Tingkat** | 100 permintaan/menit per IP | Mencegah penyalahgunaan |
| **Batas Waktu Operasi** | Eksekusi maks 5 detik | Menangani operasi yang berjalan lama |
| **Sandbox Workspace** | Akses file dibatasi ke `./workspace/` | Mencegah akses file sistem |

---

## 🎨 Fitur UI

- **Desain Mode Gelap**: Palet warna profesional yang dioptimalkan untuk pengembang.
- **Timeline Pemanggilan Alat**: Riwayat visual semua pemanggilan alat dengan ikon status.
- **Penampil Hasil Sadar-Konteks**: Rendering berbeda untuk setiap tipe alat:
  - Kode dengan penyorotan sintaks untuk `read_file`.
  - Daftar file dengan metadata untuk `list_files`.
  - Hasil pencarian dengan nomor baris untuk `search_files`.
  - Dashboard statistik untuk `workspace_stats`.
- **Prompts Contoh**: Saran awal cepat.
- **Tata Letak Responsif**: Berfungsi di desktop dan tablet.

---

## 🚧 Peningkatan Masa Depan

### Fase 2: Alat Modifikasi File
- Tambahkan `write_file`, `delete_file`, `rename_file`.
- Implementasikan dialog konfirmasi dan fungsionalitas urungkan (undo).

### Fase 3: Integrasi LLM Nyata
- Ganti penalaran berbasis kata kunci dengan API OpenAI/Anthropic/Gemini.
- Implementasikan penalaran chain-of-thought untuk pertanyaan kompleks.

### Fase 4: Integrasi IDE
- Ekstensi VS Code.
- Plugin JetBrains.
- Integrasi LSP untuk pemahaman kode yang lebih mendalam.

---

## 🧑‍💻 Pengembangan

### Menjalankan Tes (Masa Depan)
```bash
npm test                  # Tes unit
npm run test:integration  # Tes integrasi
npm run test:e2e          # Tes end-to-end
```

### Membangun untuk Produksi
```bash
cd src/ui && npm run build
```

---

## 📝 Lisensi

MIT

---

## 🙏 Ucapan Terima Kasih

Dibangun dengan inspirasi dari:
- [Anthropic's Model Context Protocol](https://modelcontextprotocol.io/)
- Cursor
- Claude Code
- Google Antigravity

---

## 🤔 Mengapa MCP?

MCP menyediakan **antarmuka standar** bagi LLM untuk berinteraksi dengan sistem eksternal secara aman:

- ✅ **Alat eksplisit** alih-alih perintah formulir bebas.
- ✅ **Input terstruktur** dengan validasi.
- ✅ **Pemisahan klien-server yang jelas**.
- ✅ **Transparansi** dalam pemanggilan alat.
- ✅ **Desain safety-first** dengan sandbox.

Proyek ini adalah **demonstrasi portofolio** yang memahami infrastruktur AI, mekanisme keamanan, dan pengembangan full-stack.

---

**Dibuat dengan 🔧 mengikuti spesifikasi dan praktik terbaik MCP dalam keamanan AI.**
