"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Pill-shaped gradient primary button with an orange glow — the app's main CTA.
 * Variants cover the common secondary/ghost/danger cases too.
 */
export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-6 text-base",
};

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  PrimaryButtonProps
>(function PrimaryButton(
  {
    className,
    variant = "primary",
    size = "lg",
    loading,
    fullWidth = true,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";
  const variants: Record<string, string> = {
    primary: "bg-brand-gradient text-white shadow-glow hover:brightness-105",
    secondary:
      "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-light)] hover:bg-[var(--input)]",
    outline:
      "bg-transparent text-[var(--foreground)] border border-[var(--border-light)] hover:bg-[var(--input)]",
    ghost:
      "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input)]",
    danger: "bg-[var(--error)] text-white hover:brightness-105",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});
