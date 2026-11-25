"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import {
  BlockButton,
  BlockField,
  IconButton,
  InitialsAvatar,
  blockRoot,
  focusRing,
  useAnnouncer,
  useAppBlockTheme,
  useBlockReducedMotion,
  useBlockToast,
  type AppBlockTheme,
} from "@/components/ui/app-sign-in-utils/app-block-kit";
import { cn } from "@/lib/utils";

export type AppSignInMode = "sign-in" | "sign-up";
export type AppSignInProvider = "google" | "github" | "apple";

export interface AppSignInPayload {
  mode: AppSignInMode;
  email: string;
  password: string;
  /** Only sent when creating an account. */
  name?: string;
  remember: boolean;
}

export interface AppSignInBrand {
  name: string;
  /** One line under the heading. */
  tagline: string;
  supportHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

export interface AppSignInTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface AppSignInProps {
  theme?: AppBlockTheme;
  /** Controlled mode. */
  mode?: AppSignInMode;
  defaultMode?: AppSignInMode;
  onModeChange?: (mode: AppSignInMode) => void;
  brand?: AppSignInBrand;
  testimonial?: AppSignInTestimonial;
  providers?: AppSignInProvider[];
  /** Throw an Error to show its message as the form error. Without it the block runs a demo backend. */
  onSubmit?: (payload: AppSignInPayload) => Promise<void> | void;
  onSso?: (provider: AppSignInProvider) => Promise<void> | void;
  /** Sends the link. Throw to show an error. */
  onMagicLink?: (email: string) => Promise<void> | void;
  /** Checks the 6-digit code from the email. Throw to reject it. */
  onVerifyCode?: (email: string, code: string) => Promise<void> | void;
  /** Called from the success screen's primary button. */
  onContinue?: () => void;
  /** Shows the brand panel at wide container widths. Default true. */
  showPanel?: boolean;
  /** Seconds before a new link can be requested. Default 30. */
  resendSeconds?: number;
  className?: string;
  /** Allow new user registration tabs. Defaults to false. */
  allowSignUp?: boolean;
  /** Show passwordless email link option. Defaults to false. */
  showMagicLink?: boolean;
  /** Quick-fill demo credentials for multi-tenant roles */
  quickRoles?: Array<{
    label: string;
    role: string;
    shortName?: string;
    badge?: string;
    sublabel?: string;
    email: string;
    pass: string;
    icon?: string;
  }>;
  initialEmail?: string;
  initialPassword?: string;
}

export const APP_SIGN_IN_BRAND: AppSignInBrand = {
  name: "Smart Edu By BluNet IT Services",
  tagline:
    "Enterprise Multi-Tenant School Operations, Academics & Examination ERP",
  supportHref: "#support",
  termsHref: "#terms",
  privacyHref: "#privacy",
};

export const APP_SIGN_IN_TESTIMONIAL: AppSignInTestimonial = {
  quote:
    "Smart Edu ERP has completely automated our multi-branch school operations. From biometric attendance and timetable scheduling to instant fee receipts and marks moderation, everything runs on autopilot with zero paperwork.",
  author: "Dr. Evelyn Vance",
  role: "Director of Academics & School Operations, Greenwood Global Institutions",
};

export const APP_SIGN_IN_PROVIDERS: AppSignInProvider[] = [
  "google",
  "github",
  "apple",
];

type View = "form" | "magic" | "success";
type FieldName = "name" | "email" | "password";
type Errors = Partial<Record<FieldName, string>>;

const PROVIDER_LABEL: Record<AppSignInProvider, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_RULES: {
  id: string;
  label: string;
  test: (value: string) => boolean;
}[] = [
  {
    id: "length",
    label: "At least 10 characters",
    test: (v) => v.length >= 10,
  },
  {
    id: "case",
    label: "Upper and lower case",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: "Too weak", color: "var(--blk-error)" },
  { label: "Weak", color: "var(--blk-error)" },
  { label: "Fair", color: "var(--blk-warning)" },
  { label: "Good", color: "var(--bjork-accent)" },
  { label: "Strong", color: "var(--blk-success)" },
] as const;

function validate(
  mode: AppSignInMode,
  values: { name: string; email: string; password: string },
): Errors {
  const errors: Errors = {};
  if (mode === "sign-up" && values.name.trim().length < 2)
    errors.name = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your work email.";
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "That doesn't look like an email address.";
  if (!values.password)
    errors.password =
      mode === "sign-in" ? "Enter your password." : "Choose a password.";
  else if (
    mode === "sign-up" &&
    PASSWORD_RULES.some((rule) => !rule.test(values.password))
  )
    errors.password = "Your password needs every item on the list below.";
  return errors;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

// Demo backend: a few addresses and passwords trigger the error states.
async function demoSubmit(payload: AppSignInPayload) {
  await wait(900);
  const email = payload.email.toLowerCase();
  if (email.endsWith("@blocked.test"))
    throw new Error(
      "This account is locked after too many attempts. Use a sign-in link, or try again in 15 minutes.",
    );
  if (payload.mode === "sign-up" && email.endsWith("@taken.test"))
    throw new Error("An account with this email already exists.");
  if (payload.mode === "sign-in" && payload.password === "wrong")
    throw new Error(
      "That email and password don't match. Check for typos, or reset your password.",
    );
}

function firstName(name: string, email: string) {
  const fromName = name.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const local = email.split("@")[0] ?? "";
  return local
    ? local.charAt(0).toUpperCase() + local.slice(1).split(/[._-]/)[0]
    : "there";
}

/**
 * A complete sign-in and sign-up page: SSO, email and password with live validation, a passwordless link with
 * a 6-digit code fallback, and loading, error and success states. Lays out as a split screen when the container
 * is wide and a single column when it is narrow.
 */
export function AppSignIn({
  theme = "auto",
  mode: modeProp,
  defaultMode = "sign-in",
  allowSignUp = false,
  showMagicLink = false,
  onModeChange,
  brand = APP_SIGN_IN_BRAND,
  testimonial = APP_SIGN_IN_TESTIMONIAL,
  providers = [],
  onSubmit,
  onSso,
  onMagicLink,
  onVerifyCode,
  onContinue,
  showPanel = true,
  resendSeconds = 30,
  quickRoles,
  initialEmail,
  initialPassword,
  className,
}: AppSignInProps) {
  const { style } = useAppBlockTheme(theme);
  const reduce = useBlockReducedMotion();
  const { announce, region } = useAnnouncer();
  const toast = useBlockToast();
  const uid = useId();

  const [innerMode, setInnerMode] = useState<AppSignInMode>(defaultMode);
  const mode = modeProp ?? innerMode;
  const [view, setView] = useState<View>("form");
  const [values, setValues] = useState({
    name: "",
    email: initialEmail || "",
    password: initialPassword || "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<
    null | "submit" | "magic" | AppSignInProvider
  >(null);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [successName, setSuccessName] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const moveFocusToHeading = useRef(false);

  // After a view change, the new heading takes focus so screen readers land on the new context.
  useLayoutEffect(() => {
    if (!moveFocusToHeading.current) return;
    moveFocusToHeading.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [view]);

  const goTo = useCallback((next: View) => {
    moveFocusToHeading.current = true;
    setView(next);
  }, []);

  const setMode = (next: AppSignInMode) => {
    if (next === mode) return;
    if (modeProp === undefined) setInnerMode(next);
    onModeChange?.(next);
    setFormError(null);
    setSubmitted(false);
    setTouched({});
    announce(next === "sign-in" ? "Sign in form" : "Create account form");
  };

  const errors = validate(mode, values);
  const visibleError = (field: FieldName) =>
    submitted || touched[field] ? (errors[field] ?? null) : null;

  const update =
    (field: FieldName) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      if (formError) setFormError(null);
    };
  const blur = (field: FieldName) => () => {
    if (values[field]) setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const busy = pending !== null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const order: FieldName[] =
      mode === "sign-up"
        ? ["name", "email", "password"]
        : ["email", "password"];
    const firstInvalid = order.find((field) => errors[field]);
    if (firstInvalid) {
      ({ name: nameRef, email: emailRef, password: passwordRef })[
        firstInvalid
      ].current?.focus();
      const count = order.filter((field) => errors[field]).length;
      announce(
        `${count} ${count === 1 ? "field needs" : "fields need"} attention. ${errors[firstInvalid]}`,
      );
      return;
    }
    setFormError(null);
    setPending("submit");
    const payload: AppSignInPayload = {
      mode,
      email: values.email.trim(),
      password: values.password,
      remember,
      ...(mode === "sign-up" ? { name: values.name.trim() } : {}),
    };
    try {
      await (onSubmit ? onSubmit(payload) : demoSubmit(payload));
      setSuccessName(firstName(values.name, values.email));
      goTo("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.";
      setFormError(message);
      announce(message);
      window.requestAnimationFrame(() =>
        bannerRef.current?.focus({ preventScroll: false }),
      );
    } finally {
      setPending(null);
    }
  };

  const handleSso = async (provider: AppSignInProvider) => {
    if (busy) return;
    setPending(provider);
    setFormError(null);
    try {
      await (onSso ? onSso(provider) : wait(1100));
      setSuccessName(values.name.trim().split(/\s+/)[0] || "Ada");
      goTo("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${PROVIDER_LABEL[provider]} sign-in was cancelled.`;
      setFormError(message);
      announce(message);
    } finally {
      setPending(null);
    }
  };

  const handleMagic = async () => {
    if (busy) return;
    setTouched((prev) => ({ ...prev, email: true }));
    if (errors.email) {
      emailRef.current?.focus();
      announce(errors.email);
      return;
    }
    setPending("magic");
    setFormError(null);
    try {
      await (onMagicLink ? onMagicLink(values.email.trim()) : wait(800));
      goTo("magic");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't send the link. Try again.";
      setFormError(message);
      announce(message);
    } finally {
      setPending(null);
    }
  };

  const handleForgot = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (errors.email) {
      emailRef.current?.focus();
      announce(
        `To reset your password, ${errors.email.charAt(0).toLowerCase()}${errors.email.slice(1)}`,
      );
      return;
    }
    toast.show(`Reset link sent to ${values.email.trim()}`, "success");
  };

  const reset = () => {
    setValues({ name: "", email: "", password: "" });
    setTouched({});
    setSubmitted(false);
    setFormError(null);
    setShowPassword(false);
    goTo("form");
  };

  const checkCaps = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  };

  const passed = PASSWORD_RULES.filter((rule) =>
    rule.test(values.password),
  ).length;
  const strength = values.password ? STRENGTH[passed] : null;
  const isSignUp = mode === "sign-up";
  const headingId = `${uid}-heading`;
  const tabIds = {
    "sign-in": `${uid}-tab-in`,
    "sign-up": `${uid}-tab-up`,
  } as const;
  const panelId = `${uid}-panel`;

  const onTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: AppSignInMode =
      event.key === "Home"
        ? "sign-in"
        : event.key === "End"
          ? "sign-up"
          : mode === "sign-in"
            ? "sign-up"
            : "sign-in";
    setMode(next);
    document.getElementById(tabIds[next])?.focus();
  };

  const viewMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, y: 6, filter: "blur(3px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] as const },
      };

  return (
    <div className={cn(blockRoot, "@container h-full w-full", className)} style={style}>
      <div
        className={cn(
          "grid h-full min-h-0 w-full",
          showPanel && "lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] @4xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]",
        )}
      >
        {showPanel && (
          <BrandPanel brand={brand} testimonial={testimonial} reduce={reduce} />
        )}

        <main
          className="flex min-h-0 min-w-0 flex-col overflow-y-auto"
          aria-labelledby={headingId}
        >
          <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7 @md:px-8 @md:pt-7">
            {/* Visible on mobile viewports when left panel is hidden */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <BrandMark />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold tracking-tight text-[color:var(--bjork-text)] leading-tight">
                  {brand.name}
                </span>
                <span className="text-[10px] text-[color:var(--bjork-text-muted)]">
                  School ERP
                </span>
              </div>
            </div>
            <div className="hidden lg:block text-[12px] text-[color:var(--bjork-text-soft)] font-medium">
              Institutional Portal Login
            </div>
            {brand.supportHref && (
              <a
                href={brand.supportHref}
                className={cn(
                  "rounded-[6px] text-[12.5px] text-[color:var(--bjork-text-muted)] transition-colors hover:text-[color:var(--bjork-text)]",
                  focusRing,
                )}
              >
                Need help?
              </a>
            )}
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8 sm:py-8">
            <div className="w-full max-w-[400px]">
              {view === "form" && (
                <motion.div key={`form-${mode}`} {...viewMotion}>
                  {allowSignUp && (
                    <div
                      role="tablist"
                      aria-label="Account"
                      className="relative mb-6 grid grid-cols-2 rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-[3px] shadow-[var(--bjork-shadow-inset)]"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-[8px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface)]",
                          !reduce &&
                            "transition-transform duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
                          isSignUp ? "translate-x-full" : "translate-x-0",
                        )}
                      />
                      {(["sign-in", "sign-up"] as const).map((tab) => (
                        <button
                          key={tab}
                          id={tabIds[tab]}
                          type="button"
                          role="tab"
                          aria-selected={mode === tab}
                          aria-controls={panelId}
                          tabIndex={mode === tab ? 0 : -1}
                          onClick={() => setMode(tab)}
                          onKeyDown={onTabKey}
                          className={cn(
                            "relative z-10 h-8 cursor-pointer rounded-[8px] text-[13px] font-medium transition-colors duration-150",
                            focusRing,
                            mode === tab
                              ? "text-[color:var(--bjork-text)]"
                              : "text-[color:var(--bjork-text-muted)] hover:text-[color:var(--bjork-text-medium)]",
                          )}
                        >
                          {tab === "sign-in" ? "Sign in" : "Create account"}
                        </button>
                      ))}
                    </div>
                  )}

                  <h1
                    id={headingId}
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-bjork-display text-[26px] sm:text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] outline-none"
                  >
                    {isSignUp ? `Start with ${brand.name}` : "Welcome back"}
                  </h1>
                  <p className="mt-1.5 text-[13px] leading-[1.5] text-[color:var(--bjork-text-muted)]">
                    {isSignUp
                      ? "Free for up to 5 responders. No card required."
                      : "Enter your institutional credentials to access your portal"}
                  </p>

                  {providers && providers.length > 0 && (
                    <>
                      <div className="mt-6 grid grid-cols-3 gap-2">
                        {providers.map((provider) => (
                          <BlockButton
                            key={provider}
                            variant="secondary"
                            size="lg"
                            onClick={() => handleSso(provider)}
                            disabled={busy && pending !== provider}
                            aria-busy={pending === provider || undefined}
                            aria-label={`${isSignUp ? "Sign up" : "Sign in"} with ${PROVIDER_LABEL[provider]}`}
                            className="h-10 min-w-0 px-2"
                          >
                            {pending === provider ? (
                              <Spinner />
                            ) : (
                              <ProviderMark provider={provider} />
                            )}
                            <span className="hidden truncate sm:inline @sm:inline text-xs">
                              {PROVIDER_LABEL[provider]}
                            </span>
                          </BlockButton>
                        ))}
                      </div>

                      <div
                        className="my-5 flex items-center gap-3"
                        role="presentation"
                      >
                        <span className="h-px flex-1 bg-[var(--bjork-border)]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--bjork-text-soft)]">
                          or with email
                        </span>
                        <span className="h-px flex-1 bg-[var(--bjork-border)]" />
                      </div>
                    </>
                  )}

                  <form
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabIds[mode]}
                    noValidate
                    onSubmit={handleSubmit}
                    aria-busy={pending === "submit" || undefined}
                    className="flex flex-col gap-4"
                  >
                    {formError && (
                      <div
                        ref={bannerRef}
                        tabIndex={-1}
                        role="alert"
                        className="flex gap-3 rounded-[12px] border border-[color:color-mix(in_oklab,var(--blk-error)_28%,transparent)] bg-[var(--blk-error-soft)] px-3.5 py-3 text-[12.5px] leading-[1.5] text-[color:var(--bjork-text-strong)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--blk-error)]"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          className="mt-[2px] size-3.5 shrink-0 text-[color:var(--blk-error)]"
                        >
                          <path
                            d="M8 1.75 15 14H1L8 1.75Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 6.25v3.5M8 11.6v.1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="min-w-0">
                          <p>{formError}</p>
                          {formError.startsWith(
                            "An account with this email",
                          ) && (
                            <button
                              type="button"
                              onClick={() => setMode("sign-in")}
                              className={cn(
                                "mt-1 cursor-pointer rounded-[4px] font-medium text-[color:var(--blk-accent-ink)] underline-offset-2 hover:underline",
                                focusRing,
                              )}
                            >
                              Sign in instead
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {isSignUp && (
                      <BlockField
                        ref={nameRef}
                        label="Full name"
                        name="name"
                        autoComplete="name"
                        placeholder="Ada Lindqvist"
                        value={values.name}
                        onChange={update("name")}
                        onBlur={blur("name")}
                        readOnly={busy}
                        error={visibleError("name")}
                      />
                    )}

                    <BlockField
                      ref={emailRef}
                      label="Work email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="ada@halden.co"
                      value={values.email}
                      onChange={update("email")}
                      onBlur={blur("email")}
                      readOnly={busy}
                      error={visibleError("email")}
                    />

                    <div className="flex flex-col gap-2">
                      <BlockField
                        ref={passwordRef}
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isSignUp ? "new-password" : "current-password"
                        }
                        placeholder={
                          isSignUp ? "10+ characters" : "Your password"
                        }
                        value={values.password}
                        onChange={update("password")}
                        onBlur={() => {
                          blur("password")();
                          setPasswordFocused(false);
                          setCapsLock(false);
                        }}
                        onFocus={() => setPasswordFocused(true)}
                        onKeyDown={checkCaps}
                        onKeyUp={checkCaps}
                        readOnly={busy}
                        error={visibleError("password")}
                        hint={
                          capsLock && passwordFocused ? (
                            <span className="flex items-center gap-1.5 text-[color:var(--blk-warning)]">
                              <svg
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              >
                                <path
                                  d="M8 2.5 13.5 8H10.5v3h-5V8H2.5L8 2.5ZM5.5 13.5h5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Caps Lock is on
                            </span>
                          ) : undefined
                        }
                        labelAside={
                          !isSignUp ? (
                            <button
                              type="button"
                              onClick={handleForgot}
                              className={cn(
                                "cursor-pointer rounded-[4px] text-[12px] text-[color:var(--bjork-text-muted)] transition-colors hover:text-[color:var(--blk-accent-ink)]",
                                focusRing,
                              )}
                            >
                              Forgot password?
                            </button>
                          ) : undefined
                        }
                        trailing={
                          <IconButton
                            size="sm"
                            label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            pressed={showPassword}
                            onClick={() => setShowPassword((v) => !v)}
                            className="aria-pressed:text-[color:var(--bjork-text)]"
                          >
                            <EyeIcon open={showPassword} />
                          </IconButton>
                        }
                      />

                      {isSignUp && (values.password || passwordFocused) && (
                        <PasswordMeter
                          value={values.password}
                          passed={passed}
                          strength={strength}
                          reduce={reduce}
                        />
                      )}
                    </div>

                    {!isSignUp && (
                      <RememberMe checked={remember} onChange={setRemember} />
                    )}

                    <BlockButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="mt-2 w-full h-10 text-[13.5px] font-medium"
                      disabled={busy && pending !== "submit"}
                      aria-disabled={pending === "submit" || undefined}
                    >
                      {pending === "submit" ? (
                        <>
                          <Spinner />
                          {isSignUp ? "Creating account" : "Signing in..."}
                        </>
                      ) : isSignUp ? (
                        "Create account"
                      ) : (
                        "Sign in to Portal"
                      )}
                    </BlockButton>

                    {showMagicLink && !isSignUp && (
                      <BlockButton
                        variant="ghost"
                        size="md"
                        onClick={handleMagic}
                        disabled={busy && pending !== "magic"}
                        className="w-full text-[color:var(--bjork-text-medium)]"
                      >
                        {pending === "magic" ? <Spinner /> : <MailIcon />}
                        Email me a sign-in link instead
                      </BlockButton>
                    )}

                    {allowSignUp && isSignUp && (
                      <p className="text-center text-[11.5px] leading-[1.55] text-[color:var(--bjork-text-soft)]">
                        By creating an account you agree to the{" "}
                        <a
                          href={brand.termsHref ?? "#"}
                          className={cn(
                            "rounded-[3px] text-[color:var(--bjork-text-medium)] underline decoration-[color:var(--bjork-border-strong)] underline-offset-2 hover:text-[color:var(--bjork-text)]",
                            focusRing,
                          )}
                        >
                          Terms
                        </a>{" "}
                        and{" "}
                        <a
                          href={brand.privacyHref ?? "#"}
                          className={cn(
                            "rounded-[3px] text-[color:var(--bjork-text-medium)] underline decoration-[color:var(--bjork-border-strong)] underline-offset-2 hover:text-[color:var(--bjork-text)]",
                            focusRing,
                          )}
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                    )}

                    {!isSignUp && quickRoles && quickRoles.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-[color:var(--bjork-border)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--bjork-text-soft)]">
                            Quick Role Auto-Fill
                          </span>
                          <span className="text-[10px] text-[color:var(--bjork-text-soft)] font-medium">
                            Select role to fill
                          </span>
                        </div>

                        {/* 5 Compact Role Boxes */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                          {quickRoles.map((qr, idx) => {
                            const isSelected = values.email === qr.email;
                            return (
                              <button
                                key={qr.role}
                                type="button"
                                title={`${qr.label}: ${qr.email}`}
                                onClick={() => {
                                  setValues({
                                    ...values,
                                    email: qr.email,
                                    password: qr.pass,
                                  });
                                  setTouched({});
                                  setFormError(null);
                                }}
                                className={cn(
                                  "group relative flex flex-col items-center justify-center p-2 rounded-[11px] border text-center transition-all duration-150 cursor-pointer select-none",
                                  isSelected
                                    ? "border-[color:var(--bjork-accent)] bg-[var(--bjork-accent-soft)] shadow-sm ring-2 ring-[var(--bjork-accent)]/25 scale-[1.02]"
                                    : "border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] hover:bg-[var(--bjork-surface-hover)] hover:border-[color:var(--bjork-border-strong)] active:scale-[0.98]",
                                )}
                              >
                                {isSelected && (
                                  <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-[var(--bjork-accent)] text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-[var(--bjork-bg)]">
                                    ✓
                                  </span>
                                )}
                                <div
                                  className={cn(
                                    "size-7 rounded-[7px] flex items-center justify-center mb-1 transition-colors shrink-0",
                                    isSelected
                                      ? "bg-[var(--bjork-surface)] shadow-xs"
                                      : "bg-[var(--bjork-field)] group-hover:bg-[var(--bjork-surface)]",
                                  )}
                                >
                                  <RoleIcon name={qr.icon || qr.role} />
                                </div>
                                <span className="text-[10px] sm:text-[10.5px] font-semibold text-[color:var(--bjork-text)] leading-tight text-center break-words max-w-full min-h-[26px] flex items-center justify-center">
                                  {qr.shortName || qr.label.replace(/^\d+\.\s*/, "")}
                                </span>
                                <span className="text-[9px] text-[color:var(--bjork-text-soft)] mt-0.5 font-medium text-center truncate max-w-full">
                                  {qr.badge || `Role ${idx + 1}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Role Info Banner */}
                        {(() => {
                          const activeRole = quickRoles.find(
                            (r) => r.email === values.email,
                          );
                          if (!activeRole) return null;
                          return (
                            <div className="mt-2.5 px-3 py-1.5 rounded-[8px] bg-[var(--bjork-surface-muted)] border border-[color:var(--bjork-border)] flex items-center justify-between text-[11px] animate-in fade-in duration-150">
                              <span className="font-medium text-[color:var(--bjork-text)] truncate flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-[var(--bjork-accent)] shrink-0" />
                                {activeRole.label} loaded
                              </span>
                              <span className="text-[10.5px] font-mono text-[color:var(--bjork-text-soft)] truncate ml-2">
                                {activeRole.email}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {view === "magic" && (
                <motion.div key="magic" {...viewMotion}>
                  <MagicLinkView
                    headingId={headingId}
                    headingRef={headingRef}
                    email={values.email.trim()}
                    resendSeconds={resendSeconds}
                    onBack={() => goTo("form")}
                    onResend={async () => {
                      await (onMagicLink
                        ? onMagicLink(values.email.trim())
                        : wait(500));
                      toast.show(
                        `New link sent to ${values.email.trim()}`,
                        "success",
                      );
                    }}
                    onVerify={async (code) => {
                      if (onVerifyCode)
                        await onVerifyCode(values.email.trim(), code);
                      else {
                        await wait(700);
                        if (code === "000000")
                          throw new Error(
                            "That code has expired. Request a new link.",
                          );
                      }
                      setSuccessName(firstName(values.name, values.email));
                      goTo("success");
                    }}
                    announce={announce}
                  />
                </motion.div>
              )}

              {view === "success" && (
                <motion.div key="success" {...viewMotion}>
                  <SuccessView
                    headingId={headingId}
                    headingRef={headingRef}
                    name={successName}
                    email={values.email.trim()}
                    created={isSignUp}
                    brand={brand.name}
                    reduce={reduce}
                    onContinue={
                      onContinue ?? (() => toast.show("Opening your workspace"))
                    }
                    onSignOut={reset}
                  />
                </motion.div>
              )}
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pb-5 text-[11.5px] text-[color:var(--bjork-text-soft)] @md:px-8 @md:pb-7">
            <span className="tabular-nums">© 2026 {brand.name} Labs</span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3">
                <rect
                  x="3"
                  y="7"
                  width="10"
                  height="7"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              SOC 2 Type II · SSO with SAML on Business
            </span>
          </footer>
        </main>
      </div>
      {region}
      {toast.node}
    </div>
  );
}

function PasswordMeter({
  value,
  passed,
  strength,
  reduce,
}: {
  value: string;
  passed: number;
  strength: (typeof STRENGTH)[number] | null;
  reduce: boolean;
}) {
  return (
    <div className="rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-muted)] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-1 overflow-hidden rounded-full bg-[var(--bjork-border-strong)]"
            >
              <span
                className={cn(
                  "block h-full origin-left rounded-full",
                  !reduce &&
                    "transition-[transform,background-color] duration-200 ease-out",
                )}
                style={{
                  background: strength?.color ?? "transparent",
                  transform: `scaleX(${value && i < passed ? 1 : 0})`,
                }}
              />
            </span>
          ))}
        </div>
        <span
          className="w-[52px] text-right text-[11.5px] font-medium text-[color:var(--bjork-text-medium)]"
          aria-live="polite"
        >
          {strength ? strength.label : ""}
        </span>
      </div>
      <ul
        className="mt-2.5 grid grid-cols-1 gap-x-3 gap-y-1 @md:grid-cols-2"
        aria-label="Password requirements"
      >
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5 text-[11.5px] transition-colors duration-150",
                ok
                  ? "text-[color:var(--bjork-text-medium)]"
                  : "text-[color:var(--bjork-text-soft)]",
              )}
            >
              <svg
                viewBox="0 0 12 12"
                aria-hidden="true"
                className="size-3 shrink-0"
              >
                {ok ? (
                  <path
                    d="M2.5 6.2 5 8.5l4.5-5"
                    fill="none"
                    stroke="var(--blk-success)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <circle cx="6" cy="6" r="1.6" fill="currentColor" />
                )}
              </svg>
              {rule.label}
              <span className="sr-only">{ok ? ", met" : ", not met"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RememberMe({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="group flex w-fit cursor-pointer select-none items-center gap-2.5 text-[12.5px] text-[color:var(--bjork-text-medium)]">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[18px] place-items-center rounded-[6px] border transition-[background-color,border-color] duration-150",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--bjork-accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--bjork-ring-offset)]",
          checked
            ? "border-transparent bg-[var(--blk-accent-fill)] text-[color:var(--blk-accent-fill-ink)]"
            : "border-[color:var(--bjork-border-strong)] bg-[var(--bjork-field)] group-hover:border-[color:var(--bjork-text-faint)]",
        )}
      >
        <svg
          viewBox="0 0 12 12"
          className={cn(
            "size-3 transition-opacity duration-150",
            checked ? "opacity-100" : "opacity-0",
          )}
        >
          <path
            d="M2.5 6.2 5 8.5l4.5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Keep me signed in for 30 days
    </label>
  );
}

const CODE_LENGTH = 6;

function MagicLinkView({
  headingId,
  headingRef,
  email,
  resendSeconds,
  onBack,
  onResend,
  onVerify,
  announce,
}: {
  headingId: string;
  headingRef: React.RefObject<HTMLHeadingElement>;
  email: string;
  resendSeconds: number;
  onBack: () => void;
  onResend: () => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  announce: (message: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [remaining, setRemaining] = useState(resendSeconds);
  const [codeFocused, setCodeFocused] = useState(false);
  const codeId = useId();

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const verify = async (value: string) => {
    if (value.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      await onVerify(value);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "That code didn't work.";
      setError(message);
      announce(message);
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await onResend();
      setRemaining(resendSeconds);
      setError(null);
    } finally {
      setResending(false);
    }
  };

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "-ml-1 mb-8 inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] px-1 py-0.5 text-[12.5px] text-[color:var(--bjork-text-muted)] transition-colors hover:text-[color:var(--bjork-text)]",
          focusRing,
        )}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
          <path
            d="M10 3.5 5.5 8l4.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Use a different email
      </button>

      <EnvelopeArt />

      <h1
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-bjork-display text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] outline-none @md:text-[32px]"
      >
        Check your inbox
      </h1>
      <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--bjork-text-muted)]">
        We sent a sign-in link to{" "}
        <span className="font-medium text-[color:var(--bjork-text)] [overflow-wrap:anywhere]">
          {email}
        </span>
        . It expires in 15 minutes. Or enter the 6-digit code from the same
        email.
      </p>

      <form
        className="mt-7"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void verify(code);
        }}
      >
        <label
          htmlFor={codeId}
          className="text-[12.5px] font-medium text-[color:var(--bjork-text-medium)]"
        >
          Verification code
        </label>
        <div className="relative mt-1.5">
          <input
            id={codeId}
            value={code}
            onChange={(event) => {
              const next = event.target.value
                .replace(/\D/g, "")
                .slice(0, CODE_LENGTH);
              setCode(next);
              setError(null);
              if (next.length === CODE_LENGTH) void verify(next);
            }}
            onFocus={() => setCodeFocused(true)}
            onBlur={() => setCodeFocused(false)}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={CODE_LENGTH}
            readOnly={verifying}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${codeId}-error` : `${codeId}-hint`}
            className="absolute inset-0 z-10 w-full cursor-text bg-transparent font-mono text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
          />
          <div className="grid grid-cols-6 gap-2" aria-hidden="true">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const char = code[i];
              const active =
                codeFocused &&
                (i === code.length ||
                  (i === CODE_LENGTH - 1 && code.length === CODE_LENGTH));
              return (
                <span
                  key={i}
                  className={cn(
                    "relative grid h-12 place-items-center rounded-[11px] border bg-[var(--bjork-field)] font-mono text-[20px] font-medium tabular-nums shadow-[var(--bjork-shadow-soft)] transition-[border-color,box-shadow] duration-150",
                    error
                      ? "border-[color:var(--blk-error)]"
                      : active
                        ? "border-[color:var(--bjork-accent)] ring-[3px] ring-[color:var(--bjork-accent-soft)]"
                        : "border-[color:var(--bjork-border)]",
                    i === 2 && "mr-1.5",
                    i === 3 && "ml-1.5",
                  )}
                >
                  {char ?? ""}
                  {active && !char && (
                    <span className="absolute h-5 w-px animate-pulse bg-[var(--bjork-accent)] motion-reduce:animate-none" />
                  )}
                </span>
              );
            })}
          </div>
        </div>
        {error ? (
          <p
            id={`${codeId}-error`}
            role="alert"
            className="mt-2 text-[12px] text-[color:var(--blk-error)]"
          >
            {error}
          </p>
        ) : (
          <p
            id={`${codeId}-hint`}
            className="mt-2 text-[12px] text-[color:var(--bjork-text-soft)]"
          >
            Paste it in, we&apos;ll check it as soon as all six digits are
            there.
          </p>
        )}

        <BlockButton
          type="submit"
          variant="primary"
          size="lg"
          className="mt-5 w-full"
          disabled={code.length !== CODE_LENGTH && !verifying}
        >
          {verifying ? (
            <>
              <Spinner /> Verifying
            </>
          ) : (
            "Verify and sign in"
          )}
        </BlockButton>
      </form>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--bjork-border)] pt-4 text-[12.5px]">
        <span className="text-[color:var(--bjork-text-soft)]">
          Nothing yet? Check spam.
        </span>
        <button
          type="button"
          onClick={resend}
          disabled={remaining > 0 || resending}
          className={cn(
            "cursor-pointer rounded-[6px] font-medium tabular-nums text-[color:var(--blk-accent-ink)] transition-colors hover:underline disabled:cursor-default disabled:text-[color:var(--bjork-text-muted)] disabled:no-underline",
            focusRing,
          )}
        >
          {resending
            ? "Sending…"
            : remaining > 0
              ? `Resend in ${mm}:${ss}`
              : "Resend link"}
        </button>
      </div>
    </div>
  );
}

function SuccessView({
  headingId,
  headingRef,
  name,
  email,
  created,
  brand,
  reduce,
  onContinue,
  onSignOut,
}: {
  headingId: string;
  headingRef: React.RefObject<HTMLHeadingElement>;
  name: string;
  email: string;
  created: boolean;
  brand: string;
  reduce: boolean;
  onContinue: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col items-start">
      <span className="relative grid size-14 place-items-center rounded-[16px] border border-[color:color-mix(in_oklab,var(--blk-success)_30%,transparent)] bg-[var(--blk-success-soft)]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
          <motion.path
            d="M5.5 12.5 10 17l8.5-9.5"
            fill="none"
            stroke="var(--blk-success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.36,
              delay: 0.08,
              ease: [0.23, 1, 0.32, 1],
            }}
          />
        </svg>
      </span>
      <h1
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-bjork-display text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] outline-none @md:text-[32px]"
      >
        {created ? `You're in, ${name}` : `Welcome back, ${name}`}
      </h1>
      <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--bjork-text-muted)]">
        {created
          ? `Your ${brand} workspace is ready. We'll walk you through connecting your first service.`
          : "You're signed in. Pick up where you left off."}
      </p>
      <div className="mt-6 flex w-full items-center gap-3 rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] px-3 py-2.5 shadow-[var(--bjork-shadow-soft)]">
        <InitialsAvatar
          name={name === "there" ? "Kestrel User" : name}
          size={30}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="truncate text-[12px] text-[color:var(--bjork-text-muted)]">
            {email || "ada@halden.co"}
          </p>
        </div>
        <span className="rounded-full bg-[var(--blk-success-soft)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--blk-success)]">
          Verified
        </span>
      </div>
      <BlockButton
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        onClick={onContinue}
      >
        {created ? "Set up workspace" : "Continue to dashboard"}
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
          <path
            d="M3.5 8h9M8.5 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BlockButton>
      <BlockButton
        variant="ghost"
        size="md"
        className="mt-2 w-full"
        onClick={onSignOut}
      >
        Not you? Sign out
      </BlockButton>
    </div>
  );
}

function BrandPanel({
  brand,
  testimonial,
  reduce,
}: {
  brand: AppSignInBrand;
  testimonial: AppSignInTestimonial;
  reduce: boolean;
}) {
  return (
    <aside
      aria-label={`About ${brand.name}`}
      className="hidden min-h-0 p-3 lg:flex @4xl:flex"
    >
      <div className="relative flex w-full flex-col justify-between overflow-y-auto rounded-[22px] border border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] p-6 lg:p-8 xl:p-11 shadow-[var(--bjork-shadow-panel)]">
        {/* Dot grid, faded toward the edges, and a warm glow behind the product card. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(var(--bjork-border-strong) 1px, transparent 1.2px)",
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 60% 45%, #000 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 60% 45%, #000 20%, transparent 80%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-16 size-[420px] rounded-full opacity-80 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--bjork-accent-muted), transparent 65%)",
          }}
        />

        {/* Prominent Platform Branding on the Left Side */}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--blk-accent-fill)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.18)] shrink-0">
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-5 text-[color:var(--blk-accent-fill-ink)]"
              >
                <path
                  d="M2.5 11.5 8 3l2.2 3.6L13.5 5 10 12.5 7.6 9.4 2.5 11.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold tracking-tight text-[color:var(--bjork-text)] leading-tight">
                {brand.name}
              </span>
              <span className="text-[11.5px] font-medium text-[color:var(--bjork-text-muted)]">
                Enterprise Multi-Tenant School ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[color:var(--bjork-border)] bg-[var(--bjork-surface-muted)] py-1 pl-2 pr-3 text-[11px] text-[color:var(--bjork-text-medium)] backdrop-blur">
            <span className="relative grid size-2 place-items-center">
              {!reduce && (
                <span className="absolute size-2 animate-ping rounded-full bg-[var(--blk-success)] opacity-40" />
              )}
              <span className="size-1.5 rounded-full bg-[var(--blk-success)]" />
            </span>
            <span>All systems normal</span>
            <span className="text-[color:var(--bjork-text-faint)]">·</span>
            <span className="tabular-nums">99.98%</span>
          </div>
        </div>

        <ProductPreview reduce={reduce} />

        <figure className="relative max-w-[460px]">
          <svg
            viewBox="0 0 24 18"
            aria-hidden="true"
            className="mb-4 h-4 w-5 text-[color:var(--bjork-accent)]"
          >
            <path
              d="M0 18V10.5C0 4.6 3.1 1.1 9.2 0l1 2.6C6.6 3.6 5 5.7 4.9 8.6H9.6V18H0Zm14.4 0V10.5C14.4 4.6 17.5 1.1 23.6 0l1 2.6c-3.6 1-5.2 3.1-5.3 6h4.7V18h-9.6Z"
              fill="currentColor"
            />
          </svg>
          <blockquote className="font-bjork-display text-[20px] font-medium leading-[1.35] tracking-[-0.02em] text-[color:var(--bjork-text-strong)] @6xl:text-[22px]">
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <InitialsAvatar name={testimonial.author} size={34} />
            <span className="flex flex-col">
              <span className="text-[13px] font-medium">
                {testimonial.author}
              </span>
              <span className="text-[12px] text-[color:var(--bjork-text-muted)]">
                {testimonial.role}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </aside>
  );
}

// Attendance & Campus Automation rate over 14 days, %
const OPERATIONS_TREND = [
  86, 88, 87, 89, 91, 90, 92, 93, 95, 96, 97, 98.2, 99.1, 99.4,
];
const OPERATIONS_TREND_PREV = [
  82, 84, 83, 85, 86, 85, 87, 88, 89, 90, 91, 92, 93, 94,
];

function ProductPreview({ reduce }: { reduce: boolean }) {
  const w = 300;
  const h = 92;
  const min = 80;
  const max = 100;
  const x = (i: number) => (i / (OPERATIONS_TREND.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const line = OPERATIONS_TREND.map(
    (v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
  ).join("");
  const prev = OPERATIONS_TREND_PREV.map(
    (v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
  ).join("");
  const area = `${line}L${w},${h}L0,${h}Z`;
  const lastX = x(OPERATIONS_TREND.length - 1);
  const lastY = y(OPERATIONS_TREND[OPERATIONS_TREND.length - 1]);

  const timeline = [
    {
      time: "08:00 AM",
      label: "Automated RFID & Biometric Attendance Synced (1,450+ Present)",
      tone: "var(--blk-success)",
    },
    {
      time: "09:30 AM",
      label: "Daily Fee Invoices & Auto-Reconciliation Completed",
      tone: "var(--bjork-accent)",
    },
    {
      time: "11:15 AM",
      label: "Faculty Timetables & Substitution Schedules Dispatched",
      tone: "var(--blk-success)",
    },
    {
      time: "01:45 PM",
      label: "Internal Marks Moderation & Report Cards Generated",
      tone: "var(--blk-success)",
    },
  ];

  return (
    <div aria-hidden="true" className="relative my-6 lg:my-8 flex flex-col items-start">
      <div className="w-[min(100%,390px)] rounded-[16px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] p-4 shadow-[var(--bjork-shadow-menu)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--bjork-text-soft)]">
              Campus Operations · Attendance & Automation
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-[26px] font-semibold tabular-nums tracking-[-0.03em]">
                99.4%
              </span>
              <span className="text-[12px] text-[color:var(--bjork-text-muted)]">
                synced
              </span>
              <span className="ml-1 rounded-full bg-[var(--blk-success-soft)] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[color:var(--blk-success)]">
                +4.8% automated
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 pt-0.5 text-[11px] text-[color:var(--bjork-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded-full bg-[var(--bjork-accent)]" />
              14d trend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3 border-t border-dashed border-[color:var(--blk-chart-ghost)]" />
              last term
            </span>
          </div>
        </div>
        <svg
          viewBox={`-4 -6 ${w + 8} ${h + 12}`}
          className="mt-3 h-[96px] w-full overflow-visible"
        >
          <defs>
            <linearGradient id="app-sign-in-area" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--bjork-accent)"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="var(--bjork-accent)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1="0"
              x2={w}
              y1={h * t}
              y2={h * t}
              stroke="var(--bjork-border)"
              strokeWidth="1"
            />
          ))}
          <path
            d={prev}
            fill="none"
            stroke="var(--blk-chart-ghost)"
            strokeWidth="1.25"
            strokeDasharray="3 3"
          />
          <path d={area} fill="url(#app-sign-in-area)" />
          <motion.path
            d={line}
            fill="none"
            stroke="var(--bjork-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.1,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.15,
            }}
          />
          <circle
            cx={lastX}
            cy={lastY}
            r="4"
            fill="var(--bjork-surface)"
            stroke="var(--bjork-accent)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="-mt-5 ml-[12%] w-[min(88%,350px)] rounded-[14px] border border-[color:var(--bjork-border)] bg-[var(--bjork-menu)] p-3.5 shadow-[var(--bjork-shadow-menu)] backdrop-blur-xl">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[color:var(--bjork-text)]">
            AUT-2026 · Realtime Campus Automation
          </p>
          <span className="rounded-full bg-[var(--blk-success-soft)] px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--blk-success)]">
            Fully Automated
          </span>
        </div>
        <ol className="relative">
          {timeline.map((entry, i) => (
            <li
              key={entry.time}
              className="relative flex items-center gap-2.5 py-[5px] text-[11px]"
            >
              {i < timeline.length - 1 && (
                <span className="absolute left-[3.5px] top-[17px] h-[calc(100%-10px)] w-px bg-[var(--bjork-border-strong)]" />
              )}
              <span
                className="relative size-2 shrink-0 rounded-full"
                style={{ background: entry.tone }}
              />
              <span className="w-[52px] shrink-0 font-mono text-[10.5px] tabular-nums text-[color:var(--bjork-text-soft)]">
                {entry.time}
              </span>
              <span className="truncate text-[color:var(--bjork-text-medium)] font-medium">
                {entry.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function RoleIcon({ name }: { name?: string }) {
  const n = name || "";
  if (n.includes("shield") || n === "SUPER_ADMIN") {
    return (
      <svg className="size-3.5 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (n.includes("building") || n === "SCHOOL_ADMIN") {
    return (
      <svg className="size-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </svg>
    );
  }
  if (n.includes("graduation") || n === "HEAD_MASTER") {
    return (
      <svg className="size-3.5 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  if (n.includes("briefcase") || n === "OFFICE_ADMIN") {
    return (
      <svg className="size-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }
  return (
    <svg className="size-3.5 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="grid size-7 place-items-center rounded-[8px] bg-[var(--blk-accent-fill)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.2)]">
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-4 text-[color:var(--blk-accent-fill-ink)]"
      >
        <path
          d="M2.5 11.5 8 3l2.2 3.6L13.5 5 10 12.5 7.6 9.4 2.5 11.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function ProviderMark({ provider }: { provider: AppSignInProvider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4 shrink-0">
        <path
          d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.4 0 4.5-.8 5.9-2.2L12 13.6c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H1v2.3A9 9 0 0 0 9 18Z"
          fill="#34A853"
        />
        <path
          d="M4 10.8a5.4 5.4 0 0 1 0-3.5V5H1a9 9 0 0 0 0 8.1l3-2.3Z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.4A9 9 0 0 0 1 5l3 2.3c.7-2.1 2.7-3.7 5-3.7Z"
          fill="#EA4335"
        />
      </svg>
    );
  }
  if (provider === "github") {
    return (
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-4 shrink-0 text-[color:var(--bjork-text)]"
      >
        <path
          fill="currentColor"
          d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2Z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 text-[color:var(--bjork-text)]"
    >
      <path
        fill="currentColor"
        d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6C4.4 4.8 3.3 5.5 2.7 6.6c-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5 1.5-.8 2-1.7c.6-.9.9-1.8.9-1.9 0 0-1.8-.7-1.8-3.1ZM9.6 3.6c.5-.6.8-1.3.7-2.1-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2 .8.1 1.5-.4 2-1Z"
      />
    </svg>
  );
}

function EnvelopeArt() {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-14 place-items-center rounded-[16px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface)]"
    >
      <svg viewBox="0 0 28 28" className="size-7">
        <rect
          x="4"
          y="7"
          width="20"
          height="14"
          rx="3"
          fill="none"
          stroke="var(--bjork-text-medium)"
          strokeWidth="1.5"
        />
        <path
          d="m5 8.5 9 6.5 9-6.5"
          fill="none"
          stroke="var(--bjork-text-medium)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[var(--blk-accent-fill)] text-[11px] font-semibold text-[color:var(--blk-accent-fill-ink)] ring-2 ring-[color:var(--bjork-bg)]">
        1
      </span>
    </span>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
      <rect
        x="2"
        y="3.5"
        width="12"
        height="9"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="m2.8 4.6 5.2 3.8 5.2-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
      <path
        d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle
        cx="8"
        cy="8"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {!open && (
        <path
          d="M2.5 2.5 13.5 13.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function Spinner(): ReactNode {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 animate-spin motion-reduce:animate-[spin_1.6s_linear_infinite]"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.8"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AppSignIn;