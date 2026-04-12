import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import ScoreSummary from "../components/result/ScoreSummary.jsx";
import AnswerAccordion from "../components/result/AnswerAccordion.jsx";
import { usePlay } from "../contexts/PlayContext.jsx";
import { useHistory } from "../contexts/HistoryContext.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import { gradeAnswers } from "../utils/grading.js";
import { uuid } from "../utils/uuid.js";

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, startSession, endSession } = usePlay();
  const { addHistory } = useHistory();
  const { getExam } = useExams();
  const savedRef = useRef(false);

  const graded = useMemo(() => {
    if (!session || session.examId !== id) return null;
    return gradeAnswers(session);
  }, [session, id]);

  useEffect(() => {
    if (!session || session.examId !== id) {
      navigate("/", { replace: true });
      return;
    }
    if (!graded || savedRef.current) return;
    savedRef.current = true;
    addHistory({
      id: uuid(),
      examId: id,
      examTitle: session.examTitle,
      score: graded.score,
      totalQuestions: graded.total,
      answers: graded.answers,
      playedAt: new Date().toISOString(),
    });
  }, [graded, session, id, addHistory, navigate]);

  if (!graded) return null;

  function handleRetry() {
    const exam = getExam(id);
    if (!exam) {
      navigate("/");
      return;
    }
    startSession(exam, graded.total);
    savedRef.current = false;
    navigate(`/play/${id}`, { replace: true });
  }

  function handleHome() {
    endSession();
    navigate("/");
  }

  return (
    <>
      <PageHeader title="結果" />
      <div className="mx-auto max-w-md space-y-4 p-4">
        <ScoreSummary score={graded.score} total={graded.total} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRetry}
            className="flex-1 rounded-md border border-brand-primary bg-brand-primary-bg px-4 py-2 font-medium text-brand-primary-text"
          >
            もう一度
          </button>
          <button
            type="button"
            onClick={handleHome}
            className="flex-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-4 py-2 text-brand-ink"
          >
            ホームに戻る
          </button>
        </div>
        <AnswerAccordion answers={graded.answers} />
      </div>
    </>
  );
}
