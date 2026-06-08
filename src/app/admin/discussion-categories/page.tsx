"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Category {
  id?: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  enabled: boolean;
}

export default function DiscussionCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [discussionEnabled, setDiscussionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Category>({ name: "", slug: "", description: "", icon: "MessageSquare", color: "#3b82f6", sortOrder: 0, enabled: true });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [settingsRes, catRes] = await Promise.all([
      fetch("/api/settings/public").then(r => r.json()),
      fetch("/api/admin/discussion-categories").then(r => r.json()),
    ]);
    setDiscussionEnabled(settingsRes.discussionEnabled ?? true);
    setCategories(catRes.categories || []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && !session.user.isAdmin) router.push("/");
    else if (status === "authenticated") fetchData();
  }, [status, session, router]);

  const toggleDiscussion = async (v: boolean) => {
    setDiscussionEnabled(v);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discussionEnabled: v }) });
  };

  const openNew = () => { setForm({ name: "", slug: "", description: "", icon: "MessageSquare", color: "#3b82f6", sortOrder: categories.length, enabled: true }); setEditing(null); setDialogOpen(true); };
  const openEdit = (c: Category) => { setForm(c); setEditing(c); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    const method = editing?.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/discussion-categories" + (editing?.id ? `/${editing.id}` : ""), {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { fetchData(); setDialogOpen(false); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/admin/discussion-categories/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><MessageSquare className="h-5 w-5" /></div>
        <h1 className="text-xl font-bold">讨论区管理</h1>
      </div>

      <Card>
        <CardContent className="pt-4 flex items-center justify-between">
          <div><div className="font-medium">启用讨论区</div><div className="text-xs text-muted-foreground">与系统设置同步</div></div>
          <Switch checked={discussionEnabled} onCheckedChange={toggleDiscussion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">讨论分区（{categories.length}）</CardTitle><Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />添加分区</Button></CardHeader>
        <CardContent className="space-y-2">
          {categories.map(c => (
            <div key={c.id || c.slug} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: c.color + "20", color: c.color }}><MessageSquare className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0"><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.slug}{c.description ? ` · ${c.description}` : ""}</div></div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>{c.enabled ? "启用" : "禁用"}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(c.id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "编辑分区" : "新建分区"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>名称</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, "-")})} placeholder="综合讨论" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="general" /></div>
            </div>
            <div><Label>描述</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>图标</Label><Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="MessageSquare" /></div>
              <div><Label>颜色</Label><Input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="#3b82f6" /></div>
              <div className="flex items-end gap-2"><Switch checked={form.enabled} onCheckedChange={v => setForm({...form, enabled: v})} /><Label>启用</Label></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
