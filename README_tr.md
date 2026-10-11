# local-ai-stack

[English](README.md) · [Bahasa Indonesia](README_id.md) · [한국어](README_ko.md) · [العربية](README_ar.md) · [Español](README_es.md) · [中文](README_zh.md) · [Français](README_fr.md) · [日本語](README_ja.md) · [Deutsch](README_de.md) · [Português](README_pt.md) · [Русский](README_ru.md) · [हिन्दी](README_hi.md) · **Türkçe** · [Italiano](README_it.md) · [Tiếng Việt](README_vi.md)

<p align="center">
  <strong>Kendi özel yapay zeka yığınınızı tek komutla yerel olarak çalıştırın.</strong>
</p>

<p align="center">
  <a href="#hızlı-başlangıç">Hızlı Başlangıç</a> •
  <a href="#özellikler">Özellikler</a> •
  <a href="#hazır-ayarlar">Hazır Ayarlar</a> •
  <a href="#cli-komutları">CLI Komutları</a> •
  <a href="#api-geçidi">API Geçidi</a> •
  <a href="#örnekler">Örnekler</a> •
  <a href="#dokümantasyon">Dokümantasyon</a>
</p>

---

## Genel Bakış

`local-ai-stack`, yerel iş istasyonunuzda doğrudan tam ve özel bir yapay zeka ortamını başlatan geliştirici dostu, sürtünmesiz bir CLI ve konteyner düzenleme araç setidir.

**Docker Compose v2** tarafından desteklenen `local-ai-stack`, size saniyeler içinde yerel LLM'ler, sohbet arayüzü, vektör araması, veritabanı kalıcılığı ve OpenAI uyumlu bir API geçidi sağlar. İstemler, sohbetler ve gömülmeler makinenizde işlenir; konteyner imajlarını ve model ağırlıklarını çekmek internet bağlantısı gerektirir.

```bash
npx local-ai-stack init
npx local-ai-stack up
```

---

## Özellikler

-  **Yerel İşleme**: İstemler, sohbetler, gömülmeler ve çıkarım donanımınızda çalışır. İlk konteyner imajı çekme ve model indirme işlemleri internet erişimi gerektirir.
- ⚡ **Sıfır Kurulum Sürtünmesi**: İşletim sistemini, mimariyi, RAM'i ve GPU'yu (Apple Metal / NVIDIA CUDA) otomatik olarak algılar.
-  **Modüler Hazır Ayarlar**: Hafif bir sohbet arayüzünden (`minimal`) kurumsal bir RAG yığınına (`standard`) veya otonom bir otomasyon hattına (`full`) ölçeklendirin.
-  **OpenAI Uyumlu Geçit**: Standart OpenAI SDK'larını veya LangChain'i kod yeniden yazmadan doğrudan `http://localhost:8000/v1` adresine yönlendirin.
-  **Yerleşik Model Yöneticisi**: Yerleşik RAM/disk güvenlik uyarılarıyla modelleri çekin, listeleyin, inceleyin ve kaldırın.
-  **Kendi Kendini İyileştiren Teşhisler**: Yerleşik `doctor` komutu, sorunlarla karşılaşmadan önce port çakışmalarını, Docker daemon durumunu ve kaynak sınırlarını teşhis eder.

---

## Mimari

```
┌───────────────────────────────────────────────────────────────┐
│                  Ana Makine (CLI)                             │
│                                                               │
│   Port 3000             Port 8000           Port 5678         │
│       │                     │                   │             │
└───────┼─────────────────────┼───────────────────┼─────────────┘
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Open      │         │ API       │       │ n8n       │
  │ WebUI     │         │ Geçidi    │       │ (Full)    │
  └─────┬─────┘         └─────┬─────┘       └─────┬─────┘
        │                     │                   │
        ├─────────────────────┼───────────────────┤
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Ollama    │         │ Qdrant    │       │ Postgres  │
  │ (LLMs)    │         │ (Vektör)  │       │ (Durum)   │
  └───────────┘         └───────────┘       └───────────┘
```

---

## Hazır Ayarlar

| Hazır Ayar | Dahil Edilen Servisler | Min. RAM | Önerilen Kullanım |
|---|---|---|---|
| **`minimal`** | Ollama, Open WebUI | 8 GB | Hızlı yerel sohbet, hafif denemeler |
| **`standard`** *(varsayılan)* | Ollama, Open WebUI, PostgreSQL, Qdrant, API Geçidi | 16 GB | RAG hatları, uygulama geliştirme, OpenAI alternatifi |
| **`full`** | Standard + n8n otomasyon motoru | 16+ GB | Otonom yapay zeka ajanları, görsel iş akışı otomasyonu |

---

## Hızlı Başlangıç

### Otomatik Tek Komut Kurulumu

#### macOS ve Linux
```bash
curl -fsSL https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.sh | bash
```

#### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.ps1 | iex
```

### npx Üzerinden Manuel Hızlı Başlangıç

Ön koşullar: Node.js 22 veya sonrası, Docker ve Docker Compose v2.

#### 1. Yığını başlatın
```bash
# Donanım otomatik algılama ile etkileşimli kurulum sihirbazı
npx local-ai-stack init

# Veya seçilen hazır ayarla etkileşimsiz
npx local-ai-stack init --preset standard --yes
```

#### 2. Otomatik sağlık kontrolleriyle servisleri başlatın
```bash
npx local-ai-stack up
```

Çalışmaya başladığında yığınınıza erişin:
- **Open WebUI**: [http://localhost:3000](http://localhost:3000)
- **API Geçidi**: [http://localhost:8000](http://localhost:8000)
- **Ollama**: [http://localhost:11434](http://localhost:11434)
- **Qdrant**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard) *(eşlendiğinde)*

#### 3. Akıllı Donanım Algılama ve Model Önerileri
```bash
# RAM/VRAM'inize dayalı akıllı donanım farkındalığı önerileri alın
npx local-ai-stack model recommend

# Ön kontrol bellek ve disk güvenlik kontrolü ile model yükleyin
npx local-ai-stack model install llama3.2:3b
```

---

## CLI Komutları

| Komut | Açıklama |
|---|---|
| `local-ai-stack init` | Donanım algılama ile etkileşimli yapılandırma sihirbazını çalıştırın |
| `local-ai-stack up` | Compose yapılandırmasını doğrulayın, konteynerleri başlatın ve sağlık kontrollerini bekleyin |
| `local-ai-stack down` | Yığın konteynerlerini durdurun ve kaldırın |
| `local-ai-stack start` | Mevcut durdurulmuş konteynerleri başlatın |
| `local-ai-stack stop` | Çalışan konteynerleri durdurun |
| `local-ai-stack restart` | Yığın konteynerlerini yeniden başlatın |
| `local-ai-stack status` | Konteyner sağlığını ve URL'leri gösterin |
| `local-ai-stack logs [servis]` | Günlükleri görüntüleyin (akış için `-f`) |
| `local-ai-stack doctor` | Docker, RAM, GPU/VRAM, portları ve model önerilerini teşhis edin |
| `local-ai-stack update` | Otomatik yedekleme ve sağlık kontrolleriyle yapılandırılmış sabitlenmiş imajları yeniden çekin |
| `local-ai-stack backup` | SHA-256 bütünlük kontrolleriyle yapılandırmaları ve veri hacimlerini yedekleyin (şifrelenmemiş) |
| `local-ai-stack restore <yol>` | SHA-256 bütünlük kontrollü yedeklemeden geri yükleyin (şifrelenmemiş) |
| `local-ai-stack reset` | Yığını sıfırlayın (`--delete-data` belirtilmedikçe hacimleri korur) |
| `local-ai-stack config` | Etkin yapılandırmayı inceleyin veya düzenleyin |
| `local-ai-stack model list` | İndirilen modelleri listeleyin |
| `local-ai-stack model recommend` | Donanıma özel model önerileri (RAM, VRAM, Disk) |
| `local-ai-stack model install <isim>` | Ön kontrol kaynak güvenlik kontrolleriyle yeni model çekin |
| `local-ai-stack model remove <isim>` | Yüklenmiş modeli silin |
| `local-ai-stack model status` | Model kaynak ayak izlerini inceleyin |

İmajlar açık sürümlere sabitlenmiştir. `local-ai-stack update` yapılandırılmış sürümleri yeniler; daha yeni sürümleri seçmez. Daha yeni bir CLI yükledikten sonra, yalnızca CLI'nin eski varsayılan imaj etiketlerini taşımak için `local-ai-stack update --upgrade-images` komutunu çalıştırın. Özel imaj değerleri korunur.

---

## API Geçidi

API Geçidi, hazır OpenAI REST uç noktaları sağlar:

`/v1/*` uç noktasını çağırmadan önce `LOCAL_AI_API_KEY`'i oluşturulan `API_SECRET_KEY`'e ayarlayın.

Geçit, kaynak IP başına kimlik doğrulaması yapılmış `/v1/*` isteklerini varsayılan olarak dakikada 120 istekle sınırlar. Yerel istemciniz farklı sınırlar gerektiriyorsa `.env` dosyasında `RATE_LIMIT_MAX_REQUESTS` ve `RATE_LIMIT_WINDOW_MS`'yi yapılandırın.

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOCAL_AI_API_KEY" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      { "role": "user", "content": "Özel yerel yapay zeka yığınımdan merhaba!" }
    ]
  }'
```

### Resmi OpenAI Node.js SDK ile Kullanım
```typescript
import OpenAI from 'openai';

const apiKey = process.env.LOCAL_AI_API_KEY;
if (!apiKey) {
  throw new Error('LOCAL_AI_API_KEY\'i oluşturulan API_SECRET_KEY\'inize ayarlayın.');
}

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey,
});

const completion = await openai.chat.completions.create({
  model: 'llama3.2:3b',
  messages: [{ role: 'user', content: 'Kuantum hesaplamayı bir cümlede açıklayın.' }],
});

console.log(completion.choices[0].message.content);
```

---

## Örnekler

- [`examples/openai-compat/`](./examples/openai-compat): Hazır OpenAI SDK entegrasyon betiği.
- [`examples/rag-example/`](./examples/rag-example): Qdrant vektör veritabanı ve Ollama gömülmeleri kullanan uçtan uca RAG hattı.

---

## Dokümantasyon

- [Mimari Genel Bakış](./docs/architecture.md)
- [API Geçidi Referansı](./docs/api-reference.md)
- [Yapılandırma Kılavuzu](./docs/configuration.md)
- [GPU Hızlandırma Kurulumu (Metal / CUDA)](./docs/gpu-setup.md)
- [Sorun Giderme ve Teşhisler](./docs/troubleshooting.md)

---

## Katkıda Bulunma

Katkılar hoş karşılanır! Başlamak için [CONTRIBUTING.md](./CONTRIBUTING.md)'ye göz atın.

## Lisans

[MIT](./LICENSE) © 2026 local-ai-stack katkıda bulunanları
