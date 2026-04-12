import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AIPreviewContext = createContext(null);

export function AIPreviewProvider({ children }) {
  const [preview, setPreview] = useState(null); // { examId, questions: [...] }

  const setPreviewFor = useCallback((examId, questions) => {
    setPreview({ examId, questions });
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const updatePreviewQuestion = useCallback((index, updater) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const questions = prev.questions.map((q, i) => (i === index ? updater(q) : q));
      return { ...prev, questions };
    });
  }, []);

  const removePreviewQuestion = useCallback((index) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const questions = prev.questions.filter((_, i) => i !== index);
      if (questions.length === 0) return null;
      return { ...prev, questions };
    });
  }, []);

  const value = useMemo(
    () => ({
      preview,
      setPreviewFor,
      clearPreview,
      updatePreviewQuestion,
      removePreviewQuestion,
    }),
    [preview, setPreviewFor, clearPreview, updatePreviewQuestion, removePreviewQuestion]
  );

  return <AIPreviewContext.Provider value={value}>{children}</AIPreviewContext.Provider>;
}

export function useAIPreview() {
  const ctx = useContext(AIPreviewContext);
  if (!ctx) throw new Error("useAIPreview must be used within AIPreviewProvider");
  return ctx;
}
