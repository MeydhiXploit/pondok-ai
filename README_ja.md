# local-ai-stack

[English](README.md) · [Bahasa Indonesia](README_id.md) · [한국어](README_ko.md) · [العربية](README_ar.md) · [Español](README_es.md) · [中文](README_zh.md) · [Français](README_fr.md) · **日本語** · [Deutsch](README_de.md) · [Português](README_pt.md) · [Русский](README_ru.md) · [हिन्दी](README_hi.md) · [Türkçe](README_tr.md) · [Italiano](README_it.md) · [Tiếng Việt](README_vi.md)

<p align="center">
  <strong>1つのコマンドで独自のプライベートAIスタックをローカルで実行できます。</strong>
</p>

<p align="center">
  <a href="#クイックスタート">クイックスタート</a> •
  <a href="#機能">機能</a> •
  <a href="#プリセット">プリセット</a> •
  <a href="#cliコマンド">CLIコマンド</a> •
  <a href="#apiゲートウェイ">APIゲートウェイ</a> •
  <a href="#例">例</a> •
  <a href="#ドキュメント">ドキュメント</a>
</p>

---

## 概要

`local-ai-stack`は、開発者に優しい、摩擦ゼロのCLIおよびコンテナオーケストレーションツールキットで、ローカルワークステーション上で完全なプライベートAI環境を直接起動します。

**Docker Compose v2**を搭載し、`local-ai-stack`は数秒でローカルLLM、チャットUI、ベクトル検索、データベース永続化、OpenAI互換APIゲートウェイを提供します。プロンプト、チャット、埋め込みはマシン上で処理されます。コンテナイメージとモデルウェイトのプルにはインターネット接続が必要です。

```bash
npx local-ai-stack init
npx local-ai-stack up
```

---

## 機能

-  **ローカル処理**:プロンプト、チャット、埋め込み、推論はハードウェア上で実行されます。初回のコンテナイメージプルとモデルダウンロードにはインターネットアクセスが必要です。
- ⚡ **ゼロセットアップ摩擦**:OS、アーキテクチャ、RAM、GPU(Apple Metal / NVIDIA CUDA)を自動検出します。
-  **モジュラープリセット**:軽量チャットインターフェース(`minimal`)からエンタープライズRAGスタック(`standard`)、自律自動化パイプライン(`full`)までスケールします。
-  **OpenAI互換ゲートウェイ**:標準のOpenAI SDKまたはLangChainを`http://localhost:8000/v1`に直接向け、コードの書き換えは不要です。
-  **組み込みモデルマネージャー**:組み込みのRAM/ディスク安全警告付きでモデルをプル、リスト、検査、削除します。
-  **自己修復診断**:組み込みの`doctor`コマンドが、問題に遭遇する前にポート衝突、Dockerデーモンステータス、リソース制限を診断します。

---

## アーキテクチャ

```
┌───────────────────────────────────────────────────────────────┐
│                  ホストマシン (CLI)                            │
│                                                               │
│   ポート 3000           ポート 8000         ポート 5678        │
│       │                     │                   │             │
└───────┼─────────────────────┼───────────────────┼─────────────┘
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Open      │         │ API       │       │ n8n       │
  │ WebUI     │         │ ゲートウェイ│       │ (Full)    │
  └─────┬─────┘         └─────┬─────┘       └─────┬─────┘
        │                     │                   │
        ├─────────────────────┼───────────────────┤
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Ollama    │         │ Qdrant    │       │ Postgres  │
  │ (LLMs)    │         │ (ベクトル)│       │ (状態)    │
  └───────────┘         └───────────┘       └───────────┘
```

---

## プリセット

| プリセット | 含まれるサービス | 最小RAM | 推奨用途 |
|---|---|---|---|
| **`minimal`** | Ollama, Open WebUI | 8 GB | クイックローカルチャット、軽量実験 |
| **`standard`** *(デフォルト)* | Ollama, Open WebUI, PostgreSQL, Qdrant, APIゲートウェイ | 16 GB | RAGパイプライン、アプリ開発、OpenAI代替 |
| **`full`** | Standard + n8n自動化エンジン | 16+ GB | 自律AIエージェント、ビジュアルワークフロー自動化 |

---

## クイックスタート

### 自動ワンコマンドインストール

#### macOSとLinux
```bash
curl -fsSL https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.sh | bash
```

#### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.ps1 | iex
```

### npx経由の手動クイックスタート

前提条件:Node.js 22以降、Docker、およびDocker Compose v2。

#### 1. スタックを初期化
```bash
# ハードウェア自動検出付きインタラクティブセットアップウィザード
npx local-ai-stack init

# または選択したプリセットで非インタラクティブ
npx local-ai-stack init --preset standard --yes
```

#### 2. 自動ヘルスチェック付きでサービスを起動
```bash
npx local-ai-stack up
```

実行中は、スタックにアクセスします:
- **Open WebUI**: [http://localhost:3000](http://localhost:3000)
- **APIゲートウェイ**: [http://localhost:8000](http://localhost:8000)
- **Ollama**: [http://localhost:11434](http://localhost:11434)
- **Qdrant**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard) *(マップ時)*

#### 3. スマートハードウェア検出とモデル推奨
```bash
# RAM/VRAMに基づくスマートなハードウェア対応推奨を取得
npx local-ai-stack model recommend

# プリフライトメモリとディスク安全チェック付きでモデルをインストール
npx local-ai-stack model install llama3.2:3b
```

---

## CLIコマンド

| コマンド | 説明 |
|---|---|
| `local-ai-stack init` | ハードウェア検出付きインタラクティブ構成ウィザードを実行 |
| `local-ai-stack up` | Compose構成を検証し、コンテナを起動し、ヘルスチェックを待機 |
| `local-ai-stack down` | スタックコンテナを停止して削除 |
| `local-ai-stack start` | 既存の停止したコンテナを起動 |
| `local-ai-stack stop` | 実行中のコンテナを停止 |
| `local-ai-stack restart` | スタックコンテナを再起動 |
| `local-ai-stack status` | コンテナの健全性とURLを表示 |
| `local-ai-stack logs [サービス]` | ログを表示(`-f`でストリーム) |
| `local-ai-stack doctor` | Docker、RAM、GPU/VRAM、ポート、モデル推奨を診断 |
| `local-ai-stack update` | 構成されたピン留めイメージを自動バックアップとヘルスチェック付きで再プル |
| `local-ai-stack backup` | SHA-256整合性チェック付きで構成とデータボリュームをバックアップ(暗号化なし) |
| `local-ai-stack restore <パス>` | SHA-256整合性チェック済みバックアップから復元(暗号化なし) |
| `local-ai-stack reset` | スタックをリセット(`--delete-data`が指定されない限りボリュームを保持) |
| `local-ai-stack config` | アクティブ構成を検査または編集 |
| `local-ai-stack model list` | ダウンロードされたモデルをリスト |
| `local-ai-stack model recommend` | ハードウェアに合わせたモデル推奨(RAM、VRAM、ディスク) |
| `local-ai-stack model install <名前>` | プリフライトリソース安全チェック付きで新しいモデルをプル |
| `local-ai-stack model remove <名前>` | インストールされたモデルを削除 |
| `local-ai-stack model status` | モデルリソースフットプリントを検査 |

イメージは明示的なバージョンにピン留めされています。`local-ai-stack update`は構成されたバージョンを更新します。新しいリリースは選択しません。新しいCLIをインストールした後、`local-ai-stack update --upgrade-images`を実行して、CLIのレガシーデフォルトイメージタグのみを移行します。カスタムイメージ値は保持されます。

---

## APIゲートウェイ

APIゲートウェイは、ドロップインOpenAI RESTエンドポイントを提供します:

`/v1/*`エンドポイントを呼び出す前に、`LOCAL_AI_API_KEY`を生成された`API_SECRET_KEY`に設定してください。

ゲートウェイは、デフォルトでソースIPごとの認証済み`/v1/*`リクエストを毎分120リクエストに制限します。ローカルクライアントが異なる制限を必要とする場合は、`.env`で`RATE_LIMIT_MAX_REQUESTS`と`RATE_LIMIT_WINDOW_MS`を構成してください。

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOCAL_AI_API_KEY" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      { "role": "user", "content": "プライベートローカルAIスタックからこんにちは!" }
    ]
  }'
```

### 公式OpenAI Node.js SDKでの使用
```typescript
import OpenAI from 'openai';

const apiKey = process.env.LOCAL_AI_API_KEY;
if (!apiKey) {
  throw new Error('LOCAL_AI_API_KEYを生成されたAPI_SECRET_KEYに設定してください。');
}

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey,
});

const completion = await openai.chat.completions.create({
  model: 'llama3.2:3b',
  messages: [{ role: 'user', content: '量子コンピューティングを1文で説明してください。' }],
});

console.log(completion.choices[0].message.content);
```

---

## 例

- [`examples/openai-compat/`](./examples/openai-compat):ドロップインOpenAI SDK統合スクリプト。
- [`examples/rag-example/`](./examples/rag-example):Qdrantベクトルデータベースとollama埋め込みを使用したエンドツーエンドRAGパイプライン。

---

## ドキュメント

- [アーキテクチャ概要](./docs/architecture.md)
- [APIゲートウェイリファレンス](./docs/api-reference.md)
- [構成ガイド](./docs/configuration.md)
- [GPUアクセラレーションセットアップ(Metal / CUDA)](./docs/gpu-setup.md)
- [トラブルシューティングと診断](./docs/troubleshooting.md)

---

## 貢献

貢献を歓迎します![CONTRIBUTING.md](./CONTRIBUTING.md)を確認して始めてください。

## ライセンス

[MIT](./LICENSE) © 2026 local-ai-stackコントリビューター
