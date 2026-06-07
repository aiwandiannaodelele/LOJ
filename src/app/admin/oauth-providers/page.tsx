"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface OAuthProvider {
  id: string;
  name: string;
  icon: string; // SVG string, URL, or base64
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export default function OAuthProvidersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OAuthProvider>({ id: "", name: "", icon: "", clientId: "", clientSecret: "", enabled: true });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && !session.user.isAdmin) router.push("/");
    else if (status === "authenticated") {
      fetch("/api/admin/settings").then(r => r.json()).then(d => {
        try { setProviders(JSON.parse(d.oauthProviders || "[]")); } catch {}
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, session, router]);

  const handleSave = async () => {
    if (!form.id || !form.name) { setError("ID 和名称不能为空"); return; }
    setSaving(true); setError("");
    let updated = [...providers];
    const idx = updated.findIndex(p => p.id === editingId);
    if (idx >= 0) updated[idx] = form;
    else if (updated.find(p => p.id === form.id)) { setError("ID 已存在"); setSaving(false); return; }
    else updated.push(form);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oauthProviders: JSON.stringify(updated) }),
      });
      if (!res.ok) { setError("保存失败"); return; }
      setProviders(updated);
      setForm({ id: "", name: "", icon: "", clientId: "", clientSecret: "", enabled: true });
      setEditingId(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const updated = providers.filter(p => p.id !== id);
    setProviders(updated);
    await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oauthProviders: JSON.stringify(updated) }),
    });
  };

  const handleEdit = (p: OAuthProvider) => { setForm(p); setEditingId(p.id); };
  const handleCancel = () => { setForm({ id: "", name: "", icon: "", clientId: "", clientSecret: "", enabled: true }); setEditingId(null); };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
        <h1 className="text-xl font-bold tracking-tight">OAuth 提供者管理</h1>
      </div>

      {/* Built-in status */}
      <Card>
        <CardHeader><CardTitle className="text-base">内置提供者（通过环境变量配置）</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="font-medium">GitHub</span>
            <span className={`text-xs px-2 py-0.5 rounded ${process.env.NEXT_PUBLIC_GITHUB_ID ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
              环境变量 {process.env.NEXT_PUBLIC_GITHUB_ID ? "已配置" : "未配置"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-medium">Google</span>
            <span className={`text-xs px-2 py-0.5 rounded ${process.env.NEXT_PUBLIC_GOOGLE_ID ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
              环境变量 {process.env.NEXT_PUBLIC_GOOGLE_ID ? "已配置" : "未配置"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Custom providers */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">自定义提供者（{providers.length}）</CardTitle>
          {!editingId && <Button size="sm" onClick={() => { setForm({ id: "", name: "", icon: "", clientId: "", clientSecret: "", enabled: true }); setEditingId("__new__"); }}><Plus className="h-3.5 w-3.5 mr-1" />添加</Button>}
        </CardHeader>
        <CardContent className="space-y-3">
          {providers.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                {p.icon ? (p.icon.startsWith("<svg") ? <span className="h-5 w-5 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: p.icon }} /> : <img src={p.icon} className="h-5 w-5 rounded" />) : <Shield className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1"><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.id}</div></div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>{p.enabled ? "启用" : "禁用"}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Save className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          {providers.length === 0 && !editingId && (
            <p className="text-sm text-muted-foreground text-center py-4">暂无自定义提供者</p>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      {editingId && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{editingId === "__new__" ? "新建提供者" : `编辑 ${editingId}`}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleCancel}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>ID（唯一标识）</Label><Input value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="custom-oauth" disabled={editingId !== "__new__"} /></div>
              <div><Label>显示名称</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="自定义登录" /></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.enabled} onCheckedChange={v => setForm({...form, enabled: v})} /><Label>启用</Label></div>
            </div>
            <div><Label>登录图标（SVG / URL / base64）</Label><Textarea value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder='<svg>...</svg> 或 https://... 或 data:image/...' rows={2} className="font-mono text-xs" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client ID</Label><Input value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} placeholder="xxx" /></div>
              <div><Label>Client Secret</Label><Input value={form.clientSecret} onChange={e => setForm({...form, clientSecret: e.target.value})} placeholder="xxx" type="password" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>取消</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
