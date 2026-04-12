import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, readJSON, writeJSON } from "../utils/storage.js";
import { uuid } from "../utils/uuid.js";

const ExamContext = createContext(null);

function nowISO() {
  return new Date().toISOString();
}

function computeIsMultiSelect(choices) {
  return choices.filter((c) => c.isCorrect).length >= 2;
}

export function ExamProvider({ children }) {
  const [exams, setExams] = useState(() => readJSON(KEYS.exams, []));

  useEffect(() => {
    writeJSON(KEYS.exams, exams);
  }, [exams]);

  const getExam = useCallback((id) => exams.find((e) => e.id === id) || null, [exams]);

  const createExam = useCallback(({ title, description }) => {
    const id = uuid();
    const t = nowISO();
    const exam = {
      id,
      title: title.trim(),
      description: (description || "").trim() || null,
      questions: [],
      createdAt: t,
      updatedAt: t,
    };
    setExams((prev) => [exam, ...prev]);
    return id;
  }, []);

  const updateExam = useCallback((id, patch) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...patch,
              description:
                patch.description !== undefined ? patch.description || null : e.description,
              updatedAt: nowISO(),
            }
          : e
      )
    );
  }, []);

  const deleteExam = useCallback((id) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addQuestion = useCallback((examId, questionInput) => {
    const qid = uuid();
    const question = normalizeQuestion({ ...questionInput, id: qid });
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, questions: [...e.questions, question], updatedAt: nowISO() } : e
      )
    );
    return qid;
  }, []);

  const addQuestionsBulk = useCallback((examId, questionsInput) => {
    const normalized = questionsInput.map((q) => normalizeQuestion({ ...q, id: q.id || uuid() }));
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? { ...e, questions: [...e.questions, ...normalized], updatedAt: nowISO() }
          : e
      )
    );
  }, []);

  const updateQuestion = useCallback((examId, questionId, patch) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          updatedAt: nowISO(),
          questions: e.questions.map((q) => {
            if (q.id !== questionId) return q;
            const merged = { ...q, ...patch };
            return normalizeQuestion(merged);
          }),
        };
      })
    );
  }, []);

  const deleteQuestion = useCallback((examId, questionId) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              questions: e.questions.filter((q) => q.id !== questionId),
              updatedAt: nowISO(),
            }
          : e
      )
    );
  }, []);

  const replaceAll = useCallback((nextExams) => {
    setExams(nextExams);
  }, []);

  const value = useMemo(
    () => ({
      exams,
      getExam,
      createExam,
      updateExam,
      deleteExam,
      addQuestion,
      addQuestionsBulk,
      updateQuestion,
      deleteQuestion,
      replaceAll,
    }),
    [
      exams,
      getExam,
      createExam,
      updateExam,
      deleteExam,
      addQuestion,
      addQuestionsBulk,
      updateQuestion,
      deleteQuestion,
      replaceAll,
    ]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExams() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExams must be used within ExamProvider");
  return ctx;
}

function normalizeQuestion(q) {
  const choices = (q.choices || []).map((c) => ({
    id: c.id || uuid(),
    text: c.text,
    isCorrect: !!c.isCorrect,
  }));
  return {
    id: q.id,
    text: q.text,
    choices,
    isMultiSelect: computeIsMultiSelect(choices),
    explanation: q.explanation ?? null,
    source: q.source || "manual",
  };
}
