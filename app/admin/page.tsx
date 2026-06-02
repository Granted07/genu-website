"use client";
import { Manrope, Playfair_Display } from "next/font/google";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type Row = {
  uuid?: string;
  created_at?: string;
  modified_at?: string | null;
  title?: string | null;
  author?: string;
  category?: unknown;
  content?: string;
  reading_time?: string | null;
};

type HallRow = {
  id?: string | number;
  uuid?: string;
  created_at?: string | null;
  title?: string | null;
  author?: string | null;
  file_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  public_url?: string | null;
};

const hasValidUuid = (row: Row): row is Row & { uuid: string } =>
  typeof row.uuid === "string" && row.uuid.trim().length > 0;

export default function AdminPage() {
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [token, setToken] = React.useState("");
  const [table, setTable] = React.useState<
    "dod" | "casefiles" | "signals" | "hall" | "workshops"
  >("dod");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [hallRows, setHallRows] = React.useState<HallRow[]>([]);
  const [hallForm, setHallForm] = React.useState<{
    title: string;
    author: string;
    file: File | null;
  }>({ title: "", author: "", file: null });
  const [hallStatus, setHallStatus] = React.useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [hallMessage, setHallMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300/60 focus:outline-none";

  const tableLabel: Record<typeof table, string> = {
    dod: "Daughters of Dissent",
    casefiles: "Case Files",
    signals: "Signals",
    hall: "Hall of Noise",
    workshops: "Workshops",
  };
  const activeLabel = tableLabel[table];
  const activeCount = table === "hall" ? hallRows.length : rows.length;
  const filteredRows = rows.filter(hasValidUuid);
  const filteredOutCount = rows.length - filteredRows.length;
  const filteredOutMessage =
    filteredOutCount === 1
      ? "1 entry was skipped because an ID is missing."
      : `${filteredOutCount} entries were skipped because IDs are missing.`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setStatus("ok");
        setToken(password);
        fetchTable(table, password);
      } else {
        setStatus("error");
      }
    } catch (_err) {
      setStatus("error");
    }
  }

  const fetchTable = React.useCallback(
    async (t: typeof table, tokenValue?: string) => {
      const auth = tokenValue || token;
      if (!auth) return;

      setLoading(true);

      if (t === "hall") {
        const res = await fetch("/api/admin/hall-of-noise", {
          headers: { Authorization: `Bearer ${auth}` },
        });
        if (res.ok) {
          const json = await res.json();
          setHallRows(json.data || []);
        }
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/data?table=${t}`, {
        headers: { Authorization: `Bearer ${auth}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRows(json.data || []);
      }
      setLoading(false);
    },
    [token],
  );

  const formatBytes = (value?: number | null) => {
    if (!value || Number.isNaN(value)) return "—";
    if (value < 1024) return `${value} B`;
    const units = ["KB", "MB", "GB"];
    let size = value / 1024;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
  };

  const resolveHallId = (row: HallRow) => {
    if (row.uuid) return row.uuid;
    if (row.id != null) return String(row.id);
    return row.file_path ?? "unknown";
  };

  const truncateWords = (text?: string | null, maxWords: number = 10) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > maxWords) {
      return `${words.slice(0, maxWords).join(" ")}...`;
    }
    return text;
  };

  async function deleteRow(uuid: string) {
    if (table === "hall") return;
    if (!confirm("Are you sure you want to delete this row?")) return;
    const res = await fetch(`/api/admin/data?table=${table}&uuid=${uuid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchTable(table);
  }

  async function handleHallUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setHallStatus("error");
      setHallMessage("Authenticate before uploading.");
      return;
    }
    if (!hallForm.file) {
      setHallStatus("error");
      setHallMessage("Select an audio file before uploading.");
      return;
    }

    setHallStatus("loading");
    setHallMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", hallForm.title.trim());
      formData.append("author", hallForm.author.trim());
      formData.append("file", hallForm.file);

      const res = await fetch("/api/admin/hall-of-noise", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setHallStatus("error");
        setHallMessage(json?.error || "Upload failed");
        return;
      }

      setHallStatus("ok");
      setHallMessage("Upload complete");
      setHallForm({ title: "", author: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTable("hall");
    } catch (err) {
      setHallStatus("error");
      setHallMessage(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleHallDelete(row: HallRow) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this audio?")) return;
    const params = new URLSearchParams();
    if (row.uuid) params.append("uuid", row.uuid);
    if (row.id != null) params.append("id", String(row.id));
    if (row.file_path) params.append("file_path", row.file_path);
    const query = params.toString();
    const res = await fetch(
      `/api/admin/hall-of-noise${query ? `?${query}` : ""}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.data) setHallRows(json.data);
      else await fetchTable("hall");
    }
  }

  React.useEffect(() => {
    if (status === "ok") fetchTable(table);
  }, [fetchTable, table, status]);

  const openAddDialog = () => {
    const row =
      table === "workshops"
        ? {
            title: "",
            author: "",
            content: "",
            category: "",
            number: "",
            location: "",
            summary: "",
          }
        : {
            title: "",
            author: "",
            content: "",
            category: "",
            number: "",
          };
    try {
      const draftId = crypto.randomUUID();
      localStorage.setItem(
        `genu-admin-editor:boot:${draftId}`,
        JSON.stringify({ token, table, row }),
      );
      window.open(`/admin/editor?draft=${draftId}`, "_blank");
    } catch (_err) {
      alert(
        "Unable to open the separate editor window. Please allow pop-ups and try again.",
      );
    }
  };


  const openEditDialog = (row: Row) => {
    const r = {
      ...row,
      category: Array.isArray(row.category)
        ? row.category.join(", ")
        : typeof row.category === "string"
          ? row.category
          : "",
    };
    try {
      const draftId = row.uuid || crypto.randomUUID();
      localStorage.setItem(
        `genu-admin-editor:boot:${draftId}`,
        JSON.stringify({ token, table, row: r }),
      );
      window.open(`/admin/editor?draft=${draftId}`, "_blank");
    } catch (_err) {
      alert(
        "Unable to open the separate editor window. Please allow pop-ups and try again.",
      );
    }
  };

  React.useEffect(() => {
    const channel = new BroadcastChannel("genu-admin-editor");
    channel.onmessage = (
      event: MessageEvent<{ type?: string; table?: typeof table }>,
    ) => {
      if (!event.data || event.data.type !== "admin:refresh") return;
      fetchTable(event.data.table || table);
    };
    return () => {
      channel.close();
    };
  }, [fetchTable, table]);

  return (
    <div
      className={`${manrope.className} min-h-screen bg-black text-white pt-27.5`}
    >
      {status !== "ok" ? (
        <div className="mx-auto mt-20 flex w-full max-w-lg flex-col gap-6 rounded-4xl border border-white/10 bg-white/5 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.55)] ">
          <div className="space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/50">
              Admin Console
            </p>
            <h1 className={`${playfair.className} text-3xl font-semibold`}>
              Access control
            </h1>
            <p className="text-sm text-white/65">
              Authenticate to manage entries, uploads, and publication content.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <Button
              type="submit"
              className="text-black font-bold w-full tracking-widest bg-white py-5 hover:bg-gray-200 rounded-3xl mt-10 transition-colors"
            >
              LOGIN
            </Button>
            {status === "error" && (
              <div className="text-sm text-red-300">Invalid password</div>
            )}
          </form>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/50">
                Admin Console
              </p>
              <h1 className={`${playfair.className} text-3xl font-semibold`}>
                Publishing control
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/50">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/70">
                  Active: {activeLabel}
                </span>
                <span>{activeCount} entries</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTable("dod");
                  fetchTable("dod");
                }}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === "dod" ? "border-amber-300 bg-amber-300/20 text-white" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                DOD
              </button>
              <button
                type="button"
                onClick={() => {
                  setTable("casefiles");
                  fetchTable("casefiles");
                }}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === "casefiles" ? "border-amber-300 bg-amber-300/20 text-white" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                Case Files
              </button>
              <button
                type="button"
                onClick={() => {
                  setTable("signals");
                  fetchTable("signals");
                }}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === "signals" ? "border-amber-300 bg-amber-300/20 text-white" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                Signals
              </button>
              <button
                type="button"
                onClick={() => {
                  setTable("hall");
                  fetchTable("hall");
                }}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === "hall" ? "border-amber-300 bg-amber-300/20 text-white" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                Hall of Noise
              </button>
              <button
                type="button"
                onClick={() => {
                  setTable("workshops");
                  fetchTable("workshops");
                }}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.4em] transition ${table === "workshops" ? "border-amber-300 bg-amber-300/20 text-white" : "border-white/15 text-white/60 hover:border-white/40"}`}
              >
                Workshops
              </button>
              {table !== "hall" && (
                <Button
                  onClick={openAddDialog}
                  className="rounded-full bg-white text-black hover:bg-gray-200"
                >
                  {table === "workshops"
                    ? "Add New Workshop"
                    : "Add New Article"}
                </Button>
              )}
            </div>
          </div>

          {table === "hall" ? (
            <div className="space-y-8">
              <form
                onSubmit={handleHallUpload}
                className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="grid gap-2">
                  <label
                    htmlFor="hall-title"
                    className="text-xs uppercase tracking-[0.4em] text-white/60"
                  >
                    Title
                  </label>
                  <input
                    id="hall-title"
                    className={inputClass}
                    value={hallForm.title}
                    onChange={(e) =>
                      setHallForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Newsletter title"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="hall-author"
                    className="text-xs uppercase tracking-[0.4em] text-white/60"
                  >
                    Author
                  </label>
                  <input
                    id="hall-author"
                    className={inputClass}
                    value={hallForm.author}
                    onChange={(e) =>
                      setHallForm((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    placeholder="Producer / host"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="hall-file"
                    className="text-xs uppercase tracking-[0.4em] text-white/60"
                  >
                    Audio file
                  </label>
                  <input
                    id="hall-file"
                    ref={fileInputRef}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                    type="file"
                    accept="audio/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] ?? null;
                      setHallForm((prev) => ({ ...prev, file }));
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={hallStatus === "loading"}>
                    {hallStatus === "loading" ? "Uploading…" : "Upload audio"}
                  </Button>
                  {hallMessage && (
                    <span
                      className={`text-sm ${hallStatus === "error" ? "text-red-300" : "text-emerald-300"}`}
                    >
                      {hallMessage}
                    </span>
                  )}
                  {hallStatus === "loading" && (
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Processing
                    </span>
                  )}
                </div>
              </form>

              <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">
                        Title
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">
                        Author
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">
                        File
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">
                        Uploaded
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hallRows.map((row) => {
                      const key = resolveHallId(row);
                      const link =
                        row.public_url ||
                        (row.file_path ? `/storage/${row.file_path}` : null);
                      return (
                        <TableRow
                          key={key}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="font-medium text-white/90">
                            {row.title ?? "Untitled"}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {row.author ?? "—"}
                          </TableCell>
                          <TableCell className="space-y-1">
                            <div className="text-sm text-white/90">
                              {row.file_name ?? row.file_path ?? "Unknown file"}
                            </div>
                            <div className="text-xs text-white/50">
                              {formatBytes(row.file_size)}
                              {row.mime_type ? ` • ${row.mime_type}` : ""}
                            </div>
                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-amber-200 underline"
                              >
                                Open file
                              </a>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-white/60">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              onClick={() => handleHallDelete(row)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {hallRows.length === 0 && (
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-sm text-white/50"
                        >
                          No uploads yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[20%]">
                      Title
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">
                      {table === "workshops" ? "Location" : "Author"}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[35%]">
                      Content
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">
                      Category
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.4em] text-white/50 w-[15%]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i} className="border-white/10">
                        <TableCell colSpan={5}>
                          <div className="h-6 w-full animate-pulse rounded-lg bg-white/5" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredRows.length === 0 ? (
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-white/50"
                      >
                        {filteredOutCount > 0
                          ? filteredOutMessage
                          : table === "workshops"
                            ? "No workshops found."
                            : "No entries found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow
                        key={row.uuid}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-semibold text-white/90 align-top">
                          {row.title}
                        </TableCell>
                        <TableCell className="text-white/70 align-top">
                          {row.author}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-white/80">
                            {truncateWords(row.content, 5)}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm text-white/60">
                            {Array.isArray(row.category)
                              ? row.category.join(", ")
                              : String(row.category || "")}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openEditDialog(row)}
                              className="bg-white text-black hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteRow(row.uuid)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
