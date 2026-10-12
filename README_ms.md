# pondok-ai

Dahulunya diterbitkan sebagai local-ai-stack. Pondok ialah perkataan bahasa Indonesia yang bermaksud tempat penginapan atau perlindungan kecil.

**English** · [Bahasa Indonesia](README_id.md) · [한국어](README_ko.md) · [العربية](README_ar.md) · [Español](README_es.md) · [中文](README_zh.md) · [Français](README_fr.md) · [日本語](README_ja.md) · [Deutsch](README_de.md) · [Português](README_pt.md) · [Русский](README_ru.md) · [हिन्दी](README_hi.md) · [Türkçe](README_tr.md) · [Italiano](README_it.md) · [Tiếng Việt](README_vi.md)

Terjemahan dijana secara automatik dan mungkin tidak dikemas kini seiring dengan README bahasa Inggeris.

<p align="center">
  <strong>Jalankan persekitaran AI peribadi anda sendiri secara setempat dengan satu arahan.</strong>
</p>

<p align="center">
  <a href="#mula-pantas">Mula Pantas</a> •
  <a href="#ciri-ciri">Ciri-ciri</a> •
  <a href="#pratetapan">Pratetapan</a> •
  <a href="#arahan-cli">Arahan CLI</a> •
  <a href="#gerbang-api">Gerbang API</a> •
  <a href="#contoh">Contoh</a> •
  <a href="#dokumentasi">Dokumentasi</a>
</p>

---

## Gambaran Keseluruhan

`pondok-ai` ialah kit alat CLI dan penyelarasan kontena yang mesra pembangun serta mudah digunakan, untuk menyediakan persekitaran AI peribadi yang lengkap terus pada komputer tempatan anda.

Dikuasakan oleh **Docker Compose v2**, `pondok-ai` menyediakan LLM setempat, UI sembang, carian vektor, penyimpanan pangkalan data dan gerbang API yang serasi dengan OpenAI dalam beberapa saat. Prompt, sembang dan embedding diproses pada komputer anda; memuat turun imej kontena dan pemberat model memerlukan sambungan internet.

```bash
npx pondok-ai init
npx pondok-ai up
```

---

## Ciri-ciri

- **Pemprosesan Setempat**: Prompt, sembang, embedding dan inferens dijalankan menggunakan perkakasan anda. Muat turun awal imej kontena dan model memerlukan sambungan internet.
- ⚡ **Persediaan Mudah**: Mengesan sistem pengendalian, seni bina, RAM dan GPU (Apple Metal / NVIDIA CUDA) secara automatik.
- **Pratetapan Modular**: Pilih daripada antara muka sembang ringan (`minimal`), susunan RAG (`standard`) atau aliran kerja automasi autonomi (`full`).
- **Gerbang Serasi dengan OpenAI**: Sambungkan SDK OpenAI standard atau LangChain terus ke `http://localhost:8000/v1` tanpa perlu menulis semula kod.
- **Pengurus Model Terbina Dalam**: Muat turun, senaraikan, periksa dan buang model, dengan amaran keselamatan berkaitan penggunaan RAM dan ruang cakera.
- **Diagnostik Terbina Dalam**: Arahan `doctor` memeriksa pertindihan port, status daemon Docker dan had sumber sebelum masalah berlaku.

---

## Seni Bina

```
┌───────────────────────────────────────────────────────────────┐
│                      Host Machine (CLI)                       │
│                                                               │
│   Port 3000                 Port 8000           Port 5678     │
│       │                         │                   │         │
└───────┼─────────────────────────┼───────────────────┼─────────┘
        ▼                         ▼                   ▼
  ┌───────────┐             ┌───────────┐       ┌───────────┐
  │ Open      │             │ API       │       │ n8n       │
  │ WebUI     │             │ Gateway   │       │ (Full)    │
  └─────┬─────┘             └─────┬─────┘       └─────┬─────┘
        │                         │                   │
        ├─────────────────────────┼───────────────────┤
        ▼                         ▼                   ▼
  ┌───────────┐             ┌───────────┐       ┌───────────┐
  │ Ollama    │             │ Qdrant    │       │ Postgres  │
  │ (LLMs)    │             │ (Vector)  │       │ (State)   │
  └───────────┘             └───────────┘       └───────────┘
```

---

## Pratetapan

| Pratetapan | Perkhidmatan yang Disertakan | RAM Minimum | Disyorkan Untuk |
|---|---|---|---|
| **`minimal`** | Ollama, Open WebUI | 8 GB | Sembang setempat pantas dan percubaan ringan |
| **`standard`** *(lalai)* | Ollama, Open WebUI, PostgreSQL, Qdrant, API Gateway | 16 GB | Aliran kerja RAG, pembangunan aplikasi dan pengganti OpenAI |
| **`full`** | Standard + enjin automasi n8n | 16+ GB | Ejen AI autonomi dan automasi aliran kerja secara visual |

---

## Mula Pantas

### Mula Pantas melalui npx

Prasyarat: Node.js 22 atau lebih baharu, Docker dan Docker Compose v2.

#### 1. Mulakan konfigurasi persekitaran
```bash
# Interactive setup wizard with hardware auto-detection
npx pondok-ai init

# Or non-interactive with a chosen preset
npx pondok-ai init --preset standard --yes
```

#### 2. Mulakan perkhidmatan dengan pemeriksaan kesihatan automatik
```bash
npx pondok-ai up
```

Selepas perkhidmatan berjalan, akses persekitaran anda melalui:
- **Open WebUI**: [http://localhost:3000](http://localhost:3000)
- **Gerbang API**: [http://localhost:8000](http://localhost:8000)
- **Ollama**: [http://localhost:11434](http://localhost:11434)
- **Qdrant**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard) *(jika pemetaan port dikonfigurasikan)*

#### 3. Pengesanan Perkakasan Pintar dan Cadangan Model
```bash
# Get smart hardware-aware recommendations based on your RAM/VRAM
npx pondok-ai model recommend

# Install model with pre-flight memory and disk safety check
npx pondok-ai model install llama3.2:3b
```

### Skrip pemasang (eksperimen, tidak diliputi oleh CI)

#### macOS & Linux
```bash
curl -fsSL https://raw.githubusercontent.com/rasidi3112/pondok-ai/main/scripts/install.sh | bash
```

#### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/rasidi3112/pondok-ai/main/scripts/install.ps1 | iex
```

---

## Arahan CLI

| Arahan | Penerangan |
|---|---|
| `pondok-ai init` | Jalankan wizard konfigurasi interaktif dengan pengesanan perkakasan |
| `pondok-ai up` | Sahkan konfigurasi Compose, mulakan kontena dan tunggu pemeriksaan kesihatan selesai |
| `pondok-ai down` | Hentikan dan buang kontena dalam persekitaran |
| `pondok-ai start` | Mulakan kontena sedia ada yang telah dihentikan |
| `pondok-ai stop` | Hentikan kontena yang sedang berjalan |
| `pondok-ai restart` | Mulakan semula kontena |
| `pondok-ai status` | Paparkan status kesihatan kontena dan URL |
| `pondok-ai logs [service]` | Lihat log (`-f` untuk memaparkan log secara berterusan) |
| `pondok-ai doctor` | Diagnosis Docker, RAM, GPU/VRAM, port dan cadangan model |
| `pondok-ai update` | Muat turun semula imej yang versinya telah ditetapkan, dengan sandaran dan pemeriksaan kesihatan automatik |
| `pondok-ai backup` | Sandarkan konfigurasi dan volum data dengan pemeriksaan integriti SHA-256 (tidak disulitkan) |
| `pondok-ai restore <path>` | Pulihkan daripada sandaran yang integritinya disahkan menggunakan SHA-256 (tidak disulitkan) |
| `pondok-ai reset` | Tetapkan semula persekitaran (volum dikekalkan kecuali `--delete-data` ditentukan) |
| `pondok-ai config` | Periksa atau edit konfigurasi aktif |
| `pondok-ai model list` | Senaraikan model yang telah dimuat turun |
| `pondok-ai model recommend` | Cadangan model berdasarkan perkakasan (RAM, VRAM, ruang cakera) |
| `pondok-ai model install <name>` | Muat turun model baharu selepas pemeriksaan keselamatan sumber terlebih dahulu |
| `pondok-ai model remove <name>` | Padam model yang telah dipasang |
| `pondok-ai model status` | Periksa penggunaan sumber oleh model |

Versi imej ditetapkan secara khusus. `pondok-ai update` mengemas kini imej mengikut versi yang telah dikonfigurasikan; arahan ini tidak memilih keluaran yang lebih baharu secara automatik. Selepas memasang CLI yang lebih baharu, jalankan `pondok-ai update --upgrade-images` untuk menaik taraf hanya tag imej lalai lama milik CLI. Nilai imej tersuai akan dikekalkan.

---

## Gerbang API

Gerbang API menyediakan titik akhir REST OpenAI yang boleh digunakan terus:

Tetapkan `PONDOK_AI_API_KEY` kepada nilai `API_SECRET_KEY` yang dijana sebelum memanggil titik akhir `/v1/*`.

Secara lalai, gerbang ini mengehadkan permintaan `/v1/*` yang disahkan kepada 120 permintaan seminit bagi setiap klien (berdasarkan alamat IP sumber dan kunci API). Konfigurasikan `RATE_LIMIT_MAX_REQUESTS` dan `RATE_LIMIT_WINDOW_MS` dalam `.env` jika klien setempat anda memerlukan had yang berbeza.

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PONDOK_AI_API_KEY" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      { "role": "user", "content": "Hello from pondok-ai!" }
    ]
  }'
```

### Menggunakan SDK Node.js OpenAI Rasmi
```typescript
import OpenAI from 'openai';

const apiKey = process.env.PONDOK_AI_API_KEY;
if (!apiKey) {
  throw new Error('Set PONDOK_AI_API_KEY to your generated API_SECRET_KEY.');
}

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey,
});

const completion = await openai.chat.completions.create({
  model: 'llama3.2:3b',
  messages: [{ role: 'user', content: 'Explain quantum computing in one sentence.' }],
});

console.log(completion.choices[0].message.content);
```

---

## Contoh

- [`examples/openai-compat/`](./examples/openai-compat): Skrip integrasi SDK OpenAI yang boleh digunakan terus.
- [`examples/rag-example/`](./examples/rag-example): Aliran kerja RAG menyeluruh menggunakan pangkalan data vektor Qdrant dan embedding Ollama.

---

## Diuji dalam CI

Setiap permintaan tarik menjalankan ujian menyeluruh melalui GitHub Actions (amd64 dan arm64): init, up, memuat turun model yang sangat kecil (smollm:135m, kira-kira 90 MB), menyenaraikannya melalui `/v1/models`, membuat permintaan `/v1/chat/completions` tanpa penstriman, menguji had kadar (401 dan 429), serta memastikan halaman permulaan Open WebUI memberikan respons. Perkara yang belum diliputi: respons penstriman, embedding, pecutan GPU dan hos macOS/Windows.

---

## Batasan yang Diketahui

- Belum diuji pada hos macOS atau Windows sebenar. Pada Apple Silicon, kontena Docker tidak dapat menggunakan GPU dan `pondok-ai` menjalankan Ollama di dalam Docker, jadi inferens hanya menggunakan CPU.
- Pecutan GPU tidak diliputi oleh CI.
- Respons penstriman dan embedding masih belum diliputi oleh CI.
- Saiz imej besar (beberapa GB). Pastikan ruang cakera kosong mencukupi; ruang kerja awan 32 GB yang mempunyai baki 19 GB kehabisan ruang ketika mengekstrak imej Ollama.

---

## Dokumentasi

- [Gambaran Keseluruhan Seni Bina](./docs/architecture.md)
- [Rujukan Gerbang API](./docs/api-reference.md)
- [Panduan Konfigurasi](./docs/configuration.md)
- [Persediaan Pecutan GPU (Metal / CUDA)](./docs/gpu-setup.md)
- [Penyelesaian Masalah dan Diagnostik](./docs/troubleshooting.md)

---

## Sumbangan

Sumbangan dialu-alukan! Rujuk [CONTRIBUTING.md](./CONTRIBUTING.md) untuk bermula.

## Lesen

[MIT](./LICENSE) © 2026 penyumbang pondok-ai
