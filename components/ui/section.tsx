import { cn } from "@/lib/utils";

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headingClassName?: string;
};

export function Section({
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
  bodyClassName,
  headingClassName,
}: SectionProps) {
  return (
    <section className={cn("rounded-[1.5rem] border border-border bg-white p-5 md:p-6", className)}>
      <div className={cn("mb-5", headingClassName)}>
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h2 className={cn("text-lg font-semibold text-foreground", eyebrow ? "mt-2" : "")}>
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
