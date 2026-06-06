"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, ArrowLeft, Plus, Trash2, Import, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
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

interface ContestProblemForm {
  key: string;
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
  sourceProblemId?: number;
  expanded: boolean;
}

export default function AdminContestNewPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("ACM");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [password, setPassword] = useState("");
  const [contestProblems, setContestProblems] = useState<ContestProblemForm[]>([]);
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contest?bank=1")
      .then((r) => r.json())
      .then((data) => setProblems(data.problems || []));
  }, []);

  const addEmptyProblem = () => {
    setContestProblems((prev) => [
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
        expanded: true,
      },
    ]);
  };

  const importProblem = (p: ProblemItem) => {
    let parsedTC: TestCase[] = [];
    try { const arr = JSON.parse(p.testCases || "[]"); if (Array.isArray(arr) && arr.length > 0) parsedTC = arr; } catch {}
    if (parsedTC.length === 0) parsedTC = [{ input: "", output: "" }];
    setContestProblems((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2),
        title: p.title,
        description: p.description,
        inputDesc: p.inputDesc,
        outputDesc: p.outputDesc,
        sampleInput: p.sampleInput,
        sampleOutput: p.sampleOutput,
        testCases: parsedTC,
        selfTestSamples: [{ input: "", output: "" }],
        timeLimit: p.timeLimit || 5,
        memoryLimit: p.memoryLimit || 256,
        sourceProblemId: p.id,
        expanded: true,
      },
    ]);
    setImportOpen(false);
  };

  const removeProblem = (key: string) => {
    setContestProblems((prev) => prev.filter((p) => p.key !== key));
  };

  const moveProblem = (index: number, dir: number) => {
    const newArr = [...contestProblems];
    const target = index + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setContestProblems(newArr);
  };

  const updateProblem = (key: string, field: keyof ContestProblemForm, value: string | number) => {
    setContestProblems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: value } : p))
    );
  };

  const toggleExpand = (key: string) => {
    setContestProblems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const updateTestCase = (key: string, index: number, field: "input" | "output", value: string) => {
    setContestProblems((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const updated = [...p.testCases];
        updated[index] = { ...updated[index], [field]: value };
        return { ...p, testCases: updated };
      })
    );
  };

  const addTestCase = (key: string) => {
    setContestProblems((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, testCases: [...p.testCases, { input: "", output: "" }] } : p
      )
    );
  };

  const removeTestCase = (key: string, index: number) => {
    setContestProblems((prev) =>
      prev.map((p) =>
        p.key === key && p.testCases.length > 1
          ? { ...p, testCases: p.testCases.filter((_, i) => i !== index) }
          : p
      )
    );
  };

  const updateSelfTest = (key: string, index: number, field: "input" | "output", value: string) => {
    setContestProblems((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const updated = [...p.selfTestSamples];
        updated[index] = { ...updated[index], [field]: value };
        return { ...p, selfTestSamples: updated };
      })
    );
  };

  const addSelfTest = (key: string) => {
    setContestProblems((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, selfTestSamples: [...p.selfTestSamples, { input: "", output: "" }] } : p
      )
    );
  };

  const removeSelfTest = (key: string, index: number) => {
    setContestProblems((prev) =>
      prev.map((p) =>
        p.key === key && p.selfTestSamples.length > 1
          ? { ...p, selfTestSamples: p.selfTestSamples.filter((_, i) => i !== index) }
          : p
      )
    );
  };

  const handleCreate = async () => {
    if (!title || !startTime || !endTime || contestProblems.length === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          startTime,
          endTime,
          password: password || undefined,
          problems: contestProblems.map((p) => ({
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
            sourceProblemId: p.sourceProblemId,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/contest/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/contest")}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Swords className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">创建比赛</h1>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">比赛名称</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入比赛名称" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">比赛简介</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入比赛简介" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">赛制</label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACM">ACM</SelectItem>
                <SelectItem value="OI">OI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">参赛密码（留空公开）</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="可选" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">开始时间</label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">结束时间</label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Problems */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">比赛题目（{contestProblems.length} 道）</h3>
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
            <p className="text-xs text-muted-foreground">点击题目将其复制导入为比赛独立题目</p>
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
          {contestProblems.map((p, idx) => (
            <div key={p.key} className="rounded-lg border border-border/50 bg-background">
              <div className="flex items-center gap-2 px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-8">{String.fromCharCode(65 + idx)}</span>
                <Input
                  value={p.title}
                  onChange={(e) => updateProblem(p.key, "title", e.target.value)}
                  placeholder="题目标题"
                  className="h-8 text-sm flex-1"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProblem(idx, -1)} disabled={idx === 0}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProblem(idx, 1)} disabled={idx === contestProblems.length - 1}>
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

          {contestProblems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
              尚未添加题目，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.push("/admin/contest")}>取消</Button>
        <Button onClick={handleCreate} disabled={creating || !title || !startTime || !endTime || contestProblems.length === 0}>
          {creating ? "创建中..." : "创建比赛"}
        </Button>
      </div>
    </div>
  );
}
