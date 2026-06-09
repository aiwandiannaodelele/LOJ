"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ResetPasswordPageWrapper() {
  return <Suspense><ResetPasswordPage /></Suspense>;
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMsg(data.sent === false ? "邮件发送失败，SMTP 未配置" : "如果邮箱存在，重置链接已发送");
    setLoading(false);
  };

  const handleReset = async () => {
    if (password.length < 6) { setMsg("密码至少 6 位"); return; }
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setMsg(data.ok ? "密码重置成功！" : data.error || "失败");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-3.5rem)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-6 w-6" /></div>
          <h1 className="text-2xl font-bold">{token ? "设置新密码" : "忘记密码"}</h1>
        </div>

        {token ? (
          <div className="space-y-4">
            <div><Label>新密码</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="最少 6 个字符" /></div>
            <Button className="w-full" onClick={handleReset} disabled={loading}>{loading ? "设置中..." : "重置密码"}</Button>
            {msg && <p className={`text-sm text-center ${msg.includes("成功") ? "text-emerald-500" : "text-muted-foreground"}`}>{msg}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div><Label>邮箱</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
            <Button className="w-full" onClick={handleSend} disabled={loading || !email}>{loading ? "发送中..." : "发送重置邮件"}</Button>
            {msg && <p className="text-sm text-center text-muted-foreground">{msg}</p>}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">返回登录</Link>
        </p>
      </div>
    </div>
  );
}
