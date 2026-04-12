import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import toast from "react-hot-toast";
import PageHeader from "../components/common/PageHeader.jsx";
import QuestionForm from "../components/questions/QuestionForm.jsx";
import QuestionCard from "../components/questions/QuestionCard.jsx";
import GenerateForm from "../components/ai/GenerateForm.jsx";
import PreviewAccordion from "../components/ai/PreviewAccordion.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import { useAIPreview } from "../contexts/AIPreviewContext.jsx";
import useAIGenerate from "../hooks/useAIGenerate.js";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function QuestionManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExam, addQuestion, addQuestionsBulk, deleteQuestion } = useExams();
  const { preview, setPreviewFor, clearPreview, removePreviewQuestion } = useAIPreview();
  const { run: runAI, loading: aiLoading, error: aiError, clearError } = useAIGenerate();
  const [pendingDelete, setPendingDelete] = useState(null);

  const exam = getExam(id);

  // 画面離脱時にプレビュークリア（別の試験・他ページへの遷移で）
  useEffect(() => {
    return () => {
      if (preview && preview.examId !== id) {
        clearPreview();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!exam) {
    return (
      <>
        <PageHeader title="問題管理" backTo="/" />
        <p className="p-4 text-brand-neutral-text">試験が見つかりません。</p>
      </>
    );
  }

  const previewQuestions = preview?.examId === id ? preview.questions : [];

  async function handleGenerate(params) {
    clearError();
    try {
      const qs = await runAI(params);
      setPreviewFor(id, qs);
      toast.success(`${qs.length} 問を生成しました`);
    } catch (e) {
      toast.error(e.message || "生成に失敗しました");
    }
  }

  function handleAddManual(data) {
    addQuestion(id, data);
    toast.success("問題を追加しました");
  }

  function handleSaveAllPreview() {
    if (previewQuestions.length === 0) return;
    addQuestionsBulk(id, previewQuestions);
    clearPreview();
    toast.success(`${previewQuestions.length} 問を登録しました`);
  }

  return (
    <>
      <PageHeader title={`問題管理: ${exam.title}`} backTo="/" />
      <div className="mx-auto max-w-md space-y-5 p-4">
        <Tab.Group>
          <Tab.List className="flex rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt p-1">
            {["手動作成", "AI生成"].map((label) => (
              <Tab
                key={label}
                className={({ selected }) =>
                  cn(
                    "flex-1 rounded px-3 py-1.5 text-sm",
                    selected
                      ? "bg-white font-semibold text-brand-primary-text shadow"
                      : "text-brand-neutral-text"
                  )
                }
              >
                {label}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-3">
            <Tab.Panel>
              <QuestionForm onSubmit={handleAddManual} />
            </Tab.Panel>
            <Tab.Panel className="space-y-4">
              <GenerateForm loading={aiLoading} onGenerate={handleGenerate} />
              {aiError && (
                <p className="rounded-md border border-brand-danger bg-brand-danger-bg p-2 text-sm text-brand-danger-text">
                  {aiError}
                </p>
              )}
              {previewQuestions.length > 0 && (
                <PreviewAccordion
                  questions={previewQuestions}
                  onRemove={removePreviewQuestion}
                  onSaveAll={handleSaveAllPreview}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-brand-ink">
            登録済みの問題 ({exam.questions.length})
          </h2>
          {exam.questions.length === 0 ? (
            <p className="rounded-md border border-dashed border-brand-neutral-border bg-white p-4 text-center text-sm text-brand-neutral-text">
              まだ問題がありません
            </p>
          ) : (
            <div className="space-y-2">
              {exam.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  examId={id}
                  question={q}
                  index={i}
                  onDelete={() => setPendingDelete(q)}
                />
              ))}
            </div>
          )}
        </section>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-4 py-2 text-brand-ink"
          >
            ホームに戻る
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="問題を削除しますか？"
        description={pendingDelete?.text?.slice(0, 60)}
        confirmLabel="削除"
        danger
        onConfirm={() => {
          if (pendingDelete) deleteQuestion(id, pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
