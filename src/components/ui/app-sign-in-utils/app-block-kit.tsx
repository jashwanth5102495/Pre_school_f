import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AppBlockTheme =
  | "auto"
  | "light"
  | "dark"
  | Record<string, string | number>
  | undefined;

export const blockRoot = "font-sans text-[color:var(--bjork-text)] antialiased";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bjork-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bjork-ring-offset)]";

export function useAppBlockTheme(theme?: AppBlockTheme) {
  return {
    style:
      typeof theme === "object" && theme !== null
        ? (theme as React.CSSProperties)
        : undefined,
  };
}

export function useBlockReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduce;
}

export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const announce = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const region = (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, region };
}

export function useBlockToast() {
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info" | "warning";
  } | null>(null);

  const show = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      setToast({ message, type });
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    },
    [],
  );

  const node = toast ? (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] px-4 py-3 text-[13px] font-medium text-[color:var(--bjork-text-strong)] shadow-[var(--bjork-shadow-menu)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          toast.type === "success" && "bg-emerald-500 ring-2 ring-emerald-500/20",
          toast.type === "error" && "bg-rose-500 ring-2 ring-rose-500/20",
          toast.type === "warning" && "bg-amber-500 ring-2 ring-amber-500/20",
          (!toast.type || toast.type === "info") && "bg-[var(--bjork-accent)] ring-2 ring-[var(--bjork-accent)]/20",
        )}
      />
      <span>{toast.message}</span>
    </div>
  ) : null;

  return { show, node };
}

export interface BlockButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const BlockButton = forwardRef<HTMLButtonElement, BlockButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 text-[12px]",
      md: "h-9 px-3.5 text-[13px]",
      lg: "h-10 px-4 text-[13.5px]",
    }[size];

    const variantClasses = {
      primary:
        "bg-[var(--bjork-accent)] text-white hover:bg-[var(--bjork-accent-hover)] active:scale-[0.99] font-medium shadow-sm border border-transparent",
      secondary:
        "bg-[var(--bjork-surface)] border border-[color:var(--bjork-border)] text-[color:var(--bjork-text-strong)] hover:bg-[var(--bjork-surface-hover)] hover:border-[color:var(--bjork-border-strong)] active:bg-[var(--bjork-surface-active)] shadow-[var(--bjork-shadow-soft)]",
      ghost:
        "bg-transparent text-[color:var(--bjork-text-medium)] hover:text-[color:var(--bjork-text)] hover:bg-[var(--bjork-surface-hover)] active:bg-[var(--bjork-surface-active)]",
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[9px] font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          sizeClasses,
          variantClasses,
          focusRing,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
BlockButton.displayName = "BlockButton";

export interface BlockFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelAside?: React.ReactNode;
  error?: string | null;
  hint?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const BlockField = forwardRef<HTMLInputElement, BlockFieldProps>(
  (
    {
      label,
      labelAside,
      error,
      hint,
      trailing,
      className,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const fieldId = id || name;

    return (
      <div className="flex flex-col gap-1.5">
        {(label || labelAside) && (
          <div className="flex items-center justify-between text-[12.5px] font-medium text-[color:var(--bjork-text-strong)]">
            {label && (
              <label htmlFor={fieldId} className="cursor-pointer select-none">
                {label}
              </label>
            )}
            {labelAside && <div>{labelAside}</div>}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={fieldId}
            name={name}
            className={cn(
              "w-full h-10 px-3 rounded-[9px] bg-[var(--bjork-field)] border text-[13px] text-[color:var(--bjork-text)] placeholder:text-[color:var(--bjork-text-soft)] transition-all shadow-[var(--bjork-shadow-soft)] outline-none",
              error
                ? "border-[color:var(--blk-error)] focus-visible:ring-2 focus-visible:ring-[var(--blk-error)]"
                : "border-[color:var(--bjork-border)] hover:border-[color:var(--bjork-border-strong)]",
              trailing && "pr-10",
              focusRing,
              className,
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute right-2.5 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {error ? (
          <p
            id={fieldId ? `${fieldId}-error` : undefined}
            role="alert"
            className="text-[11.5px] font-medium text-[color:var(--blk-error)] animate-in fade-in duration-150"
          >
            {error}
          </p>
        ) : hint ? (
          <div
            id={fieldId ? `${fieldId}-hint` : undefined}
            className="text-[11.5px] text-[color:var(--bjork-text-soft)]"
          >
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);
BlockField.displayName = "BlockField";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
  pressed?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "sm",
      label,
      pressed,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "size-7 rounded-[7px]",
      md: "size-8 rounded-[8px]",
      lg: "size-9 rounded-[9px]",
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        className={cn(
          "inline-flex items-center justify-center text-[color:var(--bjork-text-soft)] hover:text-[color:var(--bjork-text)] hover:bg-[var(--bjork-surface-hover)] active:bg-[var(--bjork-surface-active)] transition-colors cursor-pointer select-none",
          sizeClasses,
          focusRing,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

export interface InitialsAvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

export function InitialsAvatar({
  name = "User",
  size = 32,
  className,
}: InitialsAvatarProps) {
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--bjork-accent-soft)] text-[color:var(--bjork-accent)] font-semibold text-[11px] border border-[color:var(--bjork-border)] select-none",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
