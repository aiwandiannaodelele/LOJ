"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdsSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [autoAds, setAutoAds] = useState(false);
  const [publisherId, setPublisherId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && !session.user.isAdmin) router.push("/");
    else if (status === "authenticated") {
      fetch("/api/admin/settings").then(r => r.json()).then(d => {
        setEnabled(d.adsEnabled ?? false);
        setAutoAds(d.adsAutoAds ?? false);
        setPublisherId(d.adsPublisherId || "");
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, session, router]);

  const handleSave = async () => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adsEnabled: enabled, adsAutoAds: autoAds, adsPublisherId: publisherId }),
    });
    setMsg(res.ok ? "保存成功" : "保存失败");
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"><ArrowLeft className="h-4 w-4 text-muted-foreground" /></button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="h-5 w-5" /></div>
        <h1 className="text-xl font-bold">广告设置</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Google AdSense</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div><div className="font-medium">启用广告</div><div className="text-sm text-muted-foreground">在全站展示 Google 广告</div></div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <div className="space-y-3 border-l-2 border-primary/30 pl-4">
              <div className="space-y-1.5">
                <Label>发布商 ID</Label>
                <Input value={publisherId} onChange={e => setPublisherId(e.target.value)} placeholder="ca-pub-xxxxxxxxxxxxxxxx" />
              </div>
              <div className="flex items-center justify-between py-1">
                <div><div className="text-sm font-medium">自动广告</div><div className="text-xs text-muted-foreground">让 Google 自动选择广告位置</div></div>
                <Switch checked={autoAds} onCheckedChange={setAutoAds} />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                去 <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AdSense</a> 创建广告单元，将发布商 ID 填入上方。
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {msg && <div className={`rounded-lg px-3 py-2 text-sm ${msg.includes("成功") ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>{msg}</div>}

      <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "保存中..." : "保存"}</Button>
    </div>
  );
}
