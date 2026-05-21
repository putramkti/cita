"use client";

import type { DailyPoint } from "@/lib/admin/stats";

interface DailyBarsProps {
  data: DailyPoint[];
}

const SERIES = [
  { key: "signups", label: "Signups", color: "var(--foreground)" },
  { key: "paidOrders", label: "Paid orders", color: "var(--gold)" },
  { key: "attempts", label: "Tryouts", color: "color-mix(in oklch, var(--foreground) 60%, transparent)" },
  { key: "tutorMsgs", label: "Tutor msgs", color: "color-mix(in oklch, var(--foreground) 30%, transparent)" },
] as const;

export function DailyBars({ data }: DailyBarsProps) {
  // Find max across all metrics for consistent scale per row.
  const max = Math.max(
    1,
    ...data.flatMap((d) =>
      SERIES.map((s) => d[s.key as keyof DailyPoint] as number),
    ),
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-4">
        {SERIES.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{s.label}</span>
              <span className="tabular-nums">
                Σ{" "}
                {data.reduce(
                  (acc, d) => acc + (d[s.key as keyof DailyPoint] as number),
                  0,
                )}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 h-12 items-end">
              {data.map((d) => {
                const v = d[s.key as keyof DailyPoint] as number;
                const h = Math.max(2, Math.round((v / max) * 100));
                return (
                  <div
                    key={d.date}
                    className="relative group"
                    title={`${d.date}: ${v}`}
                  >
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${h}%`,
                        backgroundColor: s.color,
                        minHeight: 2,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1.5 text-[10px] text-muted-foreground/70 tabular-nums">
              {data.map((d) => (
                <span key={d.date} className="text-center">
                  {d.date.slice(-2)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
