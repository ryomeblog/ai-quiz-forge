import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../components/common/PageHeader.jsx";
import QuestionForm from "../components/questions/QuestionForm.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import { useAIPreview } from "../contexts/AIPreviewContext.jsx";

export default function QuestionEditPage() {
  const { id, qid } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const source = search.get("source");
  const index = source === "preview" ? Number(search.get("index")) : null;

  const { getExam, updateQuestion } = useExams();
  const { preview, updatePreviewQuestion } = useAIPreview();

  const isPreviewMode = source === "preview";
  const exam = getExam(id);
  const existing = qid && exam ? exam.questions.find((q) => q.id === qid) : null;
  const previewQuestion = isPreviewMode && preview?.examId === id ? preview.questions[index] : null;

  const initial = isPreviewMode ? previewQuestion : existing;

  if (!initial) {
    return (
      <>
        <PageHeader title="問題を編集" backTo={`/exams/${id}/questions`} />
        <p className="p-4 text-brand-neutral-text">問題が見つかりません。</p>
      </>
    );
  }

  function handleSubmit(data) {
    if (isPreviewMode) {
      updatePreviewQuestion(index, (prev) => ({
        ...prev,
        ...data,
        isMultiSelect: data.choices.filter((c) => c.isCorrect).length >= 2,
      }));
      toast.success("プレビューに反映しました");
    } else {
      updateQuestion(id, qid, data);
      toast.success("保存しました");
    }
    navigate(`/exams/${id}/questions`);
  }

  return (
    <>
      <PageHeader title="問題を編集" backTo={`/exams/${id}/questions`} />
      <div className="mx-auto max-w-md p-4">
        <QuestionForm
          initial={initial}
          submitLabel="保存"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/exams/${id}/questions`)}
        />
      </div>
    </>
  );
}
