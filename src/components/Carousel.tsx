"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A swipeable pager, like the weeks in iPhone Screen Time.
 *  - touch: native swipe, one page at a time (CSS scroll-snap)
 *  - mouse: click and drag
 *  - keyboard: left and right arrows
 *  - buttons elsewhere can change `index`; the pager scrolls to it
 */
export function Carousel({
  count, index, onIndex, renderPage, label,
}: { count: number; index: number; onIndex: (i: number) => void; renderPage: (i: number) => ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animating = useRef(false);
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean; dx: number } | null>(null);
  const justDragged = useRef(false); // the browser still fires a click after a drag ends: ignore it
  const clamp = (i: number) => Math.min(count - 1, Math.max(0, i));

  const jump = (i: number) => {
    const el = ref.current;
    if (el) el.scrollLeft = i * el.clientWidth;
  };
  const glide = (i: number) => {
    const el = ref.current;
    if (!el) return;
    animating.current = true;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setTimeout(() => { animating.current = false; }, 500);
  };

  // pages were replaced (another grain, or older data appeared): land on the right one without animation
  useIsoLayoutEffect(() => { jump(index); }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  // index changed from outside (arrow buttons): slide there
  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollLeft - index * el.clientWidth) > 2) glide(index);
  }, [index]);

  // keep the page aligned when the window is resized
  useEffect(() => {
    const onResize = () => jump(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index]);

  // the user swiped: report the page it settled on
  const onScroll = () => {
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current;
      if (!el || animating.current || drag.current?.moved) return;
      const i = clamp(Math.round(el.scrollLeft / el.clientWidth));
      if (i !== index) onIndex(i);
    }, 90);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); onIndex(clamp(index - 1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); onIndex(clamp(index + 1)); }
  };

  // mouse drag (touch already scrolls natively)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { startX: e.clientX, startLeft: ref.current.scrollLeft, moved: false, dx: 0 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = ref.current;
    if (!d || !el) return;
    const dx = e.clientX - d.startX;
    d.dx = dx;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.style.scrollSnapType = "none";
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const d = drag.current, el = ref.current;
    drag.current = null;
    if (!d || !el || !d.moved) return;
    justDragged.current = true;
    setTimeout(() => { justDragged.current = false; }, 80);
    // like a swipe on a phone: a short deliberate drag turns the page, it doesn't have to cross the halfway mark
    const threshold = Math.min(80, el.clientWidth * 0.15);
    const i = clamp(Math.abs(d.dx) > threshold ? index + (d.dx < 0 ? 1 : -1) : index);
    glide(i);
    setTimeout(() => { el.style.scrollSnapType = ""; onIndex(i); }, 520);
  };

  return (
    <div
      ref={ref} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={label}
      onScroll={onScroll} onKeyDown={onKeyDown}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
      onClickCapture={(e) => { if (justDragged.current) { e.stopPropagation(); e.preventDefault(); } }}
      className="no-scrollbar flex cursor-grab snap-x snap-mandatory overflow-x-auto rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-lavender-200/60 active:cursor-grabbing"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-full min-w-full shrink-0 snap-center snap-always" aria-hidden={i !== index}>
          {renderPage(i)}
        </div>
      ))}
    </div>
  );
}
