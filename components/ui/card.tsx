import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div {...props} className={cn("ui-card rounded-[1.75rem]", className)}>
      {children}
    </div>
  );
}

type CardBlockProps = React.HTMLAttributes<HTMLDivElement>;

export function CardInset({ children, className, ...props }: CardBlockProps) {
  return (
    <div {...props} className={cn("rounded-[1.25rem] border border-border bg-white", className)}>
      {children}
    </div>
  );
}

export function CardSoft({ children, className, ...props }: CardBlockProps) {
  return (
    <div {...props} className={cn("rounded-[1.5rem] border border-border bg-surface", className)}>
      {children}
    </div>
  );
}
