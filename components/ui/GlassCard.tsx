import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Translucent, blurred card with a 1px border and a diagonal gradient overlay.
 * Web port of the mobile GlassCard (radius 24). The core surface used across
 * auth, feed, wallet, settings, etc.
 */
export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** blur radius in px (mobile `intensity`) */
  intensity?: number;
  /** override the 1px border color */
  borderColor?: string;
  as?: "div" | "section" | "article";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { className, intensity = 20, borderColor, style, children, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[24px] border border-[var(--glass-border)]",
          "bg-[var(--glass-bg)] shadow-sm",
          className
        )}
        style={{
          backdropFilter: `blur(${intensity}px)`,
          WebkitBackdropFilter: `blur(${intensity}px)`,
          ...(borderColor ? { borderColor } : null),
          ...style,
        }}
        {...rest}
      >
        {/* diagonal gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    );
  }
);
