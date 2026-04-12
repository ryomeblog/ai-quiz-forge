import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import ExamForm from "../components/create/ExamForm.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import toast from "react-hot-toast";

export default function ExamEditPage() {
  const { id } = useParams();
  const { getExam, updateExam } = useExams();
  const navigate = useNavigate();
  const exam = getExam(id);

  if (!exam) {
    return (
      <>
        <PageHeader title="試験を編集" backTo="/" />
        <p className="p-4 text-brand-neutral-text">試験が見つかりません。</p>
      </>
    );
  }

  function handleSubmit(data) {
    updateExam(id, data);
    toast.success("保存しました");
    navigate("/");
  }

  return (
    <>
      <PageHeader title="試験を編集" backTo="/" />
      <div className="mx-auto max-w-md p-4">
        <ExamForm
          initial={{ title: exam.title, description: exam.description || "" }}
          submitLabel="保存"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
          questionCount={exam.questions.length}
        />
      </div>
    </>
  );
}
