"use client";

import "monaco-editor/esm/nls.messages.zh-cn.js";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import {
  Undo,
  Redo,
  Scissors,
  Copy,
  ClipboardPaste,
  AlignJustify,
  Trash2,
  ArrowDownToLine,
} from "lucide-react";
import { getCppCompletions, getCCompletions, extractCppContext, getCppIncludeCompletions, getCppMethodCompletions, getCIncludeCompletions } from "@/lib/completions/cpp";
import { getPythonCompletions, extractPythonContext } from "@/lib/completions/python";

interface MonacoEditorInnerProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly: boolean;
  fontSize?: number;
  tabSize?: number;
  onFontSizeChange?: (size: number) => void;
}

function monacoLang(lang: string): string {
  if (lang === "c") return "c";
  if (lang === "python" || lang === "python3" || lang === "python2") return "python";
  if (lang === "java") return "java";
  if (lang === "go") return "go";
  if (lang === "csharp") return "csharp";
  return "cpp";
}

function buildSuggestions(monaco: any, model: any, position: any, language: string) {
  const code = model.getValue();
  const word = model.getWordUntilPosition(position);
  const range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  };

  const lineContent = model.getLineContent(position.lineNumber);
  const textBefore = lineContent.substring(0, position.column - 1);

  const isDotTrigger = textBefore.trimEnd().endsWith(".");
  const isIncludeContext = /^\s*#\s*include\s*</.test(textBefore);
  // 检测是否在 # 后面（如 #in、#define 等）
  const isPreprocessorContext = /^\s*#\s*\w*$/.test(textBefore);

  let staticItems: any[];
  if (language === "c") {
    staticItems = getCCompletions(monaco);
  } else if (language === "cpp") {
    staticItems = getCppCompletions(monaco);
  } else {
    staticItems = getPythonCompletions(monaco);
  }

  let contextItems: any[] = [];
  if (language === "c" || language === "cpp") {
    contextItems = extractCppContext(code, monaco);
  } else {
    contextItems = extractPythonContext(code, monaco);
  }

  const toSuggestion = (item: any, r: any = range) => ({
    label: item.label,
    kind: item.kind,
    insertText: item.insertText,
    insertTextRules: item.insertText.includes("$")
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : monaco.languages.CompletionItemInsertTextRule.None,
    detail: item.detail,
    documentation: item.doc,
    range: r,
    sortText: item.sortText ?? "5",
  });

  // #include < 上下文：只显示头文件，range 从 < 后到光标位置
  if (isIncludeContext && (language === "c" || language === "cpp")) {
    const includeItems = language === "c"
      ? getCIncludeCompletions(monaco)
      : getCppIncludeCompletions(monaco);
    const ltPos = textBefore.lastIndexOf("<");
    const includeRange = ltPos >= 0
      ? {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: ltPos + 2, // < 后一位
          endColumn: position.column,
        }
      : range;
    return { suggestions: includeItems.map((item) => toSuggestion(item, includeRange)) };
  }

  // 预处理器上下文（#in 等）
  // 关键：range 从 # 之后开始，insertText 去掉前导 #，这样 Monaco 才能正确匹配过滤
  if (isPreprocessorContext && (language === "c" || language === "cpp")) {
    const hashPos = textBefore.indexOf("#");
    if (hashPos >= 0) {
      const preprocRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: hashPos + 2, // # 之后（hashPos 是 0-indexed，column 是 1-indexed）
        endColumn: position.column,
      };
      const preprocItems = staticItems
        .filter(
          (i) => i.kind === monaco.languages.CompletionItemKind.Snippet && i.insertText.startsWith("#")
        )
        .map((item) => ({
          ...item,
          insertText: item.insertText.replace(/^#/, ""), // 去掉前导 #，因为 # 已在编辑器中
        }));
      return { suggestions: preprocItems.map((item) => toSuggestion(item, preprocRange)) };
    }
  }

  // 点号触发：方法补全
  if (isDotTrigger && (language === "c" || language === "cpp")) {
    const methodItems = getCppMethodCompletions(monaco);
    return { suggestions: methodItems.map((item) => toSuggestion(item)) };
  }

  // 默认：合并上下文 + 静态补全（去重：同 label 只保留第一个）
  const allItems = [...contextItems, ...staticItems];
  const seen = new Set<string>();
  const dedupedItems = allItems.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
  return { suggestions: dedupedItems.map((item) => toSuggestion(item)) };
}

function defineLOJThemes(monaco: any) {
  monaco.editor.defineTheme("loj-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      /* ---- 功能性绿色保留 ---- */
      "editorCursor.foreground": "#10b981",
      "editorLineNumber.activeForeground": "#059669",
      "editor.selectionBackground": "#10b98133",
      "editor.selectionHighlightBackground": "#10b98122",
      "editor.inactiveSelectionBackground": "#10b98118",
      "editor.findMatchBackground": "#10b98144",
      "editor.findMatchHighlightBackground": "#10b98122",
      "editorOverviewRuler.findMatchForeground": "#10b981",
      "editorOverviewRuler.modifiedForeground": "#10b981",
      "editorOverviewRuler.addedForeground": "#10b981",
      "editorGutter.modifiedBackground": "#10b981",
      "editorGutter.addedBackground": "#10b981",
      "editorGutter.deletedBackground": "#ef4444",
      "editorOverviewRuler.errorForeground": "#ef4444",
      "editorOverviewRuler.warningForeground": "#f59e0b",
      "editorOverviewRuler.infoForeground": "#3b82f6",
      "editorMarkerNavigationError.background": "#ef4444",
      "editorMarkerNavigationWarning.background": "#f59e0b",
      "editorMarkerNavigationInfo.background": "#3b82f6",
      "debugExceptionWidget.background": "#fef2f2",
      "debugExceptionWidget.border": "#ef4444",

      /* ---- 菜单 / 列表选中 保留绿色 ---- */
      "menu.background": "#ffffff",
      "menu.foreground": "#374151",
      "menu.selectionBackground": "#059669",
      "menu.selectionForeground": "#ffffff",
      "menu.selectionBorder": "#059669",
      "menu.separatorBackground": "#e5e7eb",
      "list.activeSelectionBackground": "#059669",
      "list.activeSelectionForeground": "#ffffff",
      "list.focusBackground": "#059669",
      "list.focusForeground": "#ffffff",
      "list.hoverBackground": "#f3f4f6",
      "list.hoverForeground": "#374151",
      "quickInput.background": "#ffffff",
      "quickInput.foreground": "#374151",
      "quickInputList.focusBackground": "#059669",
      "quickInputList.focusForeground": "#ffffff",

      /* ---- 其余控件改灰色系 ---- */
      "editorLineNumber.foreground": "#a3a3a3",
      "editor.wordHighlightBackground": "#e5e7eb55",
      "editor.wordHighlightStrongBackground": "#d1d5db66",
      "editor.findRangeHighlightBackground": "#f3f4f6",
      "editor.hoverHighlightBackground": "#f3f4f6",
      "editor.lineHighlightBackground": "#f9fafb",
      "editor.lineHighlightBorder": "#f3f4f6",
      "editor.rangeHighlightBackground": "#f9fafb",
      "editorIndentGuide.background": "#e5e7eb",
      "editorIndentGuide.activeBackground": "#9ca3af",
      "editorRuler.foreground": "#e5e7eb",
      "editorCodeLens.foreground": "#9ca3af",
      "editorBracketMatch.background": "#f3f4f6",
      "editorBracketMatch.border": "#d1d5db",
      "editorOverviewRuler.border": "#f3f4f6",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e5e7eb",
      "editorWidget.resizeBorder": "#d1d5db",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#e5e7eb",
      "editorSuggestWidget.highlightForeground": "#111827",
      "editorSuggestWidget.selectedBackground": "#f3f4f6",
      "editorSuggestWidget.selectedForeground": "#111827",
      "editorHoverWidget.background": "#ffffff",
      "editorHoverWidget.border": "#e5e7eb",
      "editorMarkerNavigation.background": "#ffffff",
      "peekView.border": "#e5e7eb",
      "peekViewEditor.background": "#fafafa",
      "peekViewEditorGutter.background": "#fafafa",
      "peekViewResult.background": "#ffffff",
      "peekViewResult.lineForeground": "#374151",
      "peekViewResult.fileForeground": "#111827",
      "peekViewResult.selectionBackground": "#f3f4f6",
      "peekViewTitle.background": "#f9fafb",
      "peekViewTitleDescription.foreground": "#6b7280",
      "peekViewTitleLabel.foreground": "#111827",
      "merge.currentContentBackground": "#f0fdf4",
      "merge.currentHeaderBackground": "#dcfce7",
      "merge.incomingContentBackground": "#f0f9ff",
      "merge.incomingHeaderBackground": "#dbeafe",
      "merge.commonContentBackground": "#f9fafb",
      "merge.commonHeaderBackground": "#f3f4f6",
      "editorUnnecessaryCode.border": "#9ca3af",
      "editorUnnecessaryCode.opacity": "#00000066",
    },
  });
  monaco.editor.defineTheme("loj-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      /* ---- 功能性绿色保留 ---- */
      "editorCursor.foreground": "#34d399",
      "editorLineNumber.activeForeground": "#34d399",
      "editor.selectionBackground": "#10b98133",
      "editor.selectionHighlightBackground": "#10b98122",
      "editor.inactiveSelectionBackground": "#10b98118",
      "editor.findMatchBackground": "#10b98144",
      "editor.findMatchHighlightBackground": "#10b98122",
      "editorOverviewRuler.findMatchForeground": "#10b981",
      "editorOverviewRuler.modifiedForeground": "#10b981",
      "editorOverviewRuler.addedForeground": "#10b981",
      "editorGutter.modifiedBackground": "#10b981",
      "editorGutter.addedBackground": "#10b981",
      "editorGutter.deletedBackground": "#ef4444",
      "editorOverviewRuler.errorForeground": "#ef4444",
      "editorOverviewRuler.warningForeground": "#f59e0b",
      "editorOverviewRuler.infoForeground": "#3b82f6",
      "editorMarkerNavigationError.background": "#ef4444",
      "editorMarkerNavigationWarning.background": "#f59e0b",
      "editorMarkerNavigationInfo.background": "#3b82f6",
      "debugExceptionWidget.background": "#3f1a1a",
      "debugExceptionWidget.border": "#ef4444",

      /* ---- 菜单 / 列表选中 保留绿色 ---- */
      "menu.background": "#1f2937",
      "menu.foreground": "#d1d5db",
      "menu.selectionBackground": "#10b981",
      "menu.selectionForeground": "#ffffff",
      "menu.selectionBorder": "#10b981",
      "menu.separatorBackground": "#374151",
      "list.activeSelectionBackground": "#10b981",
      "list.activeSelectionForeground": "#ffffff",
      "list.focusBackground": "#10b981",
      "list.focusForeground": "#ffffff",
      "list.hoverBackground": "#374151",
      "list.hoverForeground": "#d1d5db",
      "quickInput.background": "#1f2937",
      "quickInput.foreground": "#d1d5db",
      "quickInputList.focusBackground": "#10b981",
      "quickInputList.focusForeground": "#ffffff",

      /* ---- 其余控件改灰色系 ---- */
      "editorLineNumber.foreground": "#6b7280",
      "editor.wordHighlightBackground": "#37415155",
      "editor.wordHighlightStrongBackground": "#4b556366",
      "editor.findRangeHighlightBackground": "#1f2937",
      "editor.hoverHighlightBackground": "#1f2937",
      "editor.lineHighlightBackground": "#1f2937",
      "editor.lineHighlightBorder": "#374151",
      "editor.rangeHighlightBackground": "#1f2937",
      "editorIndentGuide.background": "#374151",
      "editorIndentGuide.activeBackground": "#6b7280",
      "editorRuler.foreground": "#374151",
      "editorCodeLens.foreground": "#6b7280",
      "editorBracketMatch.background": "#374151",
      "editorBracketMatch.border": "#4b5563",
      "editorOverviewRuler.border": "#1f2937",
      "editorWidget.background": "#1f2937",
      "editorWidget.border": "#374151",
      "editorWidget.resizeBorder": "#4b5563",
      "editorSuggestWidget.background": "#1f2937",
      "editorSuggestWidget.border": "#374151",
      "editorSuggestWidget.highlightForeground": "#f3f4f6",
      "editorSuggestWidget.selectedBackground": "#374151",
      "editorSuggestWidget.selectedForeground": "#f3f4f6",
      "editorHoverWidget.background": "#1f2937",
      "editorHoverWidget.border": "#374151",
      "editorMarkerNavigation.background": "#1f2937",
      "peekView.border": "#374151",
      "peekViewEditor.background": "#111827",
      "peekViewEditorGutter.background": "#111827",
      "peekViewResult.background": "#1f2937",
      "peekViewResult.lineForeground": "#d1d5db",
      "peekViewResult.fileForeground": "#f3f4f6",
      "peekViewResult.selectionBackground": "#374151",
      "peekViewTitle.background": "#111827",
      "peekViewTitleDescription.foreground": "#9ca3af",
      "peekViewTitleLabel.foreground": "#f3f4f6",
      "merge.currentContentBackground": "#064e3b",
      "merge.currentHeaderBackground": "#065f46",
      "merge.incomingContentBackground": "#0c4a6e",
      "merge.incomingHeaderBackground": "#075985",
      "merge.commonContentBackground": "#1f2937",
      "merge.commonHeaderBackground": "#374151",
      "editorUnnecessaryCode.border": "#6b7280",
      "editorUnnecessaryCode.opacity": "#00000066",
    },
  });
}

function resolveEditorTheme(resolvedTheme: string | undefined): string {
  return resolvedTheme === "dark" ? "loj-dark" : "loj-light";
}

export default function MonacoEditorInner({
  value,
  onChange,
  language,
  readOnly,
  fontSize: initialFontSize = 14,
  tabSize = 4,
  onFontSizeChange,
}: MonacoEditorInnerProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const fontSizeRef = useRef(initialFontSize);
  const disposablesRef = useRef<any[]>([]);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Wait for theme to be resolved to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      disposablesRef.current.forEach((d) => d.dispose?.());
      disposablesRef.current = [];
    };
  }, []);

  // Close context menu on click outside / scroll / resize
  useEffect(() => {
    if (!ctxMenu) return;
    const close = (e?: Event) => {
      if (e instanceof MouseEvent && menuRef.current?.contains(e.target as Node)) return;
      setCtxMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [ctxMenu]);

  // Inject Monaco widget override styles AFTER editor mounts so they beat Monaco's dynamic CSS
  const injectWidgetStyles = () => {
    const id = "monaco-loj-widget-overrides";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      /* Find/Replace widget */
      .monaco-editor .find-widget,
      .monaco-editor .editor-widget.find-widget {
        border-radius: 12px !important;
        overflow: hidden !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        background: #ffffff !important;
      }
      .monaco-editor .find-widget .find-part,
      .monaco-editor .find-widget .replace-part {
        background: #ffffff !important;
      }
      .monaco-editor .find-widget .monaco-inputbox.synthetic-focus,
      .monaco-editor .find-widget .monaco-inputbox.synthetic-focus .input {
        outline: 1px solid #10b981 !important;
        outline-offset: -1px !important;
        border-color: #10b981 !important;
      }
      .monaco-editor .find-widget .button:not(.disabled):hover {
        background-color: #f3f4f6 !important;
      }
      .monaco-editor .find-widget .monaco-sash {
        background-color: #e5e7eb !important;
      }
      .monaco-editor .find-widget .button.toggle.checked {
        background-color: #10b981 !important;
        color: #ffffff !important;
        border-color: #10b981 !important;
      }

      /* Context menu */
      .monaco-menu-container,
      .monaco-menu-container .monaco-menu,
      .context-view.monaco-menu-container,
      .context-view .monaco-menu {
        border-radius: 12px !important;
        overflow: hidden !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        border: 1px solid #e5e7eb !important;
      }
      .monaco-menu-container .monaco-scrollable-element,
      .monaco-menu-container .monaco-menu .monaco-scrollable-element {
        box-shadow: none !important;
      }
      .monaco-menu-container .monaco-list .monaco-list-row.focused,
      .monaco-menu-container .monaco-list .monaco-list-row.selected {
        background-color: #059669 !important;
        color: #ffffff !important;
        border-radius: 6px !important;
      }

      /* Command Palette */
      .quick-input-widget {
        border-radius: 12px !important;
        overflow: hidden !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        border: 1px solid #e5e7eb !important;
      }
      .quick-input-widget .monaco-inputbox {
        border-radius: 8px !important;
      }
      .quick-input-widget .monaco-inputbox .input {
        border-radius: 8px !important;
      }
      .quick-input-widget .monaco-list .monaco-list-row.focused,
      .quick-input-widget .monaco-list .monaco-list-row.selected {
        background-color: #059669 !important;
        color: #ffffff !important;
        border-radius: 6px !important;
      }

      /* Suggest widget */
      .suggest-widget {
        border-radius: 8px !important;
        overflow: hidden !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        border: 1px solid #e5e7eb !important;
      }
      .suggest-widget .monaco-list .monaco-list-row.focused,
      .suggest-widget .monaco-list .monaco-list-row.selected {
        background-color: #059669 !important;
        color: #ffffff !important;
        border-radius: 6px !important;
      }
      .suggest-widget .monaco-list .monaco-list-row.focused .monaco-highlighted-label .label-description,
      .suggest-widget .monaco-list .monaco-list-row.selected .monaco-highlighted-label .label-description,
      .suggest-widget .monaco-list .monaco-list-row.focused .monaco-icon-label .label-description,
      .suggest-widget .monaco-list .monaco-list-row.selected .monaco-icon-label .label-description {
        color: #e5e7eb !important;
      }

      /* Hover widget */
      .monaco-editor-hover,
      .monaco-hover {
        border-radius: 12px !important;
        overflow: hidden !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
      }

      /* Dark mode overrides */
      .dark .monaco-editor .find-widget,
      .dark .monaco-editor .editor-widget.find-widget {
        border-color: #374151 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
        background: #1f2937 !important;
      }
      .dark .monaco-editor .find-widget .find-part,
      .dark .monaco-editor .find-widget .replace-part {
        background: #1f2937 !important;
      }
      .dark .monaco-editor .find-widget .monaco-inputbox.synthetic-focus,
      .dark .monaco-editor .find-widget .monaco-inputbox.synthetic-focus .input {
        outline: 1px solid #34d399 !important;
        outline-offset: -1px !important;
        border-color: #34d399 !important;
      }
      .dark .monaco-editor .find-widget .button:not(.disabled):hover {
        background-color: #374151 !important;
      }
      .dark .monaco-editor .find-widget .monaco-sash {
        background-color: #374151 !important;
      }
      .dark .monaco-menu-container,
      .dark .monaco-menu-container .monaco-menu,
      .dark .context-view.monaco-menu-container,
      .dark .context-view .monaco-menu {
        border-color: #374151 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
      }
      .dark .monaco-menu-container .monaco-scrollable-element,
      .dark .monaco-menu-container .monaco-menu .monaco-scrollable-element {
        box-shadow: none !important;
      }
      .dark .monaco-menu-container .monaco-list .monaco-list-row.focused,
      .dark .monaco-menu-container .monaco-list .monaco-list-row.selected {
        background-color: #10b981 !important;
        color: #ffffff !important;
      }
      .dark .quick-input-widget {
        border-color: #374151 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
      }
      .dark .quick-input-widget .monaco-list .monaco-list-row.focused,
      .dark .quick-input-widget .monaco-list .monaco-list-row.selected {
        background-color: #10b981 !important;
        color: #ffffff !important;
      }
      .dark .suggest-widget {
        border-color: #374151 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
      }
      .dark .suggest-widget .monaco-list .monaco-list-row.focused,
      .dark .suggest-widget .monaco-list .monaco-list-row.selected {
        background-color: #10b981 !important;
        color: #ffffff !important;
        border-radius: 6px !important;
      }
      .dark .suggest-widget .monaco-list .monaco-list-row.focused .monaco-highlighted-label .label-description,
      .dark .suggest-widget .monaco-list .monaco-list-row.selected .monaco-highlighted-label .label-description,
      .dark .suggest-widget .monaco-list .monaco-list-row.focused .monaco-icon-label .label-description,
      .dark .suggest-widget .monaco-list .monaco-list-row.selected .monaco-icon-label .label-description {
        color: #d1d5db !important;
      }
      .dark .monaco-editor-hover,
      .dark .monaco-hover {
        border-color: #374151 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
      }
    `;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: initialFontSize });
      fontSizeRef.current = initialFontSize;
    }
  }, [initialFontSize]);

  // Switch editor theme when page theme changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const theme = resolveEditorTheme(resolvedTheme);
      monacoRef.current.editor.setTheme(theme);
    }
  }, [resolvedTheme]);

  const registerProvider = (monaco: any) => {
    // 清理旧的
    disposablesRef.current.forEach((d) => d.dispose());
    disposablesRef.current = [];

    const mLang = monacoLang(language);
    const provider = monaco.languages.registerCompletionItemProvider(mLang, {
      triggerCharacters: [".", "<", " ", "#", ..."abcdefghijklmnopqrstuvwxyz".split("")],
      provideCompletionItems: (model: any, position: any) =>
        buildSuggestions(monaco, model, position, language),
    });
    disposablesRef.current.push(provider);
  };

  useEffect(() => {
    if (monacoRef.current) {
      registerProvider(monacoRef.current);
    }
  }, [language]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    defineLOJThemes(monaco);
    registerProvider(monaco);

    // Apply initial theme
    const theme = resolveEditorTheme(resolvedTheme);
    monaco.editor.setTheme(theme);

    // Inject widget styles after Monaco CSS has loaded
    injectWidgetStyles();

    // MutationObserver to patch Monaco context menu DOM as it appears
    const isDark = resolvedTheme === "dark";
    const menuObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          // Target: context menu containers created by Monaco
          const menuContainers = node.matches?.(".monaco-menu-container")
            ? [node]
            : Array.from(node.querySelectorAll?.(".monaco-menu-container") || []);

          menuContainers.forEach((container: Element) => {
            const el = container as HTMLElement;
            // Container styles
            el.style.borderRadius = "12px";
            el.style.overflow = "hidden";
            el.style.border = isDark ? "1px solid #374151" : "1px solid #e5e7eb";
            el.style.boxShadow = isDark
              ? "0 1px 4px rgba(0,0,0,0.2)"
              : "0 1px 4px rgba(0,0,0,0.06)";

            // Remove inner scrollable shadow
            const scrollable = el.querySelector(".monaco-scrollable-element") as HTMLElement | null;
            if (scrollable) {
              scrollable.style.boxShadow = "none";
            }

            // Patch list rows for rounded selection
            const rows = el.querySelectorAll(".monaco-list-row");
            rows.forEach((row) => {
              const r = row as HTMLElement;
              r.style.borderRadius = "6px";
              if (r.classList.contains("focused") || r.classList.contains("selected")) {
                r.style.backgroundColor = isDark ? "#10b981" : "#059669";
                r.style.color = "#ffffff";
              }
            });

            // Also patch action-item based menus (older Monaco)
            const actionItems = el.querySelectorAll(".action-item");
            actionItems.forEach((item) => {
              const ai = item as HTMLElement;
              ai.style.borderRadius = "6px";
            });
            const actionLabels = el.querySelectorAll(".action-label");
            actionLabels.forEach((label) => {
              const al = label as HTMLElement;
              if (
                al.closest(".action-item.focused") ||
                al.closest(".action-item:hover") ||
                al.closest(".action-item.selected")
              ) {
                al.style.backgroundColor = isDark ? "#10b981" : "#059669";
                al.style.color = "#ffffff";
              }
            });
          });
        });
      });
    });
    menuObserver.observe(document.body, { childList: true, subtree: false });
    disposablesRef.current.push({ dispose: () => menuObserver.disconnect() });

    // ---- Custom context menu: intercept right-click ----
    const domNode = editor.getDomNode();
    if (domNode) {
      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const menuW = 200;
        const menuH = 280;
        const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
        const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
        setCtxMenu({ x, y });
      };
      domNode.addEventListener("contextmenu", onContextMenu, true);
      disposablesRef.current.push({
        dispose: () => domNode.removeEventListener("contextmenu", onContextMenu, true),
      });
    }

    // 字体大小快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
      const newSize = Math.min(fontSizeRef.current + 1, 24);
      fontSizeRef.current = newSize;
      editor.updateOptions({ fontSize: newSize });
      onFontSizeChange?.(newSize);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
      const newSize = Math.max(fontSizeRef.current - 1, 10);
      fontSizeRef.current = newSize;
      editor.updateOptions({ fontSize: newSize });
      onFontSizeChange?.(newSize);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => {
      fontSizeRef.current = 14;
      editor.updateOptions({ fontSize: 14 });
      onFontSizeChange?.(14);
    });

    // 禁用命令面板快捷键 (F1 / Ctrl+Shift+P)
    editor.addCommand(monaco.KeyCode.F1, () => {}, "");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {}, "");
  };

  const activeTheme = resolveEditorTheme(resolvedTheme);

  const runAction = (actionId: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    setCtxMenu(null);
    setTimeout(() => {
      // 剪贴板操作受浏览器安全限制，用 execCommand 更可靠
      if (actionId === "editor.action.clipboardCutAction") {
        document.execCommand("cut");
      } else if (actionId === "editor.action.clipboardCopyAction") {
        document.execCommand("copy");
      } else if (actionId === "editor.action.clipboardPasteAction") {
        document.execCommand("paste");
      } else {
        editor.trigger("contextmenu", actionId, null);
      }
    }, 10);
  };

  const menuItems = [
    { id: "undo", label: "撤销", icon: Undo, action: "undo" },
    { id: "redo", label: "重做", icon: Redo, action: "redo" },
    { type: "separator" as const },
    { id: "cut", label: "剪切", icon: Scissors, action: "editor.action.clipboardCutAction", needSelection: true },
    { id: "copy", label: "复制", icon: Copy, action: "editor.action.clipboardCopyAction", needSelection: true },
    { id: "paste", label: "粘贴", icon: ClipboardPaste, action: "editor.action.clipboardPasteAction" },
    { type: "separator" as const },
    { id: "selectAll", label: "全选", icon: AlignJustify, action: "editor.action.selectAll" },
    { id: "copyLineDown", label: "向下复制行", icon: ArrowDownToLine, action: "editor.action.copyLinesDownAction" },
    { id: "deleteLine", label: "删除行", icon: Trash2, action: "editor.action.deleteLines" },
  ];

  const isDisabled = (item: (typeof menuItems)[number]) => {
    if (item.type === "separator") return false;
    if (!editorRef.current) return true;
    if (item.needSelection) {
      const sel = editorRef.current.getSelection();
      return sel?.isEmpty() ?? true;
    }
    return false;
  };

  return (
    <>
      <Editor
        height="100%"
        language={monacoLang(language)}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme={mounted ? activeTheme : "loj-light"}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          contextmenu: false,
          fontSize: initialFontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize,
          insertSpaces: true,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "gutter",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6, useShadows: false },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          matchBrackets: "always",
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          wordBasedSuggestions: "off",
          suggest: {
            showWords: false,          // 不显示文档中已有单词的建议
            showSnippets: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true,
            showConstants: true,
            showModules: true,
          },
        }}
      />
      {ctxMenu && (
        <div
          ref={menuRef}
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          className="fixed z-50 min-w-[180px] rounded-xl border border-border bg-popover p-1 shadow-md"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {menuItems.map((item, idx) => {
            if (item.type === "separator") {
              return <div key={`sep-${idx}`} className="my-1 h-px bg-border" />;
            }
            const disabled = isDisabled(item);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                disabled={disabled}
                onClick={() => runAction(item.action)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                  disabled
                    ? "cursor-not-allowed text-muted-foreground opacity-50"
                    : "text-popover-foreground hover:bg-emerald-500 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
