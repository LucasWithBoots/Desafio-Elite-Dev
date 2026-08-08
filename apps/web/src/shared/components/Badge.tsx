import type { PropsWithChildren } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

interface BadgeProps {
  tone?: BadgeTone;
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<BadgeProps>) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
