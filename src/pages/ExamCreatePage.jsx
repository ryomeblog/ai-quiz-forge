import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import ExamForm from "../components/create/ExamForm.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import toast from "react-hot-toast";

export default function ExamCreatePage() {
  const { createExam } = useExams();
  const navigate = useNavigate();

  function handleSubmit(data) {
    const id = createExam(data);
    toast.success("試験を作成しました");
    navigate(`/exams/${id}/questions`);
  }

  return (
    <>
      <PageHeader title="新しい試験を作成" backTo="/" />
      <div className="mx-auto max-w-md p-4">
        <ExamForm
          submitLabel="作成して問題を追加"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
        />
      </div>
    </>
  );
}
