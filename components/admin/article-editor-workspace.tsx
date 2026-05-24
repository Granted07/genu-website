"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  CheckSquare,
  Code2,
  Command,
  FilePenLine,
  Hash,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";
import React from "react";

import { ArticleMarkdown } from "@/components/article-markdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, normalizeCategories } from "@/lib/utils";

type EditorRow = {
  uuid?: string;
  title: string;
  author: string;
  dek: string;
  category: string;
  content: string;
  created_at?: string | null;
  modified_at?: string | null;
};

type EditorPayload = {
  token: string;
  table: "dod" | "casefiles" | "signals";
  row: Partial<EditorRow> & Record<string, unknown>;
};

type CommandItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  run: (editor: EditorActions) => void;
};

type EditorActions = {
  wrapSelection: (before: string, after?: string) => void;
  insertBlock: (text: string) => void;
  replaceCurrentLine: (transform: (line: string) => string) => void;
  focusEditor: () => void;
  openMetadata: () => void;
};

const DRAFT_PREFIX = "genu-admin-editor:draft:";
const CHANNEL_NAME = "genu-admin-editor";
const STORAGE_BOOT_PREFIX = "genu-admin-editor:boot:";

const DEFAULT_ROW: EditorRow = {
  title: "Untitled article",
  author: "",
  dek: "",
  category: "",
  content: "",
};

function readJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeRow(
  input: (Partial<EditorRow> & Record<string, unknown>) | null | undefined,
): EditorRow {
  return {
    uuid: typeof input?.uuid === "string" ? input.uuid : undefined,
    title:
      typeof input?.title === "string" && input.title.trim()
        ? input.title
        : DEFAULT_ROW.title,
    author: typeof input?.author === "string" ? input.author : "",
    dek:
      typeof input?.dek === "string"
        ? input.dek
        : typeof input?.subhead === "string"
          ? input.subhead
          : typeof input?.summary === "string"
            ? input.summary
            : typeof input?.description === "string"
              ? input.description
              : "",
    category: Array.isArray(input?.category)
      ? input.category.map(String).join(", ")
      : typeof input?.category === "string"
        ? input.category
        : "",
    content: typeof input?.content === "string" ? input.content : "",
    created_at: typeof input?.created_at === "string" ? input.created_at : null,
    modified_at:
      typeof input?.modified_at === "string" ? input.modified_at : null,
  };
}

function isSameDraft(left: EditorRow, right: EditorRow) {
  return (
    left.uuid === right.uuid &&
    left.title === right.title &&
    left.author === right.author &&
    left.dek === right.dek &&
    left.category === right.category &&
    left.content === right.content &&
    left.created_at === right.created_at &&
    left.modified_at === right.modified_at
  );
}

function getLineInfo(text: string, cursor: number) {
  const before = text.slice(0, cursor);
  const lineStart = before.lastIndexOf("\n") + 1;
  const lineEnd =
    text.indexOf("\n", cursor) === -1
      ? text.length
      : text.indexOf("\n", cursor);
  const line = text.slice(lineStart, lineEnd);
  return { lineStart, lineEnd, line, before, after: text.slice(cursor) };
}

function getWordMetrics(text: string) {
  const normalized = text.trim();
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;
  const charCount = text.length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));
  return { wordCount, charCount, readingMinutes };
}

function parseCategoryInput(value: string) {
  if (!value.trim()) return null;
  return normalizeCategories(value);
}

function makeDraftKey(draftId: string) {
  return `${DRAFT_PREFIX}${draftId}`;
}

function makeBootKey(draftId: string) {
  return `${STORAGE_BOOT_PREFIX}${draftId}`;
}

const editorCommands = (actions: EditorActions): CommandItem[] => [
  {
    id: "heading-1",
    label: "Heading 1",
    description: "Insert a large heading",
    icon: Heading1,
    keywords: ["h1", "title", "heading"],
    run: () => actions.insertBlock("# "),
  },
  {
    id: "heading-2",
    label: "Heading 2",
    description: "Insert a section heading",
    icon: Heading2,
    keywords: ["h2", "subheading"],
    run: () => actions.insertBlock("## "),
  },
  {
    id: "quote",
    label: "Quote",
    description: "Insert a blockquote marker",
    icon: Quote,
    keywords: ["quote", "blockquote"],
    run: () => actions.insertBlock("> "),
  },
  {
    id: "callout",
    label: "Callout",
    description: "Start a highlighted note",
    icon: Sparkles,
    keywords: ["callout", "note", "highlight"],
    run: () => actions.insertBlock("> **Note:** "),
  },
  {
    id: "bullet-list",
    label: "Bullet list",
    description: "Insert a bullet list item",
    icon: List,
    keywords: ["list", "bullet"],
    run: () => actions.insertBlock("- "),
  },
  {
    id: "numbered-list",
    label: "Numbered list",
    description: "Insert an ordered list item",
    icon: ListOrdered,
    keywords: ["numbered", "ordered"],
    run: () => actions.insertBlock("1. "),
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Insert an unchecked task item",
    icon: CheckSquare,
    keywords: ["checklist", "todo", "task"],
    run: () => actions.insertBlock("- [ ] "),
  },
  {
    id: "divider",
    label: "Divider",
    description: "Insert a horizontal rule",
    icon: Minus,
    keywords: ["divider", "rule"],
    run: () => actions.insertBlock("\n---\n"),
  },
  {
    id: "code",
    label: "Code block",
    description: "Insert a fenced code block",
    icon: Code2,
    keywords: ["code", "snippet"],
    run: () => actions.insertBlock("```\n\n```"),
  },
  {
    id: "link",
    label: "Link",
    description: "Insert a markdown link",
    icon: Link2,
    keywords: ["link", "url"],
    run: () => actions.insertBlock("[label](https://example.com)"),
  },
  {
    id: "metadata",
    label: "Article details",
    description: "Edit title, author, and dek",
    icon: FilePenLine,
    keywords: ["meta", "details", "title", "author"],
    run: () => actions.openMetadata(),
  },
];

export function ArticleEditorWorkspace() {
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [token, setToken] = React.useState<string>("");
  const [table, setTable] = React.useState<"dod" | "casefiles" | "signals">(
    "dod",
  );
  const [draft, setDraft] = React.useState<EditorRow>(DEFAULT_ROW);
  const [serverStatus, setServerStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [localStatus, setLocalStatus] = React.useState<
    "idle" | "dirty" | "saved"
  >("idle");
  const [metadataOpen, setMetadataOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteQuery, setPaletteQuery] = React.useState("");
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [slashActiveIndex, setSlashActiveIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState<
    string | null
  >(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const localSaveTimerRef = React.useRef<number | null>(null);
  const broadcastRef = React.useRef<BroadcastChannel | null>(null);
  const historyRef = React.useRef<{
    past: EditorRow[];
    future: EditorRow[];
  }>({ past: [], future: [] });

  const wordMetrics = React.useMemo(
    () => getWordMetrics(draft.content),
    [draft.content],
  );
  const publishedAt = draft.modified_at || draft.created_at || null;
  const draftKey = React.useMemo(
    () => (draftId ? makeDraftKey(draftId) : null),
    [draftId],
  );

  const categoryList = React.useMemo(
    () => normalizeCategories(draft.category),
    [draft.category],
  );

  const requiredFields = React.useMemo(() => {
    const title = draft.title.trim();
    const author = draft.author.trim();
    return {
      title,
      author,
      isValid: Boolean(title && author),
    };
  }, [draft.author, draft.title]);

  const syncDraftToStorage = React.useCallback(
    (nextDraft: EditorRow) => {
      if (!draftKey) return;
      const payload: EditorPayload = {
        token,
        table,
        row: nextDraft,
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setLocalStatus("saved");
    },
    [draftKey, table, token],
  );

  const queueLocalDraftSync = React.useCallback(
    (nextDraft: EditorRow) => {
      if (localSaveTimerRef.current) {
        window.clearTimeout(localSaveTimerRef.current);
      }
      localSaveTimerRef.current = window.setTimeout(() => {
        syncDraftToStorage(nextDraft);
      }, 450);
    },
    [syncDraftToStorage],
  );

  const updateDraft = React.useCallback(
    (
      updater: EditorRow | ((current: EditorRow) => EditorRow),
      options?: { recordHistory?: boolean },
    ) => {
      setDraft((current) => {
        const nextDraft =
          typeof updater === "function" ? updater(current) : updater;
        if (
          options?.recordHistory !== false &&
          !isSameDraft(current, nextDraft)
        ) {
          const history = historyRef.current;
          history.past.push(current);
          if (history.past.length > 100) {
            history.past.shift();
          }
          history.future = [];
        }
        setLocalStatus("dirty");
        queueLocalDraftSync(nextDraft);
        return nextDraft;
      });
    },
    [queueLocalDraftSync],
  );

  const undoDraft = React.useCallback(() => {
    setDraft((current) => {
      const history = historyRef.current;
      const previous = history.past.pop();
      if (!previous) return current;
      history.future.push(current);
      setLocalStatus("dirty");
      queueLocalDraftSync(previous);
      return previous;
    });
  }, [queueLocalDraftSync]);

  const redoDraft = React.useCallback(() => {
    setDraft((current) => {
      const history = historyRef.current;
      const nextDraft = history.future.pop();
      if (!nextDraft) return current;
      history.past.push(current);
      setLocalStatus("dirty");
      queueLocalDraftSync(nextDraft);
      return nextDraft;
    });
  }, [queueLocalDraftSync]);

  React.useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const incomingDraftId = params.get("draft") ?? "default";
    setDraftId(incomingDraftId);
    const bootKey = makeBootKey(incomingDraftId);
    const fromBoot = readJson<EditorPayload>(localStorage.getItem(bootKey));
    const fromDraft = readJson<EditorPayload>(
      localStorage.getItem(makeDraftKey(incomingDraftId)),
    );
    const payload = fromBoot ?? fromDraft;
    if (payload) {
      setToken(typeof payload.token === "string" ? payload.token : "");
      setTable(payload.table ?? "dod");
      setDraft(normalizeRow(payload.row));
      setLocalStatus("saved");
      if (fromBoot) {
        localStorage.removeItem(bootKey);
      }
    } else {
      setDraft(DEFAULT_ROW);
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    broadcastRef.current = channel;
    channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "admin:refresh") {
        // noop in editor; the opener reacts to this channel too.
      }
    };

    return () => {
      channel.close();
      if (localSaveTimerRef.current) {
        window.clearTimeout(localSaveTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const onBeforeUnload = () => {
      if (!draftKey) return;
      localStorage.setItem(
        draftKey,
        JSON.stringify({ token, table, row: draft } satisfies EditorPayload),
      );
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [draft, draftKey, table, token]);

  const focusEditor = React.useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const openMetadata = React.useCallback(() => {
    setMetadataOpen(true);
  }, []);

  const wrapSelection = React.useCallback(
    (before: string, after = before) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const value = textarea.value;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? start;
      const selected = value.slice(start, end) || "selected text";
      const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
      updateDraft({ ...draft, content: nextValue });
      requestAnimationFrame(() => {
        textarea.focus();
        const nextStart = start + before.length;
        const nextEnd = nextStart + selected.length;
        textarea.setSelectionRange(nextStart, nextEnd);
      });
    },
    [draft, updateDraft],
  );

  const insertBlock = React.useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const value = textarea.value;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? start;
      const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
      updateDraft({ ...draft, content: nextValue });
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      });
    },
    [draft, updateDraft],
  );

  const replaceCurrentLine = React.useCallback(
    (transform: (line: string) => string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const value = textarea.value;
      const cursor = textarea.selectionStart ?? 0;
      const info = getLineInfo(value, cursor);
      const nextLine = transform(info.line);
      const nextValue = `${value.slice(0, info.lineStart)}${nextLine}${value.slice(info.lineEnd)}`;
      updateDraft({ ...draft, content: nextValue });
      requestAnimationFrame(() => {
        textarea.focus();
        const nextCursor = info.lineStart + nextLine.length;
        textarea.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [draft, updateDraft],
  );

  const applyCommand = React.useCallback(
    (command: CommandItem) => {
      const closeCommandMenus = () => {
        setPaletteOpen(false);
        setSlashOpen(false);
        setSlashActiveIndex(0);
      };
      const textarea = textareaRef.current;
      if (textarea) {
        const cursor = textarea.selectionStart ?? 0;
        const info = getLineInfo(textarea.value, cursor);
        const match = info.line.match(/^\/\S*/);
        if (match) {
          const token = match[0];
          const removalStart = info.lineStart;
          const removalEnd = info.lineStart + token.length;
          const nextValue = `${textarea.value.slice(0, removalStart)}${textarea.value.slice(removalEnd)}`;
          updateDraft({ ...draft, content: nextValue });
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(removalStart, removalStart);
            command.run({
              wrapSelection,
              insertBlock,
              replaceCurrentLine,
              focusEditor,
              openMetadata,
            });
          });
          closeCommandMenus();
          return;
        }
      }

      command.run({
        wrapSelection,
        insertBlock,
        replaceCurrentLine,
        focusEditor,
        openMetadata,
      });
      closeCommandMenus();
    },
    [
      focusEditor,
      insertBlock,
      openMetadata,
      replaceCurrentLine,
      wrapSelection,
      draft,
      updateDraft,
    ],
  );

  const commands = React.useMemo(
    () =>
      editorCommands({
        wrapSelection,
        insertBlock,
        replaceCurrentLine,
        focusEditor,
        openMetadata,
      }),
    [focusEditor, insertBlock, openMetadata, replaceCurrentLine, wrapSelection],
  );

  const filteredCommands = React.useMemo(() => {
    const query = paletteQuery.trim().toLowerCase();
    if (!query) return commands;
    return commands.filter((command) => {
      const haystack = [command.label, command.description, ...command.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [commands, paletteQuery]);

  const slashCommands = React.useMemo(() => commands.slice(0, 6), [commands]);
  const activeSlashIndex = React.useMemo(() => {
    if (slashCommands.length === 0) return 0;
    return Math.min(slashActiveIndex, slashCommands.length - 1);
  }, [slashActiveIndex, slashCommands.length]);

  const syncSlashToolbarState = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart ?? 0;
    const info = getLineInfo(textarea.value, cursor);
    const isSlashCommand = /^\/\S*/.test(info.line);
    if (!isSlashCommand) {
      setSlashOpen(false);
      setSlashActiveIndex(0);
      return;
    }
    setSlashOpen(true);
  }, []);

  const handleMarkdownShortcuts = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (event.key === "Enter" && !event.shiftKey) {
        const cursor = textarea.selectionStart ?? 0;
        const info = getLineInfo(textarea.value, cursor);
        const listMatch = info.line.match(
          /^(\s*)(?:[-*+]\s+|\d+\.\s+|>\s+|-\s\[\s?\]\s+)/,
        );
        if (listMatch) {
          event.preventDefault();
          const prefix = listMatch[0];
          const content = info.line.slice(prefix.length);
          const nextPrefix = content.trim().length === 0 ? "" : prefix;
          const insertion = nextPrefix ? `\n${nextPrefix}` : "\n";
          const nextValue = `${textarea.value.slice(0, cursor)}${insertion}${textarea.value.slice(cursor)}`;
          updateDraft((current) => ({
            ...current,
            content: nextValue,
          }));
          requestAnimationFrame(() => {
            const nextCursor = cursor + insertion.length;
            textarea.setSelectionRange(nextCursor, nextCursor);
          });
        }
      }

      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        const cursor = textarea.selectionStart ?? 0;
        const info = getLineInfo(textarea.value, cursor);
        if (info.line.trim().length === 0) {
          window.setTimeout(() => setSlashOpen(true), 0);
        }
      }

      if (slashOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSlashActiveIndex((current) =>
            slashCommands.length === 0
              ? 0
              : (current + 1) % slashCommands.length,
          );
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSlashActiveIndex((current) =>
            slashCommands.length === 0
              ? 0
              : (current - 1 + slashCommands.length) % slashCommands.length,
          );
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          const command = slashCommands[activeSlashIndex];
          if (command) {
            event.preventDefault();
            applyCommand(command);
          }
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setSlashOpen(false);
          setSlashActiveIndex(0);
        }
      }
    },
    [activeSlashIndex, applyCommand, slashCommands, slashOpen, updateDraft],
  );

  const handleTextareaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateDraft((current) => ({
        ...current,
        content: event.target.value,
      }));
      syncSlashToolbarState();
    },
    [syncSlashToolbarState, updateDraft],
  );

  const handleDrop = React.useCallback(
    async (event: React.DragEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        const text = await file.text();
        insertBlock(`\n${text}\n`);
        return;
      }
      const text = event.dataTransfer.getData("text/plain");
      if (text) insertBlock(text);
    },
    [insertBlock],
  );

  const saveArticle = React.useCallback(async () => {
    if (!token) {
      setServerStatus("error");
      setValidationMessage("Sign in before saving.");
      return;
    }
    if (!requiredFields.isValid) {
      setServerStatus("error");
      setValidationMessage("Title and author are required before saving.");
      return;
    }
    setValidationMessage(null);
    setServerStatus("saving");
    try {
      const rowToSend: Record<string, unknown> = {
        ...draft,
        category: parseCategoryInput(draft.category),
      };
      const body = draft.uuid
        ? { table, uuid: draft.uuid, row: rowToSend }
        : { table, row: rowToSend };
      const method = draft.uuid ? "PUT" : "POST";
      const res = await fetch("/api/admin/data", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setServerStatus("error");
        return;
      }
      const json = await res.json().catch(() => null);
      const firstRow = Array.isArray(json?.data) ? json.data[0] : null;
      if (firstRow) {
        const normalized = normalizeRow(firstRow);
        setDraft(normalized);
        if (draftKey) {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              token,
              table,
              row: normalized,
            } satisfies EditorPayload),
          );
        }
      }
      setServerStatus("saved");
      setLocalStatus("saved");
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: "admin:refresh", table });
      }
    } catch {
      setServerStatus("error");
    }
  }, [draft, draftKey, requiredFields.isValid, table, token]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (meta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoDraft();
        } else {
          undoDraft();
        }
        return;
      }
      if (meta && key === "y") {
        event.preventDefault();
        redoDraft();
        return;
      }
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveArticle();
      }
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setSlashOpen(false);
        setMetadataOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redoDraft, saveArticle, undoDraft]);

  const statusLabel =
    serverStatus === "saving"
      ? "Saving to server"
      : serverStatus === "saved"
        ? "Synced"
        : serverStatus === "error"
          ? "Save failed"
          : localStatus === "dirty"
            ? "Draft editing"
            : localStatus === "saved"
              ? "Draft saved locally"
              : "Ready";

  function handleMetadataUpdate(patch: Partial<EditorRow>) {
    if (validationMessage) setValidationMessage(null);
    updateDraft({ ...draft, ...patch });
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/60">
          Loading workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_26%),linear-gradient(180deg,#070707_0%,#050505_100%)] text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <FilePenLine className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.45em] text-white/45">
                <span>{table.toUpperCase()}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Markdown workspace</span>
              </div>
              <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
                {draft.title || "Untitled article"}
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em]",
                serverStatus === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : serverStatus === "saving"
                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                    : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
              )}
            >
              {statusLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-white/55">
              {wordMetrics.wordCount} words
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Command className="size-4" />
              Command palette
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMetadataOpen(true)}
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Settings2 className="size-4" />
              Details
            </Button>
            <Button
              onClick={saveArticle}
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              <Save className="size-4" />
              Save
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Command className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveArticle}
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Save className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-400 gap-5 px-3 py-4 lg:px-6">
        <main className="relative h-[calc(100vh-110px)] min-h-168 overflow-hidden">
          <div className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#0a0a0a] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="grid h-full min-h-0 gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <section className="relative flex min-h-0 flex-col border-white/10 lg:border-r">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/45">
                  <span>Draft</span>
                  <span>{draft.title || "Untitled article"}</span>
                </div>
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/3 px-4 py-3">
                    <ToolbarButton
                      icon={Bold}
                      label="Bold"
                      onClick={() => wrapSelection("**")}
                    />
                    <ToolbarButton
                      icon={Italic}
                      label="Italic"
                      onClick={() => wrapSelection("*")}
                    />
                    <ToolbarButton
                      icon={Link2}
                      label="Link"
                      onClick={() =>
                        wrapSelection("[", "](https://example.com)")
                      }
                    />
                    <ToolbarButton
                      icon={Code2}
                      label="Code"
                      onClick={() => wrapSelection("`")}
                    />
                    <ToolbarButton
                      icon={Hash}
                      label="H1"
                      onClick={() =>
                        replaceCurrentLine(
                          (line) => `# ${line.replace(/^#+\s*/, "")}`,
                        )
                      }
                    />
                    <ToolbarButton
                      icon={List}
                      label="List"
                      onClick={() =>
                        replaceCurrentLine(
                          (line) => `- ${line.replace(/^[-*+]\s*/, "")}`,
                        )
                      }
                    />
                  </div>

                  <Textarea
                    ref={textareaRef}
                    value={draft.content}
                    onChange={handleTextareaChange}
                    onKeyDown={handleMarkdownShortcuts}
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    spellCheck={false}
                    className={cn(
                      "flex-1 min-h-0 resize-none rounded-none border-0 bg-transparent px-6 py-7 font-mono text-[16px] leading-8 text-white outline-none placeholder:text-white/25 focus-visible:ring-0",
                      "selection:bg-white selection:text-black",
                    )}
                    placeholder={`Write in markdown. Try:\n\n# Heading\n\n## Section\n- List item\n> Quote\n\nUse / for commands.`}
                  />
                </div>

                <div className="border-t border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/40">
                  <div className="flex items-center gap-3">
                    <span>
                      {localStatus === "dirty"
                        ? "Unsaved changes"
                        : "Draft synced locally"}
                    </span>
                    <span>•</span>
                    <span>
                      {serverStatus === "saving"
                        ? "Saving server copy"
                        : serverStatus === "saved"
                          ? "Server synced"
                          : serverStatus === "error"
                            ? "Server error"
                            : "Server idle"}
                    </span>
                  </div>
                  <div>
                    {draft.uuid ? "Editing existing article" : "New article"}
                  </div>
                </div>
              </section>

              <aside className="hidden min-h-0 rounded-4xl border border-white/10 bg-white/4 lg:flex lg:flex-col lg:overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/45">
                  <span>Preview</span>
                  <span>{wordMetrics.readingMinutes} min read</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      {(categoryList && categoryList.length > 0
                        ? categoryList
                        : []
                      ).map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/65"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-4 border-b border-white/10 pb-6">
                      <h2 className="text-balance text-4xl font-semibold tracking-tight text-white">
                        {draft.title || "Untitled article"}
                      </h2>
                      {(draft.author || publishedAt) && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
                          {draft.author ? <span>By {draft.author}</span> : null}
                          {publishedAt ? (
                            <span>
                              {new Date(publishedAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <ArticleMarkdown content={draft.content} />
                  </div>
                </div>
              </aside>
            </div>

            <AnimatePresence>
              {slashOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  className="absolute left-4 top-20 z-30 w-[min(92vw,440px)] rounded-3xl border border-white/10 bg-black/95 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                >
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/60">
                    <Sparkles className="size-4" />
                    <span className="text-xs uppercase tracking-[0.35em]">
                      Slash commands
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {slashCommands.map((command, index) => (
                      <button
                        key={command.id}
                        type="button"
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                          index === activeSlashIndex
                            ? "border-white/25 bg-white/12"
                            : "border-white/10 bg-white/3 hover:bg-white/10",
                        )}
                        onMouseEnter={() => setSlashActiveIndex(index)}
                        onClick={() => applyCommand(command)}
                      >
                        <command.icon className="size-4 text-white/70" />
                        <span>
                          <span className="block text-sm font-medium text-white">
                            {command.label}
                          </span>
                          <span className="block text-xs text-white/45">
                            {command.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Dialog open={metadataOpen} onOpenChange={setMetadataOpen}>
        <DialogContent className="sm:max-w-2xl border-white/10 bg-[#090909] text-white">
          <DialogHeader>
            <DialogTitle>Article details</DialogTitle>
            <DialogDescription className="text-white/50">
              Edit the metadata that drives the public article and live preview.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="editor-title" className="text-white/65">
                Title
              </Label>
              <Input
                id="editor-title"
                value={draft.title}
                onChange={(event) =>
                  handleMetadataUpdate({ title: event.target.value })
                }
                aria-invalid={
                  Boolean(validationMessage) && !requiredFields.title
                }
                className="border-white/10 bg-white/5 text-white"
                placeholder="Enter a title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editor-author" className="text-white/65">
                Author
              </Label>
              <Input
                id="editor-author"
                value={draft.author}
                onChange={(event) =>
                  handleMetadataUpdate({ author: event.target.value })
                }
                aria-invalid={
                  Boolean(validationMessage) && !requiredFields.author
                }
                className="border-white/10 bg-white/5 text-white"
                placeholder="Enter an author name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editor-category" className="text-white/65">
                Categories
              </Label>
              <Input
                id="editor-category"
                value={draft.category}
                onChange={(event) =>
                  handleMetadataUpdate({ category: event.target.value })
                }
                className="border-white/10 bg-white/5 text-white"
                placeholder="news, analysis, archive"
              />
            </div>
          </div>

          {validationMessage ? (
            <p className="text-sm text-red-200">{validationMessage}</p>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMetadataOpen(false)}
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              onClick={() => setMetadataOpen(false)}
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent className="sm:max-w-3xl border-white/10 bg-[#090909] text-white">
          <DialogHeader>
            <DialogTitle>Command palette</DialogTitle>
            <DialogDescription className="text-white/50">
              Insert document blocks, open metadata, or jump to common markdown
              actions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/60">
              <input
                value={paletteQuery}
                onChange={(event) => setPaletteQuery(event.target.value)}
                placeholder="Search commands..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
            <div className="max-h-[48vh] overflow-y-auto pr-1">
              <div className="grid gap-2">
                {filteredCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onClick={() => applyCommand(command)}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-left transition hover:bg-white/10"
                    >
                      <Icon className="size-4 text-white/70" />
                      <span>
                        <span className="block text-sm font-medium text-white">
                          {command.label}
                        </span>
                        <span className="block text-xs text-white/45">
                          {command.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
    >
      <Icon className="size-4" />
      {label}
    </Button>
  );
}
