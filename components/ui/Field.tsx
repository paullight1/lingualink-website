"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle, ChevronDown, Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The shared form kit. Every text control in the app routes through these so
 * label/height/radius/focus behaviour stay identical across auth, onboarding,
 * modals and settings.
 *
 *   <Field label="Username" error={err}>
 *     <Input icon={User} placeholder="tunde_heritage" value={v} onChange={…} />
 *   </Field>
 *
 * `Field` publishes the generated id + aria wiring through context, so the
 * control inside picks up `id`, `aria-invalid` and `aria-describedby` without
 * the caller repeating them.
 */

export type FieldVariant = "solid" | "glass";
export type FieldSize = "sm" | "md" | "lg";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Client components still render on the server, where useLayoutEffect warns.
 * Measuring only matters in the browser, so fall back to useEffect there.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

/**
 * `suffixBtn` keeps a trailing icon *button* optically aligned with the
 * leading icon. A centred glyph sits `(button - icon) / 2` inside its own box,
 * so the button is pulled right by exactly that much: the trailing glyph then
 * lands on the same inset as `box`'s horizontal padding, mirroring the icon on
 * the left instead of floating a few px short of it.
 */
const SIZE = {
  sm: {
    box: "h-10 gap-2 px-3",
    text: "text-[14px]",
    icon: "h-4 w-4",
    suffixBtn: "h-8 w-8 -mr-2", // (32-16)/2 = 8
  },
  md: {
    box: "h-12 gap-2.5 px-3.5",
    text: "text-[15px]",
    icon: "h-[18px] w-[18px]",
    suffixBtn: "h-9 w-9 -mr-[9px]", // (36-18)/2 = 9
  },
  lg: {
    box: "h-14 gap-3 px-4",
    text: "text-[15px]",
    icon: "h-5 w-5",
    suffixBtn: "h-10 w-10 -mr-2.5", // (40-20)/2 = 10
  },
} as const;

/** Border + background + focus ring shared by input, textarea and select. */
function shellClass(variant: FieldVariant, invalid?: boolean, disabled?: boolean) {
  return cn(
    "relative flex w-full items-center rounded-[16px] border transition-[border-color,box-shadow,background-color] duration-150",
    variant === "glass"
      ? "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl"
      : "border-[var(--field-border)] bg-[var(--field-bg)]",
    !disabled && "hover:border-[var(--field-border-hover)]",
    // The control itself has `outline-none`; the ring lives on the wrapper so
    // the icon and suffix are enclosed by it.
    "focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_4px_var(--field-ring)] focus-within:hover:border-[var(--color-primary)]",
    invalid &&
      "border-[var(--error)] hover:border-[var(--error)] focus-within:border-[var(--error)] focus-within:shadow-[0_0_0_4px_var(--field-ring-error)]",
    disabled && "cursor-not-allowed opacity-55"
  );
}

const controlClass =
  "w-full min-w-0 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)] disabled:cursor-not-allowed";

/* ------------------------------------------------------------------ */
/* Field — label / hint / error / counter wrapper                      */
/* ------------------------------------------------------------------ */

export interface FieldProps {
  label?: ReactNode;
  /** Helper copy under the control. Hidden while an error is showing. */
  hint?: ReactNode;
  /** Renders a muted "Optional" tag beside the label. */
  optional?: boolean;
  error?: string;
  /** Live character count, right-aligned on the label row. */
  counter?: { value: number; max: number };
  /**
   * Inline control on the label row, opposite the label — e.g. a
   * "Forgot password?" link. Belongs here rather than under the control, where
   * it would sit at the same 8px offset the label uses and read as a caption
   * for the field below it. Ignored when `counter` is set.
   */
  action?: ReactNode;
  /** Override the generated id (must match the control's own `id`). */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  optional,
  error,
  counter,
  action,
  htmlFor,
  className,
  children,
}: FieldProps) {
  const generated = useId();
  const id = htmlFor ?? `field-${generated}`;
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const overLimit = counter ? counter.value > counter.max : false;

  return (
    <FieldContext.Provider
      value={{ id, describedBy: messageId, invalid: Boolean(error) }}
    >
      <div className={cn("flex w-full flex-col gap-2", className)}>
        {(label || counter || action) && (
          <div className="flex items-baseline justify-between gap-3">
            {label ? (
              <label
                htmlFor={id}
                className="text-[13px] font-semibold leading-none text-[var(--foreground)]"
              >
                {label}
                {optional && (
                  <span className="ml-1.5 text-[12px] font-medium text-[var(--muted-2)]">
                    Optional
                  </span>
                )}
              </label>
            ) : (
              <span />
            )}
            {counter ? (
              <span
                className={cn(
                  "shrink-0 text-[11px] font-medium tabular-nums leading-none",
                  overLimit ? "text-[var(--error)]" : "text-[var(--muted-2)]"
                )}
              >
                {counter.value}/{counter.max}
              </span>
            ) : action ? (
              <span className="shrink-0 leading-none">{action}</span>
            ) : null}
          </div>
        )}

        {children}

        {error ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-start gap-1.5 text-[12px] font-medium leading-snug text-[var(--error)]"
          >
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p
            id={messageId}
            className="text-[12px] leading-snug text-[var(--muted-2)]"
          >
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/** Reads the wiring `Field` published, if this control is inside one. */
function useFieldWiring(props: {
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}) {
  const ctx = useContext(FieldContext);
  return {
    id: props.id ?? ctx?.id,
    invalid: props.invalid ?? ctx?.invalid ?? false,
    describedBy: props["aria-describedby"] ?? ctx?.describedBy,
  };
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Leading glyph (a lucide icon component). */
  icon?: React.ElementType;
  /** Trailing node — a status icon, unit label, inline action. */
  suffix?: ReactNode;
  variant?: FieldVariant;
  size?: FieldSize;
  invalid?: boolean;
  /** Centre only genuinely centred content such as OTP codes. */
  align?: "left" | "center";
  /** Class for the outer shell rather than the <input>. */
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    icon: Icon,
    suffix,
    variant = "solid",
    size = "lg",
    invalid,
    align = "left",
    className,
    wrapperClassName,
    disabled,
    ...rest
  },
  ref
) {
  const wiring = useFieldWiring({
    id: rest.id,
    invalid,
    "aria-describedby": rest["aria-describedby"],
  });
  const s = SIZE[size];

  return (
    <div
      className={cn(shellClass(variant, wiring.invalid, disabled), s.box, wrapperClassName)}
    >
      {Icon && (
        <Icon
          aria-hidden
          className={cn(
            "shrink-0 text-[var(--muted-2)] transition-colors",
            s.icon
          )}
        />
      )}
      <input
        ref={ref}
        disabled={disabled}
        {...rest}
        id={wiring.id}
        aria-invalid={wiring.invalid || undefined}
        aria-describedby={wiring.describedBy}
        className={cn(
          controlClass,
          "h-full",
          s.text,
          align === "center" && "text-center",
          className
        )}
      />
      {suffix && <span className="flex shrink-0 items-center">{suffix}</span>}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* PasswordInput — Input plus a self-managed reveal toggle             */
/* ------------------------------------------------------------------ */

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type" | "suffix">
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  // The reveal glyph has to match the leading icon's size and inset, or the two
  // ends of the same bar read as different fields.
  const s = SIZE[props.size ?? "lg"];
  const Glyph = visible ? EyeOff : Eye;

  return (
    <Input
      ref={ref}
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      suffix={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={cn(
            "flex items-center justify-center rounded-full text-[var(--muted-2)] transition-colors hover:text-[var(--color-primary)]",
            s.suffixBtn
          )}
        >
          <Glyph className={s.icon} />
        </button>
      }
    />
  );
});

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: FieldVariant;
  invalid?: boolean;
  wrapperClassName?: string;
  /**
   * Grow with the content instead of scrolling inside a fixed box. For
   * composers that start one line tall — cap the growth with `maxHeight`.
   */
  autoResize?: boolean;
  /** Ceiling for `autoResize`, in px. Beyond it the textarea scrolls. */
  maxHeight?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      variant = "solid",
      invalid,
      className,
      wrapperClassName,
      disabled,
      rows = 3,
      autoResize,
      maxHeight = 160,
      ...rest
    },
    ref
  ) {
    const wiring = useFieldWiring({
      id: rest.id,
      invalid,
      "aria-describedby": rest["aria-describedby"],
    });

    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Re-measure on every value change: collapse to `auto` first so the
    // scrollHeight reflects the content rather than the previous height.
    useIsomorphicLayoutEffect(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [autoResize, maxHeight, rest.value]);

    return (
      <div
        className={cn(
          shellClass(variant, wiring.invalid, disabled),
          "items-stretch px-4 py-3",
          wrapperClassName
        )}
      >
        <textarea
          ref={setRefs}
          rows={rows}
          disabled={disabled}
          {...rest}
          id={wiring.id}
          aria-invalid={wiring.invalid || undefined}
          aria-describedby={wiring.describedBy}
          className={cn(
            controlClass,
            "resize-none text-[15px] leading-relaxed",
            className
          )}
        />
      </div>
    );
  }
);

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  icon?: React.ElementType;
  variant?: FieldVariant;
  size?: FieldSize;
  invalid?: boolean;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    icon: Icon,
    variant = "solid",
    size = "lg",
    invalid,
    className,
    wrapperClassName,
    disabled,
    children,
    ...rest
  },
  ref
) {
  const wiring = useFieldWiring({
    id: rest.id,
    invalid,
    "aria-describedby": rest["aria-describedby"],
  });
  const s = SIZE[size];

  return (
    <div
      className={cn(shellClass(variant, wiring.invalid, disabled), s.box, wrapperClassName)}
    >
      {Icon && (
        <Icon aria-hidden className={cn("shrink-0 text-[var(--muted-2)]", s.icon)} />
      )}
      <select
        ref={ref}
        disabled={disabled}
        {...rest}
        id={wiring.id}
        aria-invalid={wiring.invalid || undefined}
        aria-describedby={wiring.describedBy}
        className={cn(
          controlClass,
          "h-full cursor-pointer appearance-none pr-6 font-medium",
          s.text,
          className
        )}
      >
        {children}
      </select>
      {/* Sits over the reserved pr-6 so long option labels never collide. */}
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 h-4 w-4 text-[var(--muted-2)]"
      />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SearchInput — pill search box with a clear button                   */
/* ------------------------------------------------------------------ */

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Accessible name; also used as the placeholder when none is given. */
  label: string;
  value: string;
  onClear?: () => void;
  size?: Exclude<FieldSize, "lg">;
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { label, value, onClear, size = "md", className, wrapperClassName, ...rest },
    ref
  ) {
    const s = SIZE[size];
    return (
      <div
        className={cn(
          shellClass("solid", false, rest.disabled),
          s.box,
          "rounded-full",
          wrapperClassName
        )}
      >
        <Search
          aria-hidden
          className={cn("shrink-0 text-[var(--muted-2)]", s.icon)}
        />
        <input
          ref={ref}
          type="search"
          aria-label={label}
          placeholder={rest.placeholder ?? label}
          value={value}
          {...rest}
          className={cn(controlClass, "h-full", s.text, className)}
        />
        {onClear && value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted-2)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
}

/** Checkbox with its label as a single click target and a real focus ring. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, description, className, disabled, ...rest }, ref) {
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-[16px] border border-[var(--field-border)] bg-[var(--field-bg)] px-4 py-3 transition-colors",
          !disabled && "hover:border-[var(--field-border-hover)]",
          "focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_4px_var(--field-ring)]",
          disabled && "cursor-not-allowed opacity-55",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          {...rest}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--color-primary)] outline-none"
        />
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold text-[var(--foreground)]">
            {label}
          </span>
          {description && (
            <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted-2)]">
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }
);
