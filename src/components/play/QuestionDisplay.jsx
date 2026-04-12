import Badge from "../common/Badge.jsx";
import ChoiceSelector from "./ChoiceSelector.jsx";

export default function QuestionDisplay({ question, selected, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={question.isMultiSelect ? "multi" : "single"} />
        {question.isMultiSelect && (
          <span className="text-xs text-brand-neutral-text">すべて選べ</span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-base text-brand-ink">{question.text}</p>
      <ChoiceSelector question={question} selected={selected} onChange={onChange} />
      <p className="text-xs text-brand-neutral-text-alt">正解は結果画面で確認できます。</p>
    </div>
  );
}
