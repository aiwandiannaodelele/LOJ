"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Save, Trash2, Loader2, FileText, Globe, Pencil } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import IconPicker from "@/components/icon-picker";
import dynamic from "next/dynamic";

const isCustomIcon = (icon: string) => icon.startsWith("<svg") || icon.startsWith("http") || icon.startsWith("data:");

const HtmlMonacoEditor = dynamic(() => import("@/components/html-monaco-editor"), { ssr: false, loading: () => <div className="h-48 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> });

interface CustomPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  icon: string;
  pageType: string;
  isPublic: boolean;
}

export default function CustomPagesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomPage | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", content: "", icon: "FileText", pageType: "html", isPublic: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && !session.user.isAdmin) router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/admin/custom-pages")
      .then((r) => r.json())
      .then((data) => { setPages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ slug: "", title: "", content: "", icon: "FileText", pageType: "html", isPublic: true });
    setError("");
  };

  const startEdit = (p: CustomPage) => {
    setEditing(p);
    setForm({ slug: p.slug, title: p.title, content: p.content, icon: p.icon, pageType: p.pageType, isPublic: p.isPublic });
    setError("");
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.title.trim()) { setError("ID 和名称不能为空"); return; }
    setSaving(true); setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/admin/custom-pages", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "保存失败"); return; }
      if (editing) {
        setPages((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
      } else {
        setPages((prev) => [data, ...prev]);
      }
      resetForm();
    } catch { setError("网络错误"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这个页面？")) return;
    try {
      const res = await fetch(`/api/admin/custom-pages?id=${id}`, { method: "DELETE" });
      if (res.ok) setPages((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  if (status === "loading" || status !== "authenticated") return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">自定义页面</h1><p className="text-muted-foreground text-sm">创建和管理自定义页面，将出现在顶栏</p></div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/settings")} className="gap-1.5"><ArrowLeft className="h-4 w-4" />返回设置</Button>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {/* Form */}
      <Card className="border-border/50 p-5 space-y-4">
        <div className="flex items-center gap-2"><Pencil className="h-4 w-4 text-muted-foreground" /><Label className="font-medium">{editing ? "编辑页面" : "新建页面"}</Label></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">页面 ID</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-page" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">页面名称</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="我的页面" className="h-9" />
          </div>
           <div className="space-y-1.5">
            <Label className="text-xs">顶栏图标</Label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm({ ...form, icon: isCustomIcon(form.icon) ? "FileText" : "<svg" })} className={cn("text-xs px-2 py-1 rounded-md border transition-colors", isCustomIcon(form.icon) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent")}>
                {isCustomIcon(form.icon) ? "自定义模式" : "图标模式"}
              </button>
            </div>
            {isCustomIcon(form.icon) ? (
              <textarea value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="SVG / URL / Base64..." rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y" />
            ) : (
              <IconPicker value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">类型</Label>
            <Select value={form.pageType} onValueChange={(v) => v && setForm({ ...form, pageType: v })}>
              <SelectTrigger className="h-9"><SelectValue>{(v) => v === "html" ? "HTML 代码" : "嵌入 URL"}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML 代码</SelectItem>
                <SelectItem value="url">嵌入 URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
              <span className="text-sm">公开</span>
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{form.pageType === "url" ? "嵌入 URL" : "HTML 代码"}</Label>
          {form.pageType === "url" ? (
            <Input value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="https://example.com" className="h-9" />
          ) : (
            <HtmlMonacoEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} height="350px" />
          )}
        </div>
        <div className="flex justify-end gap-2">
          {editing && <Button variant="ghost" onClick={resetForm}>取消编辑</Button>}
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />保存中</> : <><Save className="h-4 w-4" />{editing ? "更新" : "创建"}</>}
          </Button>
        </div>
      </Card>

      {/* List */}
      <Card className="border-border/50 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">还没有自定义页面，点击上方新建</div>
        ) : (
          <div className="divide-y divide-border">
            {pages.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {(() => { const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[p.icon]; return IconComponent ? <IconComponent className="h-4 w-4" /> : <FileText className="h-4 w-4" />; })()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">/{p.slug} · {p.pageType === "url" ? "URL" : "HTML"}{!p.isPublic ? " · 私有" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => startEdit(p)} title="编辑"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30" onClick={() => handleDelete(p.id)} title="删除"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
