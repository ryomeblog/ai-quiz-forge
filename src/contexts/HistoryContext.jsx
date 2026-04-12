import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, readJSON, writeJSON } from "../utils/storage.js";
import { uuid } from "../utils/uuid.js";

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => readJSON(KEYS.history, []));

  useEffect(() => {
    writeJSON(KEYS.history, history);
  }, [history]);

  const addHistory = useCallback((entry) => {
    const id = entry.id || uuid();
    const record = { ...entry, id };
    setHistory((prev) => [record, ...prev]);
    return id;
  }, []);

  const deleteHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const deleteByExam = useCallback((examId) => {
    setHistory((prev) => prev.filter((h) => h.examId !== examId));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const replaceAll = useCallback((next) => {
    setHistory(next);
  }, []);

  const getLatestForExam = useCallback(
    (examId) => {
      const entries = history.filter((h) => h.examId === examId);
      if (entries.length === 0) return null;
      return entries.reduce((a, b) => (a.playedAt > b.playedAt ? a : b));
    },
    [history]
  );

  const hasPerfectForCurrentExam = useCallback(
    (examId, examUpdatedAt) => {
      return history.some(
        (h) =>
          h.examId === examId &&
          h.score === h.totalQuestions &&
          h.totalQuestions > 0 &&
          h.playedAt >= examUpdatedAt
      );
    },
    [history]
  );

  const value = useMemo(
    () => ({
      history,
      addHistory,
      deleteHistory,
      deleteByExam,
      clearHistory,
      replaceAll,
      getLatestForExam,
      hasPerfectForCurrentExam,
    }),
    [
      history,
      addHistory,
      deleteHistory,
      deleteByExam,
      clearHistory,
      replaceAll,
      getLatestForExam,
      hasPerfectForCurrentExam,
    ]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
