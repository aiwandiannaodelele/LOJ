import type { JudgeStatus } from "@/lib/judge/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  JudgeStatus,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary"; className: string }
> = {
  AC: {
    label: "Accepted",
    variant: "default",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25",
  },
  PAC: {
    label: "Partial Accepted",
    variant: "default",
    className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/25",
  },
  WA: {
    label: "Wrong Answer",
    variant: "destructive",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25 hover:bg-red-500/25",
  },
  CE: {
    label: "Compile Error",
    variant: "secondary",
    className: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25",
  },
  RE: {
    label: "Runtime Error",
    variant: "destructive",
    className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25 hover:bg-orange-500/25",
  },
  TLE: {
    label: "Time Limit",
    variant: "secondary",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/25",
  },
  MLE: {
    label: "Memory Limit",
    variant: "secondary",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25 hover:bg-purple-500/25",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as JudgeStatus] || {
    label: status,
    variant: "outline" as const,
    className: "",
  };

  return (
    <Badge variant={config.variant} className={`font-mono text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}
