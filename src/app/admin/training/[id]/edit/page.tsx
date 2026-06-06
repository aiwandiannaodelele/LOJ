"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dumbbell, ArrowLeft, Plus, Trash2, Import, ChevronDown, ChevronUp, GripVertical, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const BlockNoteEditor = dynamic(() => import("@/components/blocknote-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] rounded-lg border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
      加载编辑器...
    </div>
  ),
});

interface TestCase {
  input: string;
  output: string;
}

interface ProblemItem {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  inputDesc: string;
  outputDesc: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: string;
  timeLimit: number;
  memoryLimit: number;
}

interface TrainingProblemForm {
  key: string;
  id?: number;
  title: string;
  description: string;
  inputDesc: string;
  outputDesc: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  selfTestSamples: TestCase[];
  timeLimit: number;
  memoryLimit: number;
  difficulty: string;
  sourceProblemId?: number;
  expanded: boolean;
}

export default function TrainingEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const trainingId = params.id as string;

  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("入门");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [trainingProblems, setTrainingProblems] = useState<TrainingProblemForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !session.user.isAdmin) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/training?bank=1").then((r) => r.json()),
      fetch(`/api/admin/training/${trainingId}`).then((r) => r.json()),
    ]).then(([bankData, trainingData]) => {
      setProblems(bankData.problems || []);
      if (trainingData.id) {
        setTitle(trainingData.title || "");
        setDescription(trainingData.description || "");
        setDifficulty(trainingData.difficulty || "入门");
        setIsPublic(trainingData.isPublic ?? true);
        setTags((trainingData.tags || []).join(", "));
        setTrainingProblems(
          (trainingData.problems || []).map((p: any) => ({
            key: Math.random().toString(36).slice(2),
            id: p.id,
            title: p.title,
            description: p.description || "",
            inputDesc: p.inputDesc || "",
            outputDesc: p.outputDesc || "",
            sampleInput: p.sampleInput || "",
            sampleOutput: p.sampleOutput || "",
            testCases: parseTestCases(p.testCases),
            selfTestSamples: parseTestCases(p.selfTestSamples),
            timeLimit: p.timeLimit || 5,
            memoryLimit: p.memoryLimit || 256,
            difficulty: p.difficulty || "Easy",
            sourceProblemId: p.sourceProblemId || undefined,
            expanded: false,
          }))
        );
      }
      setLoading(false);
    });
  }, [trainingId]);

  const parseTestCases = (str: string): TestCase[] => {
    try { const arr = JSON.parse(str || "[]"); if (Array.isArray(arr) && arr.length > 0) return arr; } catch {}
    return [{ input: "", output: "" }];
  };

  const addEmptyProblem = () => {
    setTrainingProblems((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2),
        title: "",
        description: "",
        inputDesc: "",
        outputDesc: "",
        sampleInput: "",
        sampleOutput: "",
        testCases: [{ input: "", output: "" }],
        selfTestSamples: [{ input: "", output: "" }],
        timeLimit: 5,
        memoryLimit: 256,
        difficulty: "Easy",
        expanded: true,
      },
    ]);
  };

  const importProblem = (p: ProblemItem) => {
    setTrainingProblems((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2),
        title: p.title,
        description: p.description,
        inputDesc: p.inputDesc,
        outputDesc: p.outputDesc,
        sampleInput: p.sampleInput,
        sampleOutput: p.sampleOutput,
        testCases: parseTestCases(p.testCases),
        selfTestSamples: [{ input: "", output: "" }],
        timeLimit: p.timeLimit || 5,
        memoryLimit: p.memoryLimit || 256,
        difficulty: p.difficulty,
        sourceProblemId: p.id,
        expanded: false,
      },
    ]);
    setImportOpen(false);
  };

  const removeProblem = (key: string) => {
    setTrainingProblems((prev) => prev.filter((p) => p.key !== key));
  };

  const moveProblem = (index: number, dir: number) => {
    const newArr = [...trainingProblems];
    const target = index + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setTrainingProblems(newArr);
  };

  const updateProblem = (key: string, field: keyof TrainingProblemForm, value: string | number) => {
    setTrainingProblems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: value } : p))
    );
  };

  const toggleExpand = (key: string) => {
    setTrainingProblems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const updateTestCase = (key: string, index: number, field: "input" | "output", value: string) => {
    setTrainingProblems((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const updated = [...p.testCases];
        updated[index] = { ...updated[index], [field]: value };
        return { ...p, testCases: updated };
      })
    );
  };

  const addTestCase = (key: string) => {
    setTrainingProblems((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, testCases: [...p.testCases, { input: "", output: "" }] } : p
      )
    );
  };

  const removeTestCase = (key: string, index: number) => {
    setTrainingProblems((prev) =>
      prev.map((p) =>
        p.key === key && p.testCases.length > 1
          ? { ...p, testCases: p.testCases.filter((_, i) => i !== index) }
          : p
      )
    );
  };

  const updateSelfTest = (key: string, index: number, field: "input" | "output", value: string) => {
    setTrainingProblems((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const updated = [...p.selfTestSamples];
        updated[index] = { ...updated[index], [field]: value };
        return { ...p, selfTestSamples: updated };
      })
    );
  };

  const addSelfTest = (key: string) => {
    setTrainingProblems((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, selfTestSamples: [...p.selfTestSamples, { input: "", output: "" }] } : p
      )
    );
  };

  const removeSelfTest = (key: string, index: number) => {
    setTrainingProblems((prev) =>
      prev.map((p) =>
        p.key === key && p.selfTestSamples.length > 1
          ? { ...p, selfTestSamples: p.selfTestSamples.filter((_, i) => i !== index) }
          : p
      )
    );
  };

  const handleSave = async () => {
    if (!title || trainingProblems.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/training/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic,
          problems: trainingProblems.map((p) => ({
            title: p.title,
            description: p.description,
            inputDesc: p.inputDesc,
            outputDesc: p.outputDesc,
            sampleInput: p.sampleInput,
            sampleOutput: p.sampleOutput,
            testCases: JSON.stringify(p.testCases),
            selfTestSamples: JSON.stringify(p.selfTestSamples),
            timeLimit: Number(p.timeLimit),
            memoryLimit: Number(p.memoryLimit),
            difficulty: p.difficulty,
            sourceProblemId: p.sourceProblemId,
          })),
        }),
      });
      if (res.ok) {
        router.push("/admin/training");
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/training")}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Dumbbell className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">编辑训练 #{trainingId}</h1>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">题单名称</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入题单名称" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">题单简介</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入题单简介" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">难度</label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="入门">入门</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">标签（逗号分隔）</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="如：动态规划, 图论" />
          </div>
        </div>
      </div>

      {/* Problems */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">题单题目（{trainingProblems.length} 道）</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen((v) => !v)}>
              <Import className="h-3.5 w-3.5 mr-1" />
              从题库导入
            </Button>
            <Button size="sm" onClick={addEmptyProblem}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加题目
            </Button>
          </div>
        </div>

        {importOpen && (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2 max-h-[300px] overflow-y-auto">
            <p className="text-xs text-muted-foreground">点击题目将其复制导入为训练独立题目</p>
            {problems.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => importProblem(p)}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <span className="font-mono text-muted-foreground w-8">{p.id}</span>
                <span className="flex-1">{p.title}</span>
                <Badge variant="outline" className="text-[10px] h-5">{p.difficulty}</Badge>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {trainingProblems.map((p, idx) => (
            <div key={p.key} className="rounded-lg border border-border/50 bg-background">
              <div className="flex items-center gap-2 px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-8">{idx + 1}</span>
                <Input
                  value={p.title}
                  onChange={(e) => updateProblem(p.key, "title", e.target.value)}
                  placeholder="题目标题"
                  className="h-8 text-sm flex-1"
                />
                <Select value={p.difficulty} onValueChange={(v) => v && updateProblem(p.key, "difficulty", v)}>
                  <SelectTrigger className="h-8 w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProblem(idx, -1)} disabled={idx === 0}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProblem(idx, 1)} disabled={idx === trainingProblems.length - 1}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeProblem(p.key)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleExpand(p.key)}>
                  {p.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {p.expanded && (
                <div className="px-3 pb-3 space-y-3 border-t pt-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1 block">题目描述</Label>
                    <BlockNoteEditor
                      value={p.description}
                      onChange={(val) => updateProblem(p.key, "description", val)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">输入说明</Label>
                      <BlockNoteEditor
                        value={p.inputDesc}
                        onChange={(val) => updateProblem(p.key, "inputDesc", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">输出说明</Label>
                      <BlockNoteEditor
                        value={p.outputDesc}
                        onChange={(val) => updateProblem(p.key, "outputDesc", val)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">样例输入</Label>
                      <Textarea
                        value={p.sampleInput}
                        onChange={(e) => updateProblem(p.key, "sampleInput", e.target.value)}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">样例输出</Label>
                      <Textarea
                        value={p.sampleOutput}
                        onChange={(e) => updateProblem(p.key, "sampleOutput", e.target.value)}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  {/* Self-test Samples */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">自测样例</Label>
                      <Button variant="outline" size="sm" onClick={() => addSelfTest(p.key)} className="h-7 gap-1">
                        <Plus className="h-3 w-3" /> 添加
                      </Button>
                    </div>
                    {p.selfTestSamples.map((tc, tci) => (
                      <div key={tci} className="flex gap-2 items-start">
                        <span className="text-[10px] text-muted-foreground pt-2 w-5 shrink-0 text-right">#{tci + 1}</span>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <Textarea value={tc.input} onChange={(e) => updateSelfTest(p.key, tci, "input", e.target.value)} placeholder="输入数据" rows={2} className="font-mono text-xs" />
                          <Textarea value={tc.output} onChange={(e) => updateSelfTest(p.key, tci, "output", e.target.value)} placeholder="期望输出" rows={2} className="font-mono text-xs" />
                        </div>
                        <button type="button" onClick={() => removeSelfTest(p.key, tci)} disabled={p.selfTestSamples.length <= 1} className="p-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                  {/* Test Cases */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">测试数据（判题用，用户不可见）</Label>
                      <Button variant="outline" size="sm" onClick={() => addTestCase(p.key)} className="h-7 gap-1">
                        <Plus className="h-3 w-3" /> 添加
                      </Button>
                    </div>
                    {p.testCases.map((tc, tci) => (
                      <div key={tci} className="flex gap-2 items-start">
                        <span className="text-[10px] text-muted-foreground pt-2 w-5 shrink-0 text-right">#{tci + 1}</span>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <Textarea value={tc.input} onChange={(e) => updateTestCase(p.key, tci, "input", e.target.value)} placeholder="输入数据" rows={2} className="font-mono text-xs" />
                          <Textarea value={tc.output} onChange={(e) => updateTestCase(p.key, tci, "output", e.target.value)} placeholder="期望输出" rows={2} className="font-mono text-xs" />
                        </div>
                        <button type="button" onClick={() => removeTestCase(p.key, tci)} disabled={p.testCases.length <= 1} className="p-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">时间限制 (秒)</Label>
                      <Input
                        type="number"
                        value={p.timeLimit}
                        onChange={(e) => updateProblem(p.key, "timeLimit", Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">内存限制 (MB)</Label>
                      <Input
                        type="number"
                        value={p.memoryLimit}
                        onChange={(e) => updateProblem(p.key, "memoryLimit", Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {trainingProblems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
              尚未添加题目，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push("/admin/training")}>取消</Button>
        <Button onClick={handleSave} disabled={saving || !title || trainingProblems.length === 0}>
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "保存中..." : "保存修改"}
        </Button>
      </div>
    </div>
  );
}
