# AI Quiz Forge

AI 駆動の選択式クイズ生成 PWA。React + Vite + Tailwind CSS v4 で実装し、Anthropic / OpenAI / OpenRouter の 3 プロバイダーから Web 検索を伴った問題を自動生成できます。

- **公開 URL**: https://ryomeblog.github.io/ai-quiz-forge/
- **対応プラットフォーム**: Web (PWA)、将来的に Capacitor で iOS / Android
- **個人利用前提**: API キーは localStorage に平文保存。共有端末では使用しないでください。

---

## 主な機能

| # | 機能 | 概要 |
|---|---|---|
| 1 | 試験管理 | 学習テーマごとに試験（Exam）を作成・編集・削除 |
| 2 | 手動問題作成 | 問題文・選択肢（2〜10）・正解・解説を登録 |
| 3 | AI 問題生成 | テーマ・範囲・問題数・選択肢数を指定して AI が生成。Web 検索を常時 ON |
| 4 | プレビュー & 編集 | 生成結果をアコーディオンで確認、個別編集後に一括登録 |
| 5 | プレイ | 出題数を 5 刻みで指定、問題順・選択肢順をシャッフル |
| 6 | 採点・解説 | 正答率と問題ごとの解説をアコーディオンで確認 |
| 7 | 履歴 | プレイ結果を試験単位でグループ化、★判定 |
| 8 | データ管理 | JSON エクスポート / インポート、全データ削除 |
| 9 | オンボーディング | 初回起動時にスライド式チュートリアル（設定から再表示可） |
| 10 | PWA | manifest + Service Worker。ホーム画面追加で単体アプリ化 |

---

## 技術スタック

| レイヤー | 採用 | 備考 |
|---|---|---|
| フロント | React 19 + Vite 8 | `@vitejs/plugin-react` |
| 言語 | JavaScript (JSX) | TypeScript は不採用 |
| スタイル | Tailwind CSS v4 | `@theme` ブロックでブランドトークン定義 |
| ルーティング | react-router-dom v7 | GitHub Pages 用に `base` / `basename` を一致 |
| 状態管理 | useReducer + Context API | Redux 等は不使用 |
| バリデーション | zod | AI 出力・インポート JSON 検証 |
| UI プリミティブ | @headlessui/react | Tab / Disclosure / Dialog / Switch |
| アイコン | react-icons (Feather / Heroicons v2) | `fi` / `hi2` |
| トースト | react-hot-toast | 保存成功・エラー通知 |
| PWA | vite-plugin-pwa | manifest + Service Worker（autoUpdate） |
| ネイティブ | Capacitor（予定） | `window.Capacitor` を動的参照 |
| リント/整形 | ESLint 9 (Flat) + Prettier | 保存時自動整形 |

---

## プロジェクト構成

```
ai-quiz-forge/
├── .github/workflows/deploy.yml   # GitHub Pages 自動デプロイ
├── public/
│   ├── favicon.svg                # ブランド統一ファビコン
│   ├── icons/icon-192.svg         # PWA アイコン
│   ├── icons/icon-512.svg
│   └── img/001.png 〜 010.png     # チュートリアル画像
├── src/
│   ├── App.jsx                    # ルーティング + 初回ゲート
│   ├── main.jsx                   # ルート + グローバルエラーハンドラ
│   ├── index.css                  # Tailwind + @theme ブランドトークン
│   ├── components/
│   │   ├── common/                # BottomNav / ConfirmDialog / PageHeader / Badge
│   │   ├── home/                  # ExamCard / EmptyState
│   │   ├── create/                # ExamForm
│   │   ├── questions/             # QuestionForm / ChoiceInput / QuestionCard
│   │   ├── ai/                    # GenerateForm / PreviewAccordion / ProviderSelector
│   │   ├── play/                  # QuestionDisplay / ChoiceSelector / ProgressBar
│   │   ├── result/                # ScoreSummary / AnswerAccordion
│   │   ├── history/               # HistoryAccordion
│   │   ├── settings/              # ApiKeyInput
│   │   └── tutorial/              # Tutorial（自前カルーセル）
│   ├── contexts/
│   │   ├── ExamContext.jsx        # 試験 CRUD（localStorage 永続化）
│   │   ├── HistoryContext.jsx     # 履歴（localStorage 永続化）
│   │   ├── SettingsContext.jsx    # プロバイダー / API キー
│   │   ├── PlayContext.jsx        # メモリのみ・離脱で破棄
│   │   └── AIPreviewContext.jsx   # メモリのみ・S-003 離脱でクリア
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ExamCreatePage.jsx
│   │   ├── ExamEditPage.jsx
│   │   ├── QuestionManagePage.jsx
│   │   ├── QuestionEditPage.jsx
│   │   ├── PlayPage.jsx
│   │   ├── ResultPage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── TutorialPage.jsx
│   ├── providers/
│   │   ├── index.js               # getProvider ファクトリ
│   │   ├── anthropic.js           # Anthropic (Messages + web_search)
│   │   ├── openai.js              # OpenAI (Responses API + web_search_preview)
│   │   ├── openrouter.js          # OpenRouter (:online / :free 自動判定)
│   │   ├── httpClient.js          # fetch → XHR → CapacitorHttp 多段
│   │   └── prompts.js             # 共通システムプロンプト
│   ├── hooks/
│   │   └── useAIGenerate.js       # 呼び出し状態・エラー収集
│   └── utils/
│       ├── schemas.js             # zod スキーマ一式
│       ├── storage.js             # localStorage キー定義
│       ├── shuffle.js             # Fisher–Yates
│       ├── grading.js             # 採点ロジック
│       ├── exportImport.js        # JSON エクスポート / インポート
│       ├── sanitize.js            # プロンプトインジェクション対策
│       └── uuid.js                # crypto.randomUUID フォールバック
├── capacitor.config.json          # Capacitor 設定（appId 等）
├── eslint.config.js
├── .prettierrc
├── tailwind.config.js
├── vite.config.js
├── package.json
├── CLAUDE.md                      # プロジェクト指針
├── IMPLEMENTATION_PLAN.md         # 実装計画
├── doc/                           # 設計書 + ワイヤーフレーム
│   ├── AI_Quiz_Forge_設計書_v3.0.md
│   └── wireframes/S-*.svg
└── qiita/                         # Qiita 記事の原稿
    ├── article.md
    ├── architecture.svg
    └── screen-flow.svg
```

---

## ルーティング

| パス | 画面 | 備考 |
|---|---|---|
| `/` | HomePage | 試験一覧・出題数スライダー・★表示 |
| `/exams/new` | ExamCreatePage | タイトル必須・説明任意 |
| `/exams/:id/edit` | ExamEditPage | 試験の編集 |
| `/exams/:id/questions` | QuestionManagePage | 手動 / AI タブ + 既存問題リスト |
| `/exams/:id/questions/:qid/edit` | QuestionEditPage | 既存問題の編集 |
| `/exams/:id/questions/edit?source=preview&index=N` | QuestionEditPage | AI プレビュー項目の編集 |
| `/play/:id` | PlayPage | シャッフル出題 |
| `/play/:id/result` | ResultPage | 採点結果・解説 |
| `/history` | HistoryPage | 試験グループ化 + 2 階層アコーディオン |
| `/settings` | SettingsPage | プロバイダー / API キー / データ管理 |
| `/tutorial` | TutorialPage | スライド式オンボーディング |

---

## セットアップ

### 必要環境
- Node.js 20 以上
- npm 10 以上

### インストール
```bash
npm install --legacy-peer-deps
```

> `vite-plugin-pwa@1.2.0` が vite 8 のピア依存を満たさないため `--legacy-peer-deps` が必要です。
> 繰り返し回避するには `.npmrc` に `legacy-peer-deps=true` を記載してください。

### 開発サーバー起動
```bash
npm run dev
```
`http://localhost:5173/ai-quiz-forge/` が開きます。

### ビルド
```bash
npm run build
```
`dist/` に成果物が出力されます。`dist/index.html` が SPA エントリで、404 フォールバック用に `dist/404.html` にコピーしてデプロイしてください（GitHub Actions では自動）。

### プレビュー
```bash
npm run preview
```

### Lint / Format
```bash
npm run lint         # ESLint
npm run lint:fix     # 自動修正
npm run format       # Prettier 書き換え
npm run format:check # 検証のみ
```

---

## AI プロバイダー設定

設定画面（`/settings`）でプロバイダーを選び、API キーを登録してください。選択中プロバイダーに対応する入力欄だけが表示されます。

| プロバイダー | エンドポイント | Web 検索 | 備考 |
|---|---|---|---|
| Anthropic | `api.anthropic.com/v1/messages` | `web_search` ツール | `anthropic-dangerous-direct-browser-access: true` を付与 |
| OpenAI | `api.openai.com/v1/responses` | `web_search_preview` ツール | Responses API、`json_schema strict` で構造化出力 |
| OpenRouter | `openrouter.ai/api/v1/chat/completions` | `:online` サフィックス | `:free` モデルには `:online` を付けない（有料化回避） |

### OpenRouter のフォールバック
- プライマリモデルが **3 秒以内に応答しない** 場合、`z-ai/glm-4.5-air:free` に自動切替
- `:online` で 403（Key limit 超過）の場合、`:online` を外して再試行

---

## 必ず守る仕様

- `isMultiSelect` は正解 ON の数から **自動判定**（UI トグルなし）
- プレイ中は問題順・選択肢順とも **必ずシャッフル**
- `AnswerRecord.choices` は **シャッフル後の順序** でスナップショット
- 未回答は **不正解扱い**
- プレイ中のボトムナビ離脱は **確認ダイアログ必須**、承諾で破棄
- リロード・ブラウザバック・バックグラウンドは **確認なし** に破棄してホームへ
- ★マーク: 任意のプレイで 100 % 達成で付与。問題の追加・編集・削除いずれでも消える
- エクスポート JSON に **API キーは含めない**
- インポートは **上書き固定**（マージなし）、確認ダイアログ表示
- 総問題数 < 5 の場合は出題数スライダー非表示（総問題数で固定）
- AI 生成は Web 検索を常時 ON、失敗時は生成せずエラーバナー
- ユーザー入力（theme / scope）は改行・バッククォート・制御文字を除去してからプロンプトへ注入

---

## データモデル

```ts
type Choice   = { id: string; text: string; isCorrect: boolean };
type Question = {
  id: string;
  text: string;
  choices: Choice[];              // 2〜10
  isMultiSelect: boolean;         // クライアント側で自動計算
  explanation: string | null;
  source: "manual" | "ai";
};
type Exam = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  createdAt: string;              // ISO 8601
  updatedAt: string;              // 問題変更で更新 → ★判定に利用
};
type AnswerRecord = {
  questionId: string;
  questionText: string;           // スナップショット
  choices: Choice[];              // シャッフル後の順序でスナップショット
  selectedChoiceIds: string[];
  correctChoiceIds: string[];
  isCorrect: boolean;
  explanation: string | null;
};
type PlayHistory = {
  id: string;
  examId: string;
  examTitle: string;              // 試験削除後も履歴は残る
  score: number;
  totalQuestions: number;
  answers: AnswerRecord[];
  playedAt: string;
};
```

### localStorage キー一覧

| キー | 用途 |
|---|---|
| `aqf_exams` | 全試験 |
| `aqf_history` | 全履歴 |
| `aqf_provider` | 選択中プロバイダー |
| `aqf_apikey_anthropic` | Anthropic API キー |
| `aqf_apikey_openai` | OpenAI API キー |
| `aqf_apikey_openrouter` | OpenRouter API キー |
| `aqf_model_openrouter` | OpenRouter モデル名 |
| `aqf_tutorial_seen` | チュートリアル既読フラグ |

---

## アーキテクチャ

```
UI Layer (React + react-router-dom)
  ↓
State Layer (5 Context / useReducer)
  ├ 永続: ExamContext / HistoryContext / SettingsContext
  └ 揮発: PlayContext / AIPreviewContext
  ↓
Domain / AI Provider Layer
  ├ schemas.js (zod) / shuffle.js / grading.js
  └ providers/ (getProvider ファクトリ)
  ↓
HTTP Client Layer（拡張機能干渉に耐える多段防御）
  ① fetch（3段 body 読出 arrayBuffer → text → ReadableStream）
  ② XMLHttpRequest
  ③ CapacitorHttp（Native 時）
```

詳細は `qiita/architecture.svg` および `qiita/screen-flow.svg` を参照してください。

---

## デプロイ

`main` ブランチに push すると GitHub Actions が自動で GitHub Pages へデプロイします。

### 初回セットアップ（手動）
1. リポジトリの **Settings → Pages** を開く
2. **Source** を `GitHub Actions` に変更

### ワークフロー概要（`.github/workflows/deploy.yml`）
```
checkout → setup-node (20) → npm ci --legacy-peer-deps → vite build
  → cp dist/index.html dist/404.html (SPA フォールバック)
  → configure-pages → upload-pages-artifact → deploy-pages
```

---

## 既知の制約

- **個人利用前提**: API キーが localStorage に平文保存される
- Web 検索付き生成は長時間かかるため、タイムアウト 120 秒
- vite-plugin-pwa が vite 8 の peer 依存を満たさないため `--legacy-peer-deps` 必須
- Capacitor は `window.Capacitor` ランタイム参照。Web ビルドでは非依存

---

## ライセンス

本リポジトリは個人利用を目的としたプロトタイプです。`LICENSE` ファイル未同梱のため、再配布や商用利用は意図していません。

---

## 参考ドキュメント

| ドキュメント | 内容 |
|---|---|
| `CLAUDE.md` | Claude Code 用のプロジェクト指針。実装ルール・命名規約 |
| `IMPLEMENTATION_PLAN.md` | フェーズ 0〜9 の実装計画 |
| `doc/AI_Quiz_Forge_設計書_v3.0.md` | 詳細設計書（機能・データモデル・API 仕様） |
| `doc/wireframes/S-*.svg` | 画面ワイヤーフレーム |
| `qiita/article.md` | Qiita 用の解説記事 |
