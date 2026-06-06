"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AIModelDef {
  id: string;
  name: string;
  icon: string;
}

function parseModels(json: string): AIModelDef[] {
  try { return JSON.parse(json); } catch { return []; }
}

export default function AISettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [models, setModels] = useState<string>("[]");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && !session.user.isAdmin) router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setApiKey(data.aiApiKey || "");
        setBaseUrl(data.aiBaseUrl || "");
        setModels(data.aiModels || "[]");
        setAiEnabled(data.aiEnabled ?? true);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiApiKey: apiKey, aiBaseUrl: baseUrl, aiModels: models, aiEnabled }),
      });
      if (!res.ok) { setError((await res.json()).error || "保存失败"); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch { setError("网络错误"); } finally { setSaving(false); }
  };

  if (status === "loading" || status !== "authenticated") return <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 设置</h1>
            <p className="text-muted-foreground text-sm">配置 AI 聊天模型参数</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/settings")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />返回系统设置
        </Button>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {success && <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">保存成功</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card className="border-border/50 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <Label className="font-medium">AI 配置</Label>
              <span className="text-xs text-muted-foreground ml-2">
                env 中的 OPENAI_API_KEY / OPENAI_BASE_URL 会覆盖此处配置
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
              <span className="text-xs text-muted-foreground">{aiEnabled ? "已开启" : "已关闭"}</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm">API Key</Label>
              <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Base URL</Label>
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" className="mt-1" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">模型列表</Label>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => { const arr = parseModels(models); arr.push({ id: "", name: "", icon: "" }); setModels(JSON.stringify(arr)); }}>
                  <Plus className="h-3 w-3" />添加
                </Button>
              </div>
              {parseModels(models).map((m, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-3">
                      <Label className="text-[11px] text-muted-foreground">ID</Label>
                      <Input value={m.id} onChange={(e) => { const arr = parseModels(models); arr[idx].id = e.target.value; setModels(JSON.stringify(arr)); }} placeholder="gpt-4o" className="h-7 text-xs mt-0.5" />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-[11px] text-muted-foreground">名称</Label>
                      <Input value={m.name} onChange={(e) => { const arr = parseModels(models); arr[idx].name = e.target.value; setModels(JSON.stringify(arr)); }} placeholder="GPT-4o" className="h-7 text-xs mt-0.5" />
                    </div>
                    <div className="sm:col-span-6">
                      <Label className="text-[11px] text-muted-foreground">图标</Label>
                      <Input value={m.icon} onChange={(e) => { const arr = parseModels(models); arr[idx].icon = e.target.value; setModels(JSON.stringify(arr)); }} placeholder="SVG/URL/Base64" className="h-7 text-xs mt-0.5 font-mono" />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 mt-[22px] shrink-0" onClick={() => { const arr = parseModels(models); arr.splice(idx, 1); setModels(JSON.stringify(arr)); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {parseModels(models).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">暂无模型，点击添加</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />保存中</> : <><Save className="h-4 w-4" />保存设置</>}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
