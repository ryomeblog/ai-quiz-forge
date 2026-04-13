import { useEffect, useRef, useState } from "react";

// 再利用可能なスライド式チュートリアル（外部ライブラリなし）
// props:
//  - slides: [{ title, description, image }]
//  - onFinish: () => void  // 「はじめる」「スキップ」共通の終了ハンドラ
//  - showSkip?: boolean (default true)
export default function Tutorial({ slides, onFinish, showSkip = true }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const containerRef = useRef(null);
  const dragStartXRef = useRef(null);
  const dragDxRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragDx, setDragDx] = useState(0);

  function go(i) {
    if (i < 0 || i >= total) return;
    setIndex(i);
  }
  const next = () => (isLast ? onFinish?.() : go(index + 1));
  const prev = () => (isFirst ? null : go(index - 1));

  // キーボード操作
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape" && showSkip) onFinish?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  // スワイプ（pointer events）
  function onPointerDown(e) {
    dragStartXRef.current = e.clientX;
    dragDxRef.current = 0;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (dragStartXRef.current === null) return;
    const dx = e.clientX - dragStartXRef.current;
    dragDxRef.current = dx;
    setDragDx(dx);
  }
  function onPointerUp() {
    if (dragStartXRef.current === null) return;
    const dx = dragDxRef.current;
    dragStartXRef.current = null;
    setDragging(false);
    setDragDx(0);
    const threshold = 50;
    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();
  }

  const containerWidth = containerRef.current?.clientWidth || 0;
  const offsetPct = -index * 100;
  const dragOffsetPct = dragging && containerWidth ? (dragDx / containerWidth) * 100 : 0;

  return (
    <div className="flex h-full flex-col bg-brand-neutral-bg">
      <header className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold text-brand-ink">AI Quiz Forge</p>
        {showSkip && !isLast ? (
          <button
            type="button"
            onClick={onFinish}
            className="rounded-md px-3 py-1 text-xs text-brand-neutral-text hover:bg-brand-neutral-bg-alt"
          >
            スキップ
          </button>
        ) : (
          <span className="w-12" />
        )}
      </header>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(${offsetPct}% + ${dragOffsetPct}%))`,
            transition: dragging ? "none" : "transform 300ms ease",
          }}
        >
          {slides.map((s, i) => (
            <Slide key={i} slide={s} active={i === index} />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 py-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`スライド ${i + 1} へ`}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-brand-primary"
                : "w-2 bg-brand-neutral-border-alt hover:bg-brand-neutral-text-alt"
            }`}
          />
        ))}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-brand-neutral-border bg-white px-4 py-3">
        <button
          type="button"
          onClick={prev}
          disabled={isFirst}
          className="inline-flex items-center gap-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-4 py-2 text-sm text-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 戻る
        </button>
        <span className="text-xs text-brand-neutral-text">
          {index + 1} / {total}
        </span>
        {isLast ? (
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-1 rounded-md border border-brand-success bg-brand-success-bg px-4 py-2 text-sm font-medium text-brand-success-text"
          >
            はじめる
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-4 py-2 text-sm font-medium text-brand-primary-text"
          >
            次へ →
          </button>
        )}
      </footer>
    </div>
  );
}

function Slide({ slide, active }) {
  return (
    <div
      className="flex h-full w-full shrink-0 flex-col items-center justify-center px-6 text-center"
      aria-hidden={!active}
    >
      {slide.image && (
        <img
          src={slide.image}
          alt=""
          draggable={false}
          className="mb-6 max-h-[55vh] w-auto max-w-xs rounded-lg object-contain shadow-sm"
        />
      )}
      <h2 className="mb-2 text-xl font-bold text-brand-ink">{slide.title}</h2>
      <p className="max-w-sm whitespace-pre-wrap text-sm leading-relaxed text-brand-neutral-text">
        {slide.description}
      </p>
    </div>
  );
}
