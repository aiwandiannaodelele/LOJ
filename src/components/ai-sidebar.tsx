"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, MessageSquarePlus, Send, Copy, Check, Brain, Clock, Trash2, Lightbulb, PenLine, GraduationCap, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ProblemInfo {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  inputDesc: string;
  outputDesc: string;
  sampleInput: string;
  sampleOutput: string;
  tags: string;
}

interface AISidebarProps {
  problem: ProblemInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_PROMPTS = [
  { icon: Lightbulb, label: "给我讲解此题" },
  { icon: PenLine, label: "给我出一道类似的题练习" },
  { icon: GraduationCap, label: "这道题考了什么知识点" },
];

function getHistoryKey(problemId: number) {
  return `loj_ai_history_${problemId}`;
}

function loadConversations(problemId: number): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(getHistoryKey(problemId)) || "[]");
  } catch {
    return [];
  }
}

function saveConversations(problemId: number, list: Conversation[]) {
  localStorage.setItem(getHistoryKey(problemId), JSON.stringify(list));
}

function FourPointedStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs><linearGradient id="star" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fb923c" /><stop offset="50%" stopColor="#f97316" /><stop offset="100%" stopColor="#9333ea" /></linearGradient></defs>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="url(#star)" />
    </svg>
  );
}

function CodeBlock({ language, children }: { language: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = typeof children === "string" ? children : "";
  const handleCopy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  return (
    <div className="rounded-lg bg-zinc-950 p-3 my-2 overflow-x-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-zinc-400 uppercase">{language}</span>
        <button type="button" onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "已复制" : "复制"}
        </button>
      </div>
      <code className="text-zinc-100 text-xs font-mono block whitespace-pre">{children}</code>
    </div>
  );
}

function ModelPopover({ value, onChange, models }: { value: string; onChange: (v: string) => void; models: { id: string; name: string; icon: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedModel = models.find((m) => m.id === value);
  const selectedName = selectedModel?.name || value.split("/").pop() || value;
  const selectedIcon = selectedModel?.icon;
  const renderIcon = (icon?: string, cls = "w-3.5 h-3.5", key?: string) => {
    if (!icon) return null;
    if (icon.startsWith("<svg")) return <span key={key} className={`${cls} shrink-0 overflow-hidden [&>svg]:w-full [&>svg]:h-full`} dangerouslySetInnerHTML={{ __html: icon }} />;
    return <img key={key} src={icon} className={`${cls} shrink-0 rounded-full object-cover`} alt="" />;
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1.5 h-7 px-2 rounded-lg border border-border/60 text-xs font-medium text-foreground/70 hover:bg-accent/50 transition-colors">
        {selectedIcon ? renderIcon(selectedIcon) : <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-white font-bold shrink-0">{selectedName.charAt(0).toUpperCase()}</span>}
        <span className="max-w-[90px] truncate">{selectedName}</span>
        <svg className="h-3 w-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-3 w-56 bg-popover border border-border rounded-xl shadow-xl p-1 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="max-h-48 overflow-y-auto">
            {models.map((m) => (
              <button key={m.id} type="button" onClick={() => { onChange(m.id); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${value === m.id ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"}`}>
                {m.icon ? (m.icon.startsWith("<svg") ? <span key={`icon-${m.id}`} className="w-5 h-5 shrink-0 overflow-hidden [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: m.icon }} /> : <img key={`icon-${m.id}`} src={m.icon} className="w-5 h-5 shrink-0 rounded-full object-cover" alt="" />) : <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">{m.name.charAt(0)}</span>}
                <span className="truncate">{m.name}</span>
                {value === m.id && <Check className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AIButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title="AI 助手" className="flex h-7 w-7 items-center justify-center rounded-md transition-transform hover:scale-110 active:scale-95">
      <FourPointedStar className="h-5 w-5" />
    </button>
  );
}

export default function AISidebar({ problem, open, onOpenChange }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("");
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [systemModel, setSystemModel] = useState("z-ai/glm-4.5-air:free");
  const [thinkEnabled, setThinkEnabled] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversations(loadConversations(problem.id));
  }, [problem.id]);

  // 从系统配置获取默认模型和模型列表
  useEffect(() => {
    const stored = localStorage.getItem("loj_ai_model");
    if (stored) { setModel(stored); }
    fetch("/api/ai/config").then(r => r.json()).then(data => {
      if (data.models && data.models.length > 0) {
        setAvailableModels(data.models);
        if (!stored) {
          const m = data.models[0].id;
          setSystemModel(m);
          setModel(m);
        }
      } else {
        const m = data.model || "z-ai/glm-4.5-air:free";
        setSystemModel(m);
        if (!stored) setModel(m);
        setAvailableModels([{ id: m, name: m, icon: "" }]);
      }
    }).catch(() => setModel(systemModel));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (model) localStorage.setItem("loj_ai_model", model); }, [model]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => { if (!open && abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsLoading(false); } }, [open]);
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  const saveCurrentConversation = useCallback(() => {
    if (messages.length === 0) return;
    const title = messages.find((m) => m.role === "user")?.content.slice(0, 40) || "新对话";
    const conv: Conversation = {
      id: currentConvId || crypto.randomUUID(),
      title,
      messages,
      createdAt: Date.now(),
    };
    setCurrentConvId(conv.id);
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== conv.id);
      const next = [conv, ...filtered];
      saveConversations(problem.id, next);
      return next;
    });
  }, [messages, currentConvId, problem.id]);

  const handleNewChat = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    saveCurrentConversation();
    setMessages([]);
    setCurrentConvId(null);
    setIsLoading(false);
    setShowHistory(false);
  }, [saveCurrentConversation]);

  const handleLoadConversation = useCallback((conv: Conversation) => {
    saveCurrentConversation();
    setMessages(conv.messages);
    setCurrentConvId(conv.id);
    setShowHistory(false);
  }, [saveCurrentConversation]);

  const handleDeleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = conversations.filter((c) => c.id !== id);
    setConversations(next);
    saveConversations(problem.id, next);
    if (currentConvId === id) {
      setMessages([]);
      setCurrentConvId(null);
    }
  }, [conversations, currentConvId, problem.id]);

  const send = async (content: string) => {
    if (isLoading || !content.trim()) return;

    const assistantId = crypto.randomUUID();
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, reasoning: "" };
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", reasoning: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let accContent = "";
    let accReasoning = "";

    const update = () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id !== assistantId) return prev;
        return [...prev.slice(0, -1), { ...last, content: accContent, reasoning: accReasoning }];
      });
    };

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content }],
          problem,
          model,
          thinkEnabled,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(await res.text() || "请求失败");
      if (!res.body) throw new Error("响应体为空");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const { type, text } = JSON.parse(line.slice(6));
              if (type === "content") { accContent += text; update(); }
              else if (type === "reasoning") { accReasoning += text; update(); }
              else if (type === "error") { accContent += text; update(); }
            } catch { /* skip */ }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role !== "assistant") return prev;
        return [...prev.slice(0, -1), { ...last, content: last.content + `错误：${e instanceof Error ? e.message : "请求失败"}` }];
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      // Auto-save after response completes
      setMessages((prev) => {
        if (prev.length >= 2) {
          const title = prev.find((m) => m.role === "user")?.content.slice(0, 40) || "新对话";
          const conv: Conversation = { id: currentConvId || crypto.randomUUID(), title, messages: prev, createdAt: Date.now() };
          if (!currentConvId) setCurrentConvId(conv.id);
          setConversations((clist) => {
            const filtered = clist.filter((c) => c.id !== conv.id);
            const next = [conv, ...filtered];
            saveConversations(problem.id, next);
            return next;
          });
        }
        return prev;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || isLoading) return; send(input.trim()); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSubmit(e); }
  };

  const adjustHeight = () => { const el = textareaRef.current; if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; };

  if (!open) return null;

  return (
    <div key="ai-sidebar-root" className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" onClick={() => onOpenChange(false)} />
      <div className="relative h-full bg-background border-l shadow-2xl flex flex-col" style={{ width: "100%", maxWidth: "420px", animation: "slideInRight 0.3s ease-out" }}>
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background gap-2">
          <div className="flex items-center gap-2">
            <FourPointedStar className="h-5 w-5" />
            <span className="font-bold text-sm">AI 助手</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-xl", showHistory ? "bg-accent" : "hover:bg-accent")} onClick={() => setShowHistory(!showHistory)} title="历史会话"><Clock className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-accent" onClick={handleNewChat} title="新对话"><MessageSquarePlus className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl hover:bg-accent" onClick={() => onOpenChange(false)} title="关闭"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* History panel */}
        {showHistory && (
          <div className="shrink-0 border-b bg-background p-3 space-y-2 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">历史会话</span>
              <button type="button" onClick={() => setShowHistory(false)} className="text-xs text-muted-foreground hover:text-foreground">收起</button>
            </div>
            {conversations.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">暂无历史会话</div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} onClick={() => handleLoadConversation(conv)} className={cn("flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors group", currentConvId === conv.id ? "bg-accent" : "hover:bg-accent/50")}>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{conv.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(conv.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <button type="button" onClick={(e) => handleDeleteConversation(conv.id, e)} className="shrink-0 ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">你好！我是 AI 编程助教，已为你加载当前题目。有什么可以帮你的？</p>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_PROMPTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button key={p.label} type="button" onClick={() => send(p.label)} className="flex flex-col items-center justify-center gap-2.5 text-center p-4 aspect-square rounded-2xl border border-border/60 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors group">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                        <Icon className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="text-xs font-medium leading-snug">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {msg.role === "assistant" ? (
                  <>
                    {msg.reasoning && (
                      <details className="mb-2" open={false}>
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">思考过程</summary>
                        <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed border-l-2 border-muted-foreground/20 pl-2.5">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground/80">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            code({ children }: { children?: React.ReactNode }) { return <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px] font-mono">{children}</code>; },
                            pre({ children }: { children?: React.ReactNode }) { return <>{children}</>; },
                          }}>{msg.reasoning}</ReactMarkdown>
                        </div>
                      </details>
                    )}
                    {msg.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeKatex]} components={{
                        h1: ({ children }) => <h1 className="text-base font-bold mt-4 mb-2 border-b border-border pb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                        p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        br: () => <br />,
                        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{children}</a>,
                        code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) { const m = /language-(\w+)/.exec(className || ""); return m ? <CodeBlock language={m[1]}>{children}</CodeBlock> : <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>; },
                        pre({ children }: { children?: React.ReactNode }) { return <>{children}</>; },
                      }}>{msg.content}</ReactMarkdown>
                    ) : isLoading ? (<span className="inline-flex items-center gap-1 text-muted-foreground text-xs">思考中...</span>) : null}
                  </>
                ) : msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t bg-background p-3 z-10 relative">
          <form onSubmit={handleSubmit} className="relative rounded-xl border border-border bg-background focus-within:ring-1 focus-within:ring-ring">
            <textarea ref={textareaRef} value={input} onChange={(e) => { setInput(e.target.value); adjustHeight(); }} onKeyDown={handleKeyDown} placeholder="输入问题... (Enter 发送，Shift+Enter 换行)" rows={2} className="w-full resize-none rounded-xl px-3 pt-3 pb-12 text-sm outline-none bg-transparent border-0 placeholder:text-muted-foreground min-h-[80px]" />
            <div className="absolute bottom-4 left-2 right-2 flex items-center justify-between">
              <ModelPopover value={model} onChange={setModel} models={availableModels} />
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className={cn("h-7 w-7 rounded-xl", thinkEnabled ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "hover:bg-accent")} onClick={() => setThinkEnabled(!thinkEnabled)} title={thinkEnabled ? "关闭深度思考" : "开启深度思考"}><Brain className="h-3.5 w-3.5" /></Button>
                {isLoading ? (
                  <Button type="button" size="icon" className="h-7 w-7 rounded-xl bg-destructive text-white hover:bg-destructive/90" onClick={() => abortRef.current?.abort()} title="停止输出"><Square className="h-3.5 w-3.5 fill-white stroke-white" /></Button>
                ) : (
                  <Button type="submit" size="icon" className="h-7 w-7 rounded-xl" disabled={!input.trim()}><Send className="h-3.5 w-3.5" /></Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
