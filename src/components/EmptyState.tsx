import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, body, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-hairline px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-soft text-violet">
        {icon}
      </div>
      <h3 className="t-title">{title}</h3>
      <p className="t-caption max-w-sm text-sm">{body}</p>
      {children}
    </div>
  );
}