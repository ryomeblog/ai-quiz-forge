import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlay } from "../contexts/PlayContext.jsx";
import QuestionDisplay from "../components/play/QuestionDisplay.jsx";
import ProgressBar from "../components/play/ProgressBar.jsx";
import { FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";

export default function PlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, setSelection, goTo, endSession } = usePlay();

  // リロード / バック / バックグラウンドでセッション破棄
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        // ページ遷移ではなくタブ切替でも破棄（仕様どおり）
        endSession();
      }
    }
    function onPageShow(e) {
      if (e.persisted) {
        endSession();
        navigate("/", { replace: true });
      }
    }
    window.addEventListener("pagehide", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endSession, navigate]);

  // セッションがない/他試験のセッション → ホームへ
  useEffect(() => {
    if (!session || session.examId !== id) {
      navigate("/", { replace: true });
    }
  }, [session, id, navigate]);

  if (!session || session.examId !== id) return null;

  const idx = session.currentIndex;
  const total = session.questions.length;
  const q = session.questions[idx];
  const selected = session.selections[idx] || [];
  const isLast = idx === total - 1;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md flex-col">
      <header className="sticky top-0 z-20 border-b border-brand-neutral-border bg-brand-neutral-bg/90 px-4 py-3 backdrop-blur">
        <p className="text-sm font-semibold text-brand-ink">{session.examTitle}</p>
        <div className="mt-2">
          <ProgressBar current={idx} total={total} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <QuestionDisplay
          question={q}
          selected={selected}
          onChange={(next) => setSelection(idx, next)}
        />
      </main>

      <footer className="sticky bottom-[72px] z-20 flex gap-2 border-t border-brand-neutral-border bg-white/90 p-3 backdrop-blur">
        {idx > 0 ? (
          <button
            type="button"
            onClick={() => goTo(idx - 1)}
            className="inline-flex items-center gap-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-3 py-2 text-sm text-brand-ink"
          >
            <FiChevronLeft /> 前へ
          </button>
        ) : (
          <span className="flex-1" />
        )}
        <span className="flex-1" />
        {isLast ? (
          <button
            type="button"
            onClick={() => navigate(`/play/${id}/result`)}
            className="inline-flex items-center gap-1 rounded-md border border-brand-success bg-brand-success-bg px-3 py-2 text-sm font-medium text-brand-success-text"
          >
            <FiCheckCircle /> 回答する
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(idx + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-2 text-sm font-medium text-brand-primary-text"
          >
            次へ <FiChevronRight />
          </button>
        )}
      </footer>
    </div>
  );
}
