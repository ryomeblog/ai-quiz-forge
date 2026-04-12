# CLAUDE.md — AI Quiz Forge

このファイルは Claude Code が本プロジェクトで作業する際の指針です。詳細仕様は `doc/AI_Quiz_Forge_設計書_v3.0.md`、画面仕様は `doc/wireframes/*.svg` を参照してください。

## プロジェクト概要

AI駆動の選択式クイズ生成 PWA。React + Tailwind + Capacitor。AI生成（Anthropic / OpenAI / OpenRouter）は Web検索常時ON、ブラウザから直接呼び出し（個人利用前提）。デプロイ先は GitHub Pages、後続フェーズで iOS / Android（Capacitor）対応。

## 技術スタック

| レイヤー | 採用 | 備考 |
|---|---|---|
| フロント | React 19 + Vite | スキャフォールド導入済み |
| 言語 | JavaScript (JSX) | TypeScript は使用しない |
| スタイル | Tailwind CSS | `theme.extend.colors` にブランドカラー定義（設計書 5.5） |
| ルーティング | react-router-dom v6 | GitHub Pages 用に `base` と `basename` 設定 |
| 状態管理 | useReducer + Context | Redux等は使わない |
| バリデーション | zod | AI出力・インポートJSON検証 |
| PWA | vite-plugin-pwa | manifest + Service Worker |
| ネイティブ | Capacitor（フェーズ2） | Web完成後に `npx cap add ios/android` |
| リント/フォーマット | ESLint 9 (Flat) + Prettier | 保存時自動フォーマット必須 |

## UIライブラリ（画面別）

| 用途 | ライブラリ | 使用画面 |
|---|---|---|
| アイコン全般 | **react-icons**（`fi`=Feather / `hi2`=Heroicons v2 を基本） | 全画面（ボトムナビ、編集/削除/問題ボタン、星、矢印、目のON/OFF、×など） |
| アコーディオン | `@headlessui/react` Disclosure | S-003 AI生成プレビュー / S-006 / S-007 |
| ダイアログ | `@headlessui/react` Dialog | 試験削除確認 / プレイ離脱確認 / 全データ削除 / インポート上書き確認 |
| タブ | `@headlessui/react` Tab | S-003（手動/AI） |
| トグル | `@headlessui/react` Switch | 手動の選択肢ON-OFF / AI生成の「複数正解を含める」 |
| トースト | `react-hot-toast` | 保存成功、APIキー未設定誘導、エラー通知 |
| スライダー | ネイティブ `<input type="range">` + Tailwind | S-001 出題数（step=5） / S-003 選択肢数（step=1） |

**MVPで不採用（標準機能で十分）**: `react-hook-form`, `date-fns`, `uuid`, `clsx`。

## アイコン命名規則

`react-icons/fi`（Feather）を基本とし、必要時 `react-icons/hi2`。一例:

| 用途 | アイコン |
|---|---|
| ホーム | `FiHome` |
| 履歴 | `FiClock` |
| 設定 | `FiSettings` |
| 追加（+ボタン） | `FiPlus` |
| 編集 | `FiEdit2` |
| 削除 | `FiTrash2` |
| 問題 | `FiList` |
| スタート | `FiPlay` |
| 戻る | `FiChevronLeft` |
| 次へ | `FiChevronRight` |
| 正解マーク | `FiCheck` / `FiCheckCircle` |
| 不正解 | `FiX` / `FiXCircle` |
| 星（全問正解履歴） | `FiStar`（塗りは `HiMiniStar` 等を検討） |
| APIキー表示/非表示 | `FiEye` / `FiEyeOff` |
| エクスポート | `FiDownload` |
| インポート | `FiUpload` |
| 単一選択バッジ/複数選択バッジ | テキストのみ（アイコンなし） |

## ディレクトリ構成（設計書 7 章準拠）

```
src/
  components/
    common/       # BottomNav, Toast, ConfirmDialog, Badge
    home/         # ExamCard, EmptyState
    create/       # ExamForm
    questions/    # QuestionForm, ChoiceInput, QuestionCard
    ai/           # GenerateForm, PreviewAccordion, ProviderSelector
    play/         # QuestionDisplay, ChoiceSelector, ProgressBar
    result/       # ScoreSummary, AnswerAccordion
    history/      # HistoryAccordion
    settings/     # ProviderSettings, ApiKeyInput, ExportButton, ImportButton
  contexts/
    ExamContext.jsx
    PlayContext.jsx         # メモリのみ、リロード/バックで破棄
    HistoryContext.jsx
    SettingsContext.jsx
    AIPreviewContext.jsx    # メモリのみ、S-003離脱でクリア
  pages/          # HomePage / ExamCreatePage / ExamEditPage / QuestionManagePage / QuestionEditPage / PlayPage / ResultPage / HistoryPage / SettingsPage
  providers/
    index.js            # getProvider ファクトリ
    anthropic.js
    openai.js            # Responses API 使用
    openrouter.js        # :online 自動付与
    httpClient.js        # Web (fetch) / Native (CapacitorHttp) 切替
  hooks/
    useLocalStorage.js
    useAIGenerate.js
  utils/
    storage.js
    exportImport.js
    shuffle.js           # 問題・選択肢シャッフル
    sanitize.js          # プロンプトインジェクション対策
```

## 必ず守る仕様（実装時の注意点）

### データ
- `isMultiSelect` は**正解ONの数から自動判定**（2以上で複数選択）。UIに明示トグルは置かない
- `AnswerRecord.choices` は**シャッフル後の順序**で保存（履歴画面でプレイ時の見た目を再現）
- 未回答は不正解扱い（`selectedChoiceIds: []`, `isCorrect: false`）
- 履歴・試験はAnswerRecordで**問題文/選択肢/正解をスナップショット化**（元試験削除後も履歴完全）

### プレイ
- 問題順・各問題内の選択肢順とも**必ずシャッフル**（`utils/shuffle.js`）
- プレイ中は正解非表示
- 途中離脱（ボトムナビ）は**確認ダイアログ必須**、承諾でデータ破棄
- リロード・ブラウザバック・アプリバックグラウンドは**確認なしに破棄**してホームへ

### ホーム（S-001）
- 出題数スライダーは **5刻み**、範囲は 5〜総問題数、末尾は総問題数ピッタリ（例: 25問→5/10/15/20/25、26問→5/10/15/20/25/26）
- **総問題数が5未満の場合はスライダー非表示**、出題数=総問題数で固定
- 前回正答率は**この試験の最新プレイ**のみ。未プレイは非表示
- ★マーク: 任意のプレイで100%達成で付与。問題の**追加・編集・削除いずれでも消える**

### AI生成（S-003）
- Web検索は**常時ON**、UIトグルなし
- Web検索失敗時は**問題を生成せずエラーバナー**
- 「複数正解を含める」OFF=全問単一、ON=**混在許可**（全問複数にはしない）
- プレビュー配列は `AIPreviewContext`（メモリのみ）で保持。S-003離脱でクリア
- プレビューの「編集」は `/exams/:id/questions/edit?source=preview&index=N` に遷移

### AI通信
- Web: `fetch` + dangerousフラグ（Anthropic: `anthropic-dangerous-direct-browser-access: true`）
- Native: `@capacitor/http` 経由（`Capacitor.isNativePlatform()` で切替）
- OpenRouter は `:online` を自動付与
- タイムアウト 60秒、ストリーミングなし
- ユーザー入力（theme/scope）は `utils/sanitize.js` で改行・バッククォート除去

### セキュリティ / データ
- APIキーは localStorage 保存（マスク表示・トグルで表示）。**共有端末禁止**を前提
- エクスポートにAPIキーを含めない
- インポートは**上書き固定**（マージ機能なし）、確認ダイアログ表示

### デザイン
- Tailwind `theme.extend.colors` にブランドカラー定義（設計書 5.5 の token 表参照）
- デフォルトTailwind色（`blue-500` 等）は使用しない、必ずブランドトークン
- モバイルファースト、レスポンシブ対応
- ボトムナビは全画面共通、高さ72px固定

## コマンド

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果プレビュー |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint自動修正 |
| `npm run format` | Prettier実行 |
| `npm run format:check` | Prettier検証 |

## Vite設定メモ（GitHub Pages対応）

```js
// vite.config.js
export default defineConfig({
  base: "/ai-quiz-forge/",  // リポジトリ名に合わせる
  plugins: [react(), VitePWA({ registerType: "autoUpdate" })],
});

// App.jsx
<BrowserRouter basename="/ai-quiz-forge">
```

## テスト方針

**MVP ではユニット/E2Eテストを実装しない**。手動動作確認で検収。将来的に Vitest / Playwright を検討。

## 実装順序（推奨）

1. Tailwind + Prettier + ブランドカラー定義 + 基本レイアウト
2. ルーティング + ボトムナビ + プレースホルダページ
3. localStorage層・Context層（Exam / Settings / History / Play / AIPreview）
4. S-001 → S-002 → S-003（手動）→ S-003b → S-005 → S-006 → S-007 → S-008 の順で実装
5. AIプロバイダー抽象化 + HTTPクライアント抽象化（Web のみ先行）
6. S-003 AI生成タブ完成
7. PWA化（manifest + Service Worker + プレースホルダアイコン）
8. GitHub Pages デプロイ
9. Capacitor 追加 + `CapacitorHttp` 切替対応

## 参照

- 設計書: `doc/AI_Quiz_Forge_設計書_v3.0.md`
- ワイヤーフレーム: `doc/wireframes/S-*.svg`
- ブランドカラー: 設計書 5.5
- ルーティング: 設計書 5.4
- AI通信アーキテクチャ: 設計書 4.6
- プロンプト: 設計書 4.9
