import { Link, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader.jsx";
import ExamCard from "../components/home/ExamCard.jsx";
import EmptyState from "../components/home/EmptyState.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import { usePlay } from "../contexts/PlayContext.jsx";
import { useHistory } from "../contexts/HistoryContext.jsx";
import { useState } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";

export default function HomePage() {
  const { exams, deleteExam } = useExams();
  const { startSession } = usePlay();
  const { deleteByExam } = useHistory();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState(null);

  function handleStart(exam, count) {
    if (exam.questions.length === 0 || count < 1) return;
    startSession(exam, count);
    navigate(`/play/${exam.id}`);
  }

  return (
    <>
      <PageHeader
        title="AI Quiz Forge"
        right={
          <Link
            to="/exams/new"
            className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-1.5 text-sm font-medium text-brand-primary-text"
          >
            <FiPlus /> 新規
          </Link>
        }
      />
      <div className="mx-auto max-w-md space-y-3 p-4">
        {exams.length === 0 ? (
          <EmptyState />
        ) : (
          exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={(count) => handleStart(exam, count)}
              onDeleteRequest={() => setPendingDelete(exam)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="試験を削除しますか？"
        description={
          pendingDelete ? `「${pendingDelete.title}」と関連する履歴も削除されます。` : ""
        }
        confirmLabel="削除"
        cancelLabel="キャンセル"
        danger
        onConfirm={() => {
          if (pendingDelete) {
            deleteByExam(pendingDelete.id);
            deleteExam(pendingDelete.id);
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
