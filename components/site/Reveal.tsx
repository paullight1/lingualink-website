import type { CSSProperties, ReactNode } from "react";

/*
  Scroll-in reveal built on CSS scroll-driven animations (see globals.css).
  Content is fully visible by default: browsers without support, headless
  renderers and no-JS visitors all see the finished layout.
  `delay` is accepted for entrance staggering when the element also uses
  time-based animation; scroll timelines ignore it.
*/
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style: CSSProperties | undefined = delay
    ? { animationDelay: `${delay}s` }
    : undefined;
  return (
    <div className={`reveal ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
