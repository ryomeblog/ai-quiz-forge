import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, onBack, backTo, right }) {
  const navigate = useNavigate();
  const showBack = !!(onBack || backTo);
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-brand-neutral-border bg-brand-neutral-bg/90 px-4 py-3 backdrop-blur">
      {showBack ? (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(backTo))}
          className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-ink hover:bg-brand-neutral-bg-alt"
          aria-label="戻る"
        >
          <FiChevronLeft size={22} />
        </button>
      ) : null}
      <h1 className="flex-1 truncate text-base font-semibold text-brand-ink">{title}</h1>
      {right}
    </header>
  );
}
