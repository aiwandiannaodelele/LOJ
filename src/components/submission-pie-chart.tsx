"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  AC: "#10b981",
  PAC: "#06b6d4",
  WA: "#ef4444",
  CE: "#eab308",
  RE: "#f97316",
  TLE: "#3b82f6",
  MLE: "#a855f7",
};

const STATUS_LABELS: Record<string, string> = {
  AC: "Accepted",
  PAC: "Partial Accepted",
  WA: "Wrong Answer",
  CE: "Compile Error",
  RE: "Runtime Error",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
};

interface StatItem {
  status: string;
  count: number;
  percentage: number;
}

interface SubmissionPieChartProps {
  problemId: number;
}

export default function SubmissionPieChart({ problemId }: SubmissionPieChartProps) {
  const [data, setData] = useState<StatItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/problems/${problemId}/stats`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.stats || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        加载统计中...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        暂无提交记录
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
    percentage: item.percentage,
    color: STATUS_COLORS[item.status] || "#9ca3af",
  }));

  return (
    <div className="space-y-3">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(_, __, props: any) => {
                const p = props?.payload;
                if (!p) return "";
                return [`${p.value} 次 (${p.percentage}%)`, p.name];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              iconSize={8}
              formatter={(value: string, entry: any) => (
                <span className="text-xs text-muted-foreground">
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <span
            key={item.status}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border"
            style={{
              borderColor: STATUS_COLORS[item.status] || "#9ca3af",
              color: STATUS_COLORS[item.status] || "#9ca3af",
              backgroundColor: `${STATUS_COLORS[item.status] || "#9ca3af"}15`,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[item.status] || "#9ca3af" }}
            />
            {STATUS_LABELS[item.status] || item.status}
            <span className="opacity-70">{item.percentage}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
