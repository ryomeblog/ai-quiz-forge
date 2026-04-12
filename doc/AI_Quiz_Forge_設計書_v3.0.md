# AI Quiz Forge 設計書 v3.0

> AI駆動 選択式クイズ生成アプリケーション

| 項目 | 内容 |
|------|------|
| プロジェクト名 | AI Quiz Forge |
| バージョン | 1.0.0 |
| 作成日 | 2026年4月12日 |
| プラットフォーム | Web (PWA) + iOS / Android（Capacitor） |
| 技術 | React + Tailwind CSS + Capacitor |
| AIプロバイダー | Anthropic / OpenAI / OpenRouter |

---

## 1. プロジェクト概要

### 1.1 目的

AIがWeb検索を行い、最新情報に基づいた選択式クイズを自動生成するPWAアプリ。AWS等の資格試験対応。AI生成後の問題は自由に編集可能で、AI生成問題も手動問題も同一扱い。

### 1.2 スコープ

- 選択式問題のみ（記述式は対象外）
- 選択肢: 2〜10、問題ごとに異なる
- 複数正解問題に対応（`isMultiSelect` は正解ONの数から自動判定: 2個以上で複数選択）
- 「試験」→「問題」の2階層構造
- 問題作成は「手動」「AI生成」タブ切替。既存問題リストはタブの外側に常時表示
- AI生成後の問題は全て編集可能。AI/手動の機能的差異なし
- AIプロバイダー3社対応（Anthropic / OpenAI / OpenRouter）
- AI生成時の問題数: 5・10・15・20（5単位）
- AI生成時の選択肢数: 2〜10（1単位）
- AI生成はWeb検索を**常時ON**で実行（UIトグルなし）。検索失敗時は問題を生成せずエラーバナー表示
- AI API呼び出しは**個人利用前提でブラウザから直接実行**（プロキシなし、dangerous direct browser accessフラグを使用）
- プレイ時に出題数を指定可能（5刻みのスライダー。最大値のみ総問題数ピッタリ）。ランダム抽出
- プレイ時は問題順・各問題内の選択肢順ともランダムにシャッフル
- プレイ中は正解非表示。結果画面でのみ確認
- 未回答のまま「次へ」「回答する」進行可能（未回答は不正解として扱う）
- プレイ中の途中離脱（ボトムナビ操作等）時は**確認ダイアログ**を表示し、承諾時にプレイデータを破棄
- 「もう一度」: 同じ出題数で純粋にランダム再抽出（前回との重複回避なし）
- 全問正解履歴のある試験はホーム画面で★マーク表示（**任意のプレイで100%**を1度でも達成すると付与。問題の追加・編集・削除いずれでも★は消える）
- 総問題数が5未満の試験はスライダー非表示、出題数=総問題数で固定
- プレイ中のリロード・ブラウザバック・アプリバックグラウンド時はプレイデータを破棄してホームに戻る（MVPでは復元しない）
- localStorage保存、JSONエクスポート/インポート対応（インポートは**上書き固定**）
- 全画面にボトムナビゲーション（ホーム/履歴/設定）

### 1.3 用語定義

| 用語 | 定義 |
|------|------|
| 試験（Exam） | 問題をまとめる単位。タイトル・説明を持ち複数の問題を含む |
| 問題（Question） | 試験に属する1設問。問題文と選択肢を持つ。問題ごとに選択肢数が異なる |
| 選択肢（Choice） | 回答候補。2〜10個。正解フラグを持つ |

### 1.4 技術スタック

| レイヤー | 技術 | 役割 |
|----------|------|------|
| フロントエンド | React 18+ | UIコンポーネント |
| スタイリング | Tailwind CSS | ユーティリティCSS |
| UIコンポーネント | @headlessui/react | アコーディオン / ダイアログ / タブ / スイッチ |
| アイコン | react-icons | Feather (`fi`) / Heroicons v2 (`hi2`) を使用 |
| トースト | react-hot-toast | エラー通知・保存成功等 |
| ビルド | Vite | 開発サーバー・ビルド |
| PWA / ネイティブ | Capacitor | Web（Service Worker / manifest）+ iOS / Android ラッパー |
| AI | Anthropic / OpenAI / OpenRouter | 問題生成+Web検索 |
| データ | localStorage | 永続化 |
| ルーティング | React Router v6 | 画面遷移 |
| バリデーション | zod | AI出力・インポートJSONのスキーマ検証 |
| リンター | ESLint 9+ | コード品質 |
| フォーマッター | Prettier | ダブルクォート・保存時自動 |

---

## 2. 画面設計

### 2.1 画面一覧

| 画面ID | 画面名 | パス | 概要 |
|--------|--------|------|------|
| S-001 | ホーム | `/` | 試験一覧・出題数選択・プレイ開始・編集・問題管理・削除 |
| S-002a | 試験作成 | `/exams/new` | 新規試験のタイトル・説明を入力 |
| S-002b | 試験編集 | `/exams/:id/edit` | 既存試験のタイトル・説明を編集 |
| S-003 | 問題管理 | `/exams/:id/questions` | 手動/AIタブで問題追加。既存問題リストはタブ外に常時表示 |
| S-003b | 問題編集 | `/exams/:id/questions/:qid/edit` | 問題文・選択肢・正解・解説の編集 |
| S-005 | プレイ | `/play/:id` | 1問ずつ出題。前へ/次へナビ |
| S-006 | 結果 | `/play/:id/result` | 正答率大きく表示・アコーディオン詳細 |
| S-007 | 履歴 | `/history` | 過去のプレイ結果アコーディオン |
| S-008 | 設定 | `/settings` | APIキー・プロバイダー・データ管理 |

> ※ S-004（試験選択画面）は廃止。S-001に統合。

### 2.2 共通UI

**ボトムナビゲーション:** 全画面のフッターに固定。`#111111`背景、上部`#222222`区切り線、高さ72px。ホーム/履歴/設定の3タブ。SVGアイコン+ラベル縦並び。アクティブ=`#00E5FF`、非アクティブ=`#666666`。

### 2.3 各画面詳細

#### 2.3.1 S-001 ホーム画面

**目的:** 試験一覧・プレイ開始・試験管理の起点（S-004を統合）

- 「+ 新しい試験を作成」ボタン → S-002a
- 各試験カードに以下を表示:
  - タイトル、全問題数、作成日、前回正答率（**この試験の最新プレイのスコア**。未プレイ時は非表示）
  - 全問正解履歴がある試験はタイトル横に★マーク表示（任意のプレイで100%達成で付与。問題の追加・編集・削除いずれでも★は自動で消える）
  - 出題数スライダー（**5刻み**。範囲は5〜総問題数、末尾は総問題数ピッタリ。デフォルト10）
  - 総問題数が5未満の場合はスライダー非表示、出題数=総問題数で固定表示
  - 「スタート ▶」ボタン → S-005へ遷移
  - 「編集」ボタン → S-002b（試験タイトル・説明の編集）
  - 「問題」ボタン → S-003（問題管理画面）
  - 「削除」ボタン（確認ダイアログ付き）
- 0問の試験はグレーアウト（スタート不可、「問題を追加してください」表示）

#### 2.3.2 S-002a 試験作成 / S-002b 試験編集

**目的:** 試験の新規作成および既存試験の編集（同一コンポーネント、モード切替）

- **新規モード（S-002a）:** ヘッダー「新しい試験を作成」、フィールド空、ボタン「作成して問題を追加」→ S-003へ
- **編集モード（S-002b）:** ヘッダー「試験を編集」、既存データプリフィル、ボタン「保存」/「キャンセル」→ ホームへ
- 入力: 試験タイトル（必須）、説明（任意）
- 編集モードでは登録済み問題数を表示

#### 2.3.3 S-003 問題管理画面

**目的:** 試験内の問題を手動/AIで追加・編集・削除

**レイアウト:** 上部に「手動作成」「AI生成」の2タブ。その下に既存問題リスト（タブの外側に常時表示）。

**▶ 手動作成タブ:**

- 問題文入力テキストエリア
- 選択肢リスト（動的追加/削除、最小2・最大10）
- 各選択肢に「正解」ON/OFFトグルと「×」削除ボタン
- `isMultiSelect` は正解ONの数から自動判定（2個以上で複数選択）。UI上の明示トグルはなし
- 「問題を追加」ボタン

**▶ AI生成タブ:**

- AIプロバイダー選択ドロップダウン（Anthropic / OpenAI / OpenRouter）
- テーマ / 資格名（必須、例: 「AWS SAA」「日本史」）
- 出題範囲 / 詳細指示（任意、例: 「S3, EC2, VPC中心にシナリオ問題」）
- 出題言語ドロップダウン（日本語 / English）
- 問題数選択: 5 / 10 / 15 / 20（5単位のセグメントボタン）
- 選択肢数: 2〜10（1単位のスライダー）
- 複数正解を含めるかのトグル（OFF=全問単一正解、ON=**単一/複数の混在を許可**。全問複数正解ではない）
- Web検索は常時ON（トグルなし）。検索失敗時は生成せずエラーバナー
- 「生成」ボタン → ローディング → プレビュー
- 設定は毎回変更可能（同じ試験で再生成時に設定を変えられる）

**▶ 生成プレビュー（結果画面と同じアコーディオン形式）:**

- 各問題を問題文（20文字+「...」）のアコーディオンで表示
- 展開時: 問題文全文、全選択肢箇条書き、正解=緑背景
- 各問題に「編集」「破棄」ボタン（「追加」ボタンは不要）
- 「編集」ボタン: **S-003b（問題編集画面）にクエリ付きで遷移**（例: `/exams/:id/questions/edit?source=preview&index=3`）。保存時にプレビュー配列内の該当問題へ反映（インライン編集なし）
- プレビュー配列は **ExamContext ではなく専用の Context（メモリのみ）** で保持。S-003から他画面（履歴・ホーム・設定等）に遷移したタイミングでプレビューはクリアする（セッション跨ぎの復元はしない）
- 「すべて登録」ボタンで一括登録

**▶ 既存問題リスト（タブ外側に常時表示）:**

- カード形式: 問題文の先頭30文字、選択肢数、単一/複数選択バッジ
- 「編集」ボタン → S-003b へ遷移
- 「削除」ボタン

#### 2.3.4 S-003b 問題編集画面

**目的:** 既存問題およびAIプレビュー問題の編集

- 問題文の編集
- 選択肢テキストの編集
- 選択肢の追加・削除（×ボタン）
- 正解ON/OFFトグルの変更（`isMultiSelect` はONの数から自動判定、明示トグルなし）
- 解説の編集（任意）
- 「保存」「キャンセル」ボタン
- バリデーション: 問題文必須、選択肢最低2個、正解最低1つ、空白不可
- AIプレビュー編集からの遷移にも対応（プレビュー側の一時データを編集後、保存でプレビュー配列に反映）

#### 2.3.5 S-005 プレイ画面

**目的:** 1問ずつ出題し回答を受け付ける。正解は非表示。

- 進捗バー（n / m）+ 単一選択/複数選択バッジ
- 単一選択問題: ラジオボタンUI
- 複数選択問題: チェックボックスUI + 「すべて選べ」ラベル
- ナビゲーション: 「← 前へ」「次へ →」ボタン。第1問では前へ非表示
- 最終問題: 「← 前へ」「回答する」ボタン。回答するでS-006へ
- **未回答のまま「次へ」「回答する」進行可能**（スキップ許可）。未回答は不正解扱い。前へで戻って選び直し可能
- 複数選択で0個選択のまま進行も可能（不正解扱い）
- 出題: 試験から指定数分をランダム抽出。**問題順・各問題内の選択肢順ともシャッフル**
- 問題ごとに選択肢数が異なるがUIは動的に対応
- 「正解は結果画面で確認できます」のガイドテキスト
- 途中離脱（ボトムナビ等で移動）時は**確認ダイアログ**を表示。承諾時にプレイデータを破棄
- ブラウザリロード・バックボタン・アプリバックグラウンド時もプレイデータを破棄してホームに戻る（復元しない）

#### 2.3.6 S-006 結果画面

**目的:** スコアと各問の回答・正解をアコーディオンで表示

- 正答率を大きく表示（36px）、その下に n/m 正解
- 「もう一度」ボタン: 同じ出題数で純粋なランダム再抽出（前回との重複回避なし）して再プレイ
- 「ホームに戻る」ボタン
- 各問アコーディオン:
  - ヘッダー: 「○/× Qn: 問題文（20文字+...）」、正解=緑背景、不正解=赤背景
  - 展開時: 問題文全文、全選択肢を箇条書きで一覧表示
  - 正解の選択肢 → 緑背景
  - 不正解を選んだ選択肢 → 赤背景
  - その他の選択肢 → 背景なし
- 結果はlocalStorageの履歴に自動保存

#### 2.3.7 S-007 履歴画面

**目的:** 過去のプレイ結果を2階層アコーディオンで一覧

- 試験アコーディオン: プレイ日時、試験名、正答率
- 展開: S-006と同じ問題アコーディオンUI
- 履歴削除（個別スワイプ + 全削除）

#### 2.3.8 S-008 設定画面

**目的:** AIプロバイダー設定とデータ管理

- デフォルトプロバイダー選択
- プロバイダーごとAPIキー入力（マスク表示、トグル表示）
- OpenRouterモデル名入力
- データエクスポート（JSON）/ インポート / 全削除

### 2.4 画面遷移図

```
S-001 → S-002a（新規作成） → S-003（問題追加） → S-001
S-001 → S-002b（試験編集） → S-001
S-001 → S-003（問題管理） → S-003b（問題編集） → S-003
S-001 → S-005（プレイ） → S-006（結果） → S-001
ボトムナビ: S-001 / S-007 / S-008 相互遷移
```

---

## 3. データ設計

### 3.1 Exam（試験）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string (UUID) | 試験ID |
| title | string | タイトル |
| description | string \| null | 説明 |
| questions | Question[] | 問題配列 |
| createdAt | string (ISO 8601) | 作成日時 |
| updatedAt | string (ISO 8601) | 更新日時 |

### 3.2 Question（問題）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string (UUID) | 問題ID |
| text | string | 問題文 |
| choices | Choice[] | 選択肢の配列（2〜10個、問題ごとに異なる） |
| isMultiSelect | boolean | 複数選択か |
| explanation | string \| null | 解説 |
| source | "manual" \| "ai" | 作成方法（表示用、機能差異なし） |

### 3.3 Choice（選択肢）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string (UUID) | 選択肢ID |
| text | string | テキスト |
| isCorrect | boolean | 正解か |

### 3.4 PlayHistory（プレイ履歴）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | string (UUID) | 履歴ID |
| examId | string | 試験ID |
| examTitle | string | タイトルスナップショット |
| score | number | 正解数 |
| totalQuestions | number | 出題数 |
| answers | AnswerRecord[] | 各問回答 |
| playedAt | string (ISO 8601) | プレイ日時 |

### 3.5 AnswerRecord（回答記録）

| フィールド | 型 | 説明 |
|------------|-----|------|
| questionId | string | 問題ID |
| questionText | string | 問題文スナップショット |
| choices | Choice[] | 全選択肢スナップショット（**プレイ時にユーザーに提示されたシャッフル後の順序**で保存） |
| selectedChoiceIds | string[] | ユーザー選択（未回答の場合は空配列） |
| correctChoiceIds | string[] | 正解ID |
| isCorrect | boolean | 正解か（未回答は不正解扱い） |

> ※ AnswerRecordに問題文・選択肢・正解のスナップショットを保持。元の試験が削除されても履歴画面で完全な回答詳細を表示可能。
> ※ `choices` は**シャッフル後**の順序で保存することで、履歴画面でプレイ時の画面を再現する。

### 3.6 localStorageキー

| キー | 型 | 説明 |
|------|-----|------|
| aqf_exams | Exam[] | 全試験 |
| aqf_history | PlayHistory[] | 履歴 |
| aqf_provider | string | デフォルトプロバイダー |
| aqf_apikey_anthropic | string | Anthropicキー |
| aqf_apikey_openai | string | OpenAIキー |
| aqf_apikey_openrouter | string | OpenRouterキー |
| aqf_model_openrouter | string | OpenRouterモデル名 |

### 3.7 エクスポート/インポート形式

**エクスポートJSON:**

```json
{
  "version": "1.0.0",
  "exportedAt": "ISO8601",
  "exams": [],
  "history": []
}
```

- インポート: バージョンチェック後、**上書き固定**（確認ダイアログのみ表示。マージモードは提供しない）
- APIキーはエクスポート対象外

---

## 4. API設計

### 4.1 プロバイダー別仕様

| 項目 | Anthropic | OpenAI | OpenRouter |
|------|-----------|--------|------------|
| エンドポイント | api.anthropic.com/v1/messages | api.openai.com/v1/chat/completions | openrouter.ai/api/v1/chat/completions |
| 認証 | x-api-key + `anthropic-dangerous-direct-browser-access: true` | Authorization: Bearer (`dangerouslyAllowBrowser: true`) | Authorization: Bearer + Referer |
| デフォルトモデル | claude-opus-4-6 | gpt-4o（最新版に追随） | ユーザー指定（例: google/gemini-2.5-pro） |
| Web検索 | web_searchツール（常時ON） | web_search_previewツール（常時ON） | モデル名に `:online` サフィックスを自動付与して常時ON |
| レスポンス | content[].text | choices[0].message.content | choices[0].message.content |

> ※ API呼び出しはブラウザから直接実行する（個人利用前提）。APIキーはlocalStorageに平文保存されるため、本アプリを共有端末で使用しないこと。
> ※ ネイティブ環境（Capacitor iOS / Android）では `@capacitor/http`（CapacitorHttp）経由で呼び出してCORSを回避する。Web環境では通常の `fetch` + dangerousフラグを使用。プロバイダー抽象化層（5.1）の下に**HTTPクライアント抽象化層**を設け、環境（`Capacitor.isNativePlatform()`）で切り替える。
> ※ OpenRouterではユーザー指定モデル名に `:online` サフィックスが付いていない場合、自動で付与してWeb検索を有効化する。

### 4.2 AI生成パラメータ

| パラメータ | 必須 | 説明 |
|------------|------|------|
| テーマ / 資格名 | ○ | AWS SAA, TOEIC, 日本史等 |
| 出題範囲 / 詳細指示 | × | S3,EC2中心にシナリオ問題 |
| 出題言語 | ○ | 日本語 / English |
| 問題数 | ○ | 5 / 10 / 15 / 20 |
| 選択肢数 | ○ | 2〜10 |
| 複数正解フラグ | ○ | true / false |

### 4.3 プロバイダー抽象化

AIProviderインターフェースで差異を吸収:

- `buildRequest(params)`: プロバイダー固有のリクエストオブジェクトを生成
- `parseResponse(response)`: レスポンスからテキストを抽出し統一形式で返却
- `getEndpoint()`: APIエンドポイントURLを返却
- `getHeaders(apiKey)`: 認証ヘッダーを返却

実装クラス: `AnthropicProvider` / `OpenAIProvider` / `OpenRouterProvider`

ファクトリ関数: `getProvider(providerName)` でインスタンスを取得

### 4.4 レスポンスJSONスキーマ

→ 詳細は [4.7 構造化出力スキーマ](#47-構造化出力スキーマ全プロバイダー共通契約) を参照。全プロバイダーは共通の `{ questions: [...] }` 形式で返すよう誘導し、フロントエンドでUUID付与・`isMultiSelect` 自動判定を行う。

### 4.5 エラーハンドリング

| エラー種別 | 判定 | UI動作 |
|------------|------|------|
| APIキー未設定 | Provider初期化時に検知 | 設定画面へのリンク付きトースト |
| 401 Unauthorized | HTTP status | 「APIキー（{provider名}）が無効です」＋設定画面リンク |
| 429 Rate Limit | HTTP status | 「レート制限。しばらく待って再試行」＋リトライボタン |
| 500 Server Error | HTTP status | 再試行ボタン付きエラー |
| ネットワークエラー | fetch catch | オフライン検知しエラー表示 |
| Web検索失敗 | レスポンス内tool_useエラー／空の検索結果 | AI生成タブ上部にエラーバナー（「検索に失敗しました。時間をおいて再試行してください」）＋ 再試行ボタン。**問題は生成しない** |
| JSONパース失敗 | try/catch | 「生成結果の解析に失敗。再生成してください」 |
| スキーマ不一致 | zodバリデーション | 同上（再生成誘導） |
| タイムアウト | 60秒経過 | 「タイムアウトしました」＋再試行ボタン |

### 4.6 通信アーキテクチャ

```
UI (S-003 AI生成タブ)
   ↓ useAIGenerate フック呼び出し
useAIGenerate(params)
   ↓ getProvider(providerName) でインスタンス取得
AIProvider (Anthropic / OpenAI / OpenRouter)
   ↓ buildRequest(params) でペイロード生成
httpClient.request(config)
   ├─ Web:    fetch() + dangerousフラグ
   └─ Native: CapacitorHttp.request()
   ↓ レスポンス
parseResponse(raw) → { questions: [...] }
   ↓ zod でスキーマバリデーション
   ↓ UUID付与、isMultiSelect を正解数から自動計算
AIPreviewContext にセット
```

**共通のバリデーション:**
- `questions.length === 指定問題数`（不一致時は再生成）
- 各問題の `choices.length === 指定選択肢数`
- 各問題に `isCorrect: true` が最低1つ
- `isMultiSelect` はクライアント側で正解数から自動計算（2以上で複数選択）

**実装ポリシー:**
- ストリーミングは使用せず、生成完了まではローディングスピナー
- タイムアウトは 60 秒（Web検索を含むため長め）
- バリデーションは `zod` を採用

### 4.7 構造化出力スキーマ（全プロバイダー共通契約）

```json
{
  "type": "object",
  "properties": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": { "type": "string" },
          "choices": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "text": { "type": "string" },
                "isCorrect": { "type": "boolean" }
              },
              "required": ["text", "isCorrect"]
            }
          },
          "explanation": { "type": "string" }
        },
        "required": ["text", "choices", "explanation"]
      }
    }
  },
  "required": ["questions"]
}
```

> ※ AI出力には `isMultiSelect` を含めない。クライアント側で正解数から自動判定する。
> ※ フロントエンドでUUIDを付与し、`Question` オブジェクトに変換する。

### 4.8 プロバイダー別リクエスト/レスポンス仕様

#### 4.8.1 Anthropic

```http
POST https://api.anthropic.com/v1/messages
x-api-key: {apiKey}
anthropic-version: 2023-06-01
anthropic-dangerous-direct-browser-access: true
content-type: application/json

{
  "model": "claude-opus-4-6",
  "max_tokens": 8192,
  "tools": [
    { "type": "web_search_20250305", "name": "web_search", "max_uses": 3 }
  ],
  "system": "<システムプロンプト>",
  "messages": [
    { "role": "user", "content": "<ユーザープロンプト>" }
  ]
}
```

**レスポンスパース:**
- `content[]` から最後の `type: "text"` ブロックを取得
- テキスト内の最初の ```` ```json ... ``` ```` ブロック、なければ最初の `{...}` を抽出してJSON.parse
- 失敗時は再生成エラー

#### 4.8.2 OpenAI（Responses API）

Web検索ツール（`web_search_preview`）は Responses API 専用のため、`/v1/chat/completions` ではなく `/v1/responses` を使用する。

```http
POST https://api.openai.com/v1/responses
Authorization: Bearer {apiKey}
content-type: application/json

{
  "model": "gpt-4o",
  "tools": [{ "type": "web_search_preview" }],
  "input": [
    { "role": "system", "content": "<システムプロンプト>" },
    { "role": "user",   "content": "<ユーザープロンプト>" }
  ],
  "text": {
    "format": {
      "type": "json_schema",
      "name": "quiz_questions",
      "schema": { /* 4.7 のスキーマ */ },
      "strict": true
    }
  }
}
```

**レスポンスパース:** `output_text` もしくは `output[].content[].text` からJSONを取得し JSON.parse。構造化出力により整形済みのため通常そのままパース可能。

#### 4.8.3 OpenRouter

```http
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer {apiKey}
HTTP-Referer: https://<github-pages-url>
X-Title: AI Quiz Forge
content-type: application/json

{
  "model": "google/gemini-2.5-pro:online",
  "messages": [
    { "role": "system", "content": "<システムプロンプト>" },
    { "role": "user",   "content": "<ユーザープロンプト>" }
  ],
  "response_format": { "type": "json_object" }
}
```

- ユーザーがモデル名に `:online` を付けていない場合、クライアント側で自動付与
- レスポンスパース: `choices[0].message.content` をJSON.parse

### 4.9 プロンプト設計

#### 4.9.1 システムプロンプト（全プロバイダー共通）

```
あなたは資格試験・学習向けの選択式クイズ問題を作成する専門家です。
Web検索ツールで最新の一次情報・公式ドキュメント・信頼できる学習リソースを
確認した上で、正確かつ実践的な問題を生成してください。

# 出力契約（厳守）
- 応答は必ず以下のJSON形式のみ。前置き・後置きの文章は一切含めない。
- コードフェンス（```）で囲んでもよいが、JSON以外の文字列を含めない。

{
  "questions": [
    {
      "text": "<問題文>",
      "choices": [
        { "text": "<選択肢テキスト>", "isCorrect": true },
        { "text": "<選択肢テキスト>", "isCorrect": false }
      ],
      "explanation": "<1〜3文の解説>"
    }
  ]
}

# 制約
- 各問題の選択肢は必ず指定された個数。
- 各問題には isCorrect:true が最低1つ必須。
- 単一正解問題は isCorrect:true をちょうど1つにする。
- 複数正解許可モードでも、全問を複数正解にはせず単一と複数を混在させる。
- 選択肢の順序は正解が特定の位置に偏らないようにする。
- 解説は「なぜ正解なのか」「他の選択肢がなぜ違うのか」を含む簡潔なもの。
- 事実不明な場合は推測で問題を作らず、Web検索で裏取りしてから出題する。
```

#### 4.9.2 ユーザープロンプト（テンプレート）

```
# 生成依頼
- テーマ / 資格名: {theme}
- 出題範囲 / 詳細指示: {scope || "（指定なし：テーマの頻出範囲からバランスよく）"}
- 出題言語: {language === "ja" ? "日本語" : "English"}
- 問題数: {count} 問
- 各問題の選択肢数: {choiceCount} 個
- 複数正解の混在: {multiSelect ? "許可（全問ではなく一部のみ複数正解にする）" : "禁止（全問で正解は1つのみ）"}

Web検索で最新情報・公式情報を確認した上で、上記条件を厳密に満たす
クイズをJSONで出力してください。
```

### 4.10 プロンプトインジェクション対策

- ユーザー入力（`theme`, `scope`）はテンプレート埋め込み前に以下をサニタイズ:
  - 長さ上限: `theme` 100文字 / `scope` 500文字
  - 改行文字（`\n`, `\r`）を半角スペースに置換（プロンプト構造破壊を防ぐ）
  - バッククォート `` ` `` をエスケープ（コードフェンス脱出を防ぐ）
  - 制御文字の除去
- 生成結果は必ずクライアント側スキーマバリデーション（zod）を通す
- 正解数が0の問題、選択肢数が指定と異なる問題は不正として再生成を促す
- システムプロンプトは固定文字列としてコード内に保持（ユーザー入力が混入しない構造）

---

## 5. コンポーネント設計

### 5.1 状態管理

useReducer + Context API

| Context | 状態 |
|---------|------|
| ExamContext | 試験CRUD、問題の追加/編集/削除 |
| PlayContext | プレイ状態、回答、出題数、スコア（メモリのみ。リロード・バック操作で破棄） |
| HistoryContext | 履歴一覧、削除 |
| SettingsContext | プロバイダー、APIキー×3、モデル名 |
| AIPreviewContext | AI生成プレビュー配列（メモリのみ。S-003を離れたタイミングでクリア） |

### 5.2 AnswerReviewコンポーネント（共通）

結果画面（S-006）と履歴画面（S-007）で共通使用する回答表示コンポーネント:

- 問題文を太字表示
- 全選択肢をリスト表示
- 正解の選択肢: 緑色左ボーダー + 緑背景 (`border-l-4 border-green-500 bg-green-50`)
- ユーザー選択かつ不正解: 赤色左ボーダー + 赤背景 (`border-l-4 border-red-500 bg-red-50`)
- ユーザー選択かつ正解: 緑背景 + チェックマーク
- 未選択かつ不正解: デフォルトスタイル（グレー）

---

### 5.3 HTTPクライアント抽象化

Web / ネイティブ環境でAI APIの呼び出し方法が異なるため、プロバイダー抽象化層の下にHTTPクライアント抽象化層を設ける。

```
httpClient.js
  - isNative = Capacitor.isNativePlatform()
  - request(config): isNative ? CapacitorHttp.request : fetch
```

- **Web環境**: 通常の `fetch` を使用。Anthropic呼び出し時は `anthropic-dangerous-direct-browser-access: true` ヘッダー、OpenAIは `dangerouslyAllowBrowser: true` 相当の直接呼び出しを行う
- **ネイティブ環境（Capacitor）**: `@capacitor/http`（CapacitorHttp）プラグインを使用してCORS制約を回避
- プロバイダー実装（`AnthropicProvider` 等）はこの抽象化層のみを参照し、環境差異を意識しない

### 5.4 ルーティング設計

| パス | ページ | 備考 |
|------|--------|------|
| `/` | HomePage | S-001 |
| `/exams/new` | ExamCreatePage | S-002a |
| `/exams/:id/edit` | ExamEditPage | S-002b |
| `/exams/:id/questions` | QuestionManagePage | S-003 |
| `/exams/:id/questions/:qid/edit` | QuestionEditPage | S-003b（既存問題編集） |
| `/exams/:id/questions/edit?source=preview&index=N` | QuestionEditPage | S-003b（AIプレビュー編集。クエリで識別） |
| `/play/:id` | PlayPage | S-005 |
| `/play/:id/result` | ResultPage | S-006 |
| `/history` | HistoryPage | S-007 |
| `/settings` | SettingsPage | S-008 |

> ※ GitHub Pages デプロイを想定するため、`vite.config.js` で `base: "/<リポジトリ名>/"` を設定し、`BrowserRouter` の `basename` も同値にする（または `HashRouter` を使用）。

### 5.5 デザイントークン（Tailwind `theme.extend.colors`）

ワイヤーフレーム準拠のブランドカラーを Tailwind に定義し、デフォルト色は使用しない。

| トークン | 値 | 用途 |
|----------|-----|------|
| `brand.primary` | `#185FA5` | プライマリアクション（ボタン枠・選択状態） |
| `brand.primary-bg` | `#E6F1FB` | プライマリボタン背景 |
| `brand.primary-text` | `#0C447C` | プライマリボタン文字色 |
| `brand.success` | `#0F6E56` | 成功アクション枠（スタート・回答する・登録） |
| `brand.success-bg` | `#E1F5EE` / `#EAF3DE` | 成功ボタン背景 / 正解選択肢背景 |
| `brand.success-text` | `#085041` / `#27500A` | 成功ボタン文字色 / 正解文字色 |
| `brand.success-border` | `#3B6D11` | 正解選択肢ボーダー |
| `brand.danger` | `#A32D2D` | 削除・破棄・不正解 |
| `brand.danger-bg` | `#FCEBEB` | 削除ボタン / 不正解背景 |
| `brand.danger-text` | `#791F1F` | 削除ボタン文字色 / 不正解文字色 |
| `brand.neutral-bg` | `#F8F8F6` / `#F1EFE8` | カード背景 / 非アクティブボタン |
| `brand.neutral-border` | `#D3D1C7` / `#B4B2A9` | 入力枠 / 区切り線 |
| `brand.neutral-text` | `#5F5E5A` / `#888780` / `#888880` | 本文・補足文 |
| `brand.ink` | `#1A1A1A` | 見出し・本文基本色 |
| `brand.accent` | `#EEEDFE` / `#534AB7` / `#3C3489` | 複数選択バッジ（背景/枠/文字） |
| `nav.bg` | `#111111` | ボトムナビ背景 |
| `nav.divider` | `#222222` | ボトムナビ上部区切り線 |
| `nav.active` | `#00E5FF` | ボトムナビアクティブ |
| `nav.inactive` | `#666666` | ボトムナビ非アクティブ |

---

## 6. PWA / ネイティブ設計

Capacitor でPWA化し、同じコードベースからiOS / Androidネイティブアプリもビルドする。

- Web: Service Workerによるオフラインキャッシュ、manifest.jsonでホーム画面追加対応
- iOS / Android: Capacitorでネイティブラッパーをビルド（`npx cap add ios` / `npx cap add android`）
- 保存済み試験はオフラインプレイ可能（localStorageにデータがあるため）
- AI生成はオンライン必須（オフライン時はエラー表示）
- モバイルファーストデザイン
- アイコン / スプラッシュは当面プレースホルダSVGで運用し、本番素材は後日差し替え
- ネイティブ環境のストレージは当面 `localStorage` を共通利用（将来 `@capacitor/preferences` への移行余地を残す）
- AI APIはWeb環境では `fetch` + dangerousフラグ、ネイティブ環境では `@capacitor/http`（CapacitorHttp）経由で呼び出す。環境判定は `Capacitor.isNativePlatform()` を使用
- 開発順序: まずWeb版（Vite + PWA）を完成させ、その後 `npx cap add ios` / `npx cap add android` でネイティブラッパーを追加する

### manifest.json

| 項目 | 値 |
|------|-----|
| name | AI Quiz Forge |
| short_name | QuizForge |
| start_url | / |
| display | standalone |
| theme_color | #1B3A5C |
| background_color | #FFFFFF |

---

## 7. ディレクトリ構成

```
ai-quiz-forge/
  .vscode/
    settings.json          # 保存時自動フォーマット設定
    extensions.json        # 推奨拡張機能
  public/
    manifest.json
    icons/
  src/
    components/
      common/              # BottomNav, Toast, ConfirmDialog, Badge
      home/                # ExamCard, EmptyState
      create/              # ExamForm
      questions/           # QuestionForm, ChoiceInput, QuestionCard
      ai/                  # GenerateForm, PreviewAccordion, ProviderSelector
      play/                # QuestionDisplay, ChoiceSelector, ProgressBar
      result/              # ScoreSummary, AnswerAccordion
      history/             # HistoryAccordion
      settings/            # ProviderSettings, ApiKeyInput, ExportButton, ImportButton
    contexts/
      ExamContext.jsx
      PlayContext.jsx
      HistoryContext.jsx
      SettingsContext.jsx
      AIPreviewContext.jsx  # AI生成プレビュー（メモリのみ、S-003離脱でクリア）
    pages/
      HomePage.jsx
      ExamCreatePage.jsx
      ExamEditPage.jsx
      QuestionManagePage.jsx
      QuestionEditPage.jsx
      PlayPage.jsx
      ResultPage.jsx
      HistoryPage.jsx
      SettingsPage.jsx
    providers/
      index.js             # getProvider ファクトリ
      anthropic.js         # AnthropicProvider
      openai.js            # OpenAIProvider
      openrouter.js        # OpenRouterProvider（:onlineサフィックス自動付与）
      httpClient.js        # Web(fetch) / Native(CapacitorHttp) 切替
    hooks/
      useLocalStorage.js
      useAIGenerate.js
    utils/
      storage.js
      exportImport.js
      uuid.js
    App.jsx
    main.jsx
    index.css
  eslint.config.js
  .prettierrc
  .prettierignore
  capacitor.config.ts      # Capacitor設定（appId, webDir 等）
  vite.config.js           # vite-plugin-eslint を設定
  tailwind.config.js       # theme.extend.colors にワイヤーフレーム準拠のブランドカラーを定義
  ios/                     # Capacitor生成（npx cap add ios）
  android/                 # Capacitor生成（npx cap add android）
  package.json
```

---

## 8. コード品質（ESLint / Prettier）

### ESLint

ESLint 9+ Flat Config形式（`eslint.config.js`）

**プラグイン:**
- `@eslint/js` — 推奨ルール
- `eslint-plugin-react` — React固有
- `eslint-plugin-react-hooks` — Hooksルール
- `eslint-plugin-jsx-a11y` — アクセシビリティ
- `eslint-config-prettier` — Prettier競合無効化

**主要ルール:**
- `no-unused-vars`: warn
- `react/prop-types`: off
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `jsx-a11y/anchor-is-valid`: warn

### Prettier

| オプション | 値 | 説明 |
|------------|-----|------|
| printWidth | 100 | 行の最大文字数 |
| tabWidth | 2 | インデント幅 |
| useTabs | false | スペースを使用 |
| semi | true | セミコロン付与 |
| singleQuote | false | ダブルクォートを使用 |
| trailingComma | es5 | 末尾カンマ |
| bracketSpacing | true | オブジェクトリテラルのスペース |
| jsxSingleQuote | false | JSX内もダブルクォート |

### npm scripts

| コマンド | 実行内容 |
|----------|----------|
| `npm run lint` | `eslint src/` |
| `npm run lint:fix` | `eslint src/ --fix` |
| `npm run format` | `prettier --write src/` |
| `npm run format:check` | `prettier --check src/` |

### 開発ワークフロー

- **保存時自動フォーマット（必須）:** `editor.formatOnSave: true`
- **保存時ESLint自動修正:** `editor.codeActionsOnSave: { source.fixAll.eslint: "explicit" }`
- **Viteビルド時:** `vite-plugin-eslint`でESLintチェック
- **推奨拡張:** ESLint (`dbaeumer.vscode-eslint`), Prettier (`esbenp.prettier-vscode`), Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

---

## 8.5 ビルド / デプロイ / テスト方針

### パッケージマネージャ
- **npm** を使用。`package-lock.json` をリポジトリに含める

### デプロイ
- **Web**: GitHub Pages にデプロイ
  - `vite.config.js` の `base` をリポジトリ名に合わせて設定
  - GitHub Actions で `main` ブランチ更新時に `npm run build` → `gh-pages` ブランチへ成果物を push
- **iOS / Android**: 後続フェーズで `npx cap add ios` / `npx cap add android` 実行後、Xcode / Android Studio からビルド

### 開発順序
1. Web版のスキャフォールド（Vite + React + Tailwind + ESLint/Prettier）
2. localStorage層・Context層・ルーティング
3. 画面実装（S-001 → S-002 → S-003 → S-003b → S-005 → S-006 → S-007 → S-008 の順）
4. AIプロバイダー抽象化＋HTTPクライアント抽象化（Web版 fetch のみ先行）
5. PWA化（manifest.json / Service Worker / プレースホルダアイコン）
6. GitHub Pages デプロイ
7. Capacitor 追加（`npx cap add ios/android`）＋ `CapacitorHttp` 切替対応

### テスト方針
- **MVPではユニットテスト / E2Eテストは実装しない**。手動動作確認で検収
- 将来的には Vitest（ユニット）・Playwright（E2E）の導入を検討

---

## 9. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンシブ | モバイルファースト、タブレット・デスクトップ対応 |
| パフォーマンス | FCP 2秒以内 |
| オフライン | 保存済み試験のプレイ可能 |
| データ容量 | localStorage上限5MB、警告表示 |
| ブラウザ | Chrome, Safari, Firefox, Edge |
| アクセシビリティ | WCAG 2.1 AA準拠 |

---

## 10. セキュリティ

- APIキー: プロバイダーごとにlocalStorage保存（マスク表示）
- API呼び出しはHTTPSのみ
- エクスポートにAPIキーは含めない
- インポート時JSONスキーマバリデーション実施
- XSS対策: React自動エスケープに依存、`dangerouslySetInnerHTML`不使用
- **個人利用前提**: AI APIはブラウザから直接呼び出し（Anthropicは `anthropic-dangerous-direct-browser-access: true`、OpenAIは `dangerouslyAllowBrowser: true` を使用）。APIキーはクライアントに平文保存されるため、共有端末・公開環境では使用しない
- 将来的に共有・公開する場合は、バックエンドプロキシ（Cloudflare Workers等）を導入してAPIキーをサーバー側に隔離すること

---

## 11. 今後の拡張案

- カテゴリ/タグ機能で試験を分類
- シャッフルモード（問題順序ランダム化）
- タイムアタックモード（制限時間付き）
- バックエンドプロキシによるAPIキー保護
- 試験共有機能（URL/QRコード）
- 弱点問題自動抽出（不正解率の高い問題を集中出題）
- 統計ダッシュボード（試験別・期間別の正答率推移）
- プロバイダー追加（Gemini, Mistral等）
