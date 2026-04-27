import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "ui-button-primary border border-transparent text-white shadow-[0_12px_30px_rgba(31,111,235,0.18)]",
  secondary: "border border-border bg-white text-foreground hover:bg-soft",
  ghost: "border border-dashed border-border bg-transparent text-muted hover:bg-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

type SharedProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = SharedProps & {
  href: string;
  target?: string;
};

type NativeButtonProps = SharedProps & {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  onClick,
}: NativeButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses(variant, size, className)}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  href,
  target,
  variant = "primary",
  size = "md",
}: LinkButtonProps) {
  return (
    <Link href={href} target={target} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
