export function gradeAnswers(session) {
  const answers = session.questions.map((q, i) => {
    const selected = session.selections[i] || [];
    const correctIds = q.choices.filter((c) => c.isCorrect).map((c) => c.id);
    const sortedSel = [...selected].sort();
    const sortedCorrect = [...correctIds].sort();
    const isCorrect =
      sortedSel.length === sortedCorrect.length &&
      sortedSel.every((x, idx) => x === sortedCorrect[idx]);
    return {
      questionId: q.id,
      questionText: q.text,
      choices: q.choices,
      selectedChoiceIds: selected,
      correctChoiceIds: correctIds,
      isCorrect,
    };
  });
  const score = answers.filter((a) => a.isCorrect).length;
  return { answers, score, total: session.questions.length };
}
