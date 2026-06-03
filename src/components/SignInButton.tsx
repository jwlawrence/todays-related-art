"use client";

import { signIn } from "next-auth/react";

type Variant = "primary" | "secondary" | "compact";

const GoogleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function SignInButton({
  variant = "secondary",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const handleClick = () => signIn("google");

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 bg-ink text-cream px-8 py-3.5 rounded-2xl font-display font-bold text-base hover:bg-ink/90 transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
      >
        <span className="bg-white rounded-full p-1 flex items-center justify-center">
          <GoogleIcon size={18} />
        </span>
        Continue with Google
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full ${className}`}
      >
        <GoogleIcon size={14} />
        Sign in
      </button>
    );
  }

  // secondary (default) — matches existing AccountSection styling
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 bg-white border border-cream-dark hover:bg-cream-dark py-3 rounded-xl font-display font-bold text-sm text-ink transition-all active:scale-[0.98] ${className}`}
    >
      <GoogleIcon size={18} />
      Continue with Google
    </button>
  );
}
