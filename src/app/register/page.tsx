"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteIcon, setSiteIcon] = useState("");
  const [siteName, setSiteName] = useState("LOJ");
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated") { router.push("/"); return; }
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(d => {
        if (d.siteIcon) setSiteIcon(d.siteIcon);
        if (d.siteName) setSiteName(d.siteName);
        if (d.oauthProviders) setOauthProviders(d.oauthProviders);
      })
      .catch(() => {});
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-3.5rem)] px-4">
      <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3">
            {siteIcon ? (
              <img src={siteIcon} alt="" className="h-12 w-12 rounded-xl object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
                {siteName.charAt(0)}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">注册 {siteName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              创建账号开始刷题之旅
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">用户名</Label>
            <Input
              id="name"
              type="text"
              placeholder="你的昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少6个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                注册中
              </>
            ) : (
              "注册"
            )}
          </Button>
        </form>

        {oauthProviders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">或者使用</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex gap-2">
              {oauthProviders.map((p: any) => (
                <Button key={p.id} variant="outline" className="flex-1 gap-2" onClick={() => signIn(p.id, { callbackUrl: "/" })}>
                  {p.icon ? (p.icon.startsWith("<svg") ? <span className="h-4 w-4 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: p.icon }} /> : <img src={p.icon} alt="" className="h-4 w-4 rounded" />) : null}
                  {p.name || p.id}
                </Button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
