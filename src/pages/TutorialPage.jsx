import { useNavigate } from "react-router-dom";
import Tutorial from "../components/tutorial/Tutorial.jsx";
import { KEYS, writeString } from "../utils/storage.js";

const BASE = import.meta.env.BASE_URL;

const SLIDES = [
  {
    title: "ようこそ、AI Quiz Forge へ",
    description:
      "AIが最新情報をもとに選択式クイズを生成し、繰り返し学習できるPWAアプリです。\nまずは使い方をざっと見ていきましょう。",
    image: `${BASE}img/001.png`,
  },
  {
    title: "試験を作成する",
    description:
      "ホーム画面の「+ 新規」から、学習テーマごとに試験を作成できます。\nタイトルと説明を入力するだけで始められます。",
    image: `${BASE}img/002.png`,
  },
  {
    title: "問題を追加する",
    description:
      "ホームの「問題」ボタンから手動で問題を追加できます。\n問題文・選択肢・正解・解説を入力します。",
    image: `${BASE}img/003.png`,
  },
  {
    title: "AIで問題を自動生成",
    description:
      "AI生成タブからテーマと出題範囲、問題数を指定するだけで、選択式問題が自動生成されます。\n生成結果はその場で編集も可能です。",
    image: `${BASE}img/004.png`,
  },
  {
    title: "プロバイダーを選ぶ",
    description:
      "Anthropic / OpenAI / OpenRouter から好みのAIを選択できます。\n設定画面でAPIキーを登録してください。",
    image: `${BASE}img/005.png`,
  },
  {
    title: "プレイ開始",
    description:
      "出題数をスライダーで指定して「スタート」。\n問題と選択肢はランダムに並び替えて出題されます。",
    image: `${BASE}img/006.png`,
  },
  {
    title: "回答する",
    description:
      "単一選択／複数選択に応じてUIが切り替わります。\n途中で前の問題に戻ることもできます。",
    image: `${BASE}img/007.png`,
  },
  {
    title: "結果と解説を確認",
    description:
      "正答率とともに、問題ごとの正誤・解説をアコーディオンで確認できます。\n間違えた問題を見直して理解を深めましょう。",
    image: `${BASE}img/008.png`,
  },
  {
    title: "履歴で振り返り",
    description:
      "過去のプレイ結果はすべて履歴に保存されます。\n試験を全問正解すると★が付与されます。",
    image: `${BASE}img/009.png`,
  },
  {
    title: "設定とデータ管理",
    description:
      "設定画面ではこのチュートリアルをいつでも見直せます。\nまた、試験と履歴のJSONエクスポート／インポート、全データ削除など、データ管理もここから行えます。",
    image: `${BASE}img/010.png`,
  },
  {
    title: "さあ、はじめましょう！",
    description:
      "AI Quiz Forgeがあなたの学習をサポートします。\nまずは試験を作成してみましょう！",
  },
];

export default function TutorialPage({ onComplete }) {
  const navigate = useNavigate();

  function finish() {
    writeString(KEYS.tutorialSeen, "1");
    if (onComplete) {
      onComplete();
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand-neutral-bg">
      <Tutorial slides={SLIDES} onFinish={finish} />
    </div>
  );
}
