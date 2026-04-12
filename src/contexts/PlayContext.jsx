import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { sample, shuffle } from "../utils/shuffle.js";

const PlayContext = createContext(null);

export function PlayProvider({ children }) {
  const [session, setSession] = useState(null);
  const leaveGuardRef = useRef(false);

  const startSession = useCallback((exam, count) => {
    const picked = sample(exam.questions, count);
    const questions = picked.map((q) => ({
      ...q,
      choices: shuffle(q.choices),
    }));
    setSession({
      examId: exam.id,
      examTitle: exam.title,
      questions,
      currentIndex: 0,
      selections: questions.map(() => []),
      startedAt: new Date().toISOString(),
    });
  }, []);

  const setSelection = useCallback((index, selectedIds) => {
    setSession((prev) => {
      if (!prev) return prev;
      const selections = [...prev.selections];
      selections[index] = selectedIds;
      return { ...prev, selections };
    });
  }, []);

  const goTo = useCallback((index) => {
    setSession((prev) => (prev ? { ...prev, currentIndex: index } : prev));
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      startSession,
      setSelection,
      goTo,
      endSession,
      leaveGuardRef,
    }),
    [session, startSession, setSelection, goTo, endSession]
  );

  return <PlayContext.Provider value={value}>{children}</PlayContext.Provider>;
}

export function usePlay() {
  const ctx = useContext(PlayContext);
  if (!ctx) throw new Error("usePlay must be used within PlayProvider");
  return ctx;
}
