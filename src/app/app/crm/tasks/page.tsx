"use client";

import { useCallback, useEffect, useState } from "react";
import {
  OWNERS,
  type DealRecord,
  type TaskRecord,
  apiSend,
  shortDate,
} from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const COLUMNS = [
  { key: "todo", label: "To do", color: "#64748b" },
  { key: "in_progress", label: "In progress", color: "#1f93ef" },
  { key: "completed", label: "Completed", color: "#10b981" },
] as const;

type Status = (typeof COLUMNS)[number]["key"];

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-coral-400/12 text-coral-400",
  medium: "bg-sun-400/15 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

type FormState = {
  title: string;
  description: string;
  status: Status;
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
  dealId: string;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: OWNERS[0],
  dueDate: "",
  dealId: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, dealRes] = await Promise.all([
        fetch("/api/crm/tasks", { cache: "no-store" }),
        fetch("/api/crm/deals", { cache: "no-store" }),
      ]);
      const [taskData, dealData] = (await Promise.all([
        taskRes.json(),
        dealRes.json(),
      ])) as { data: unknown }[];
      setTasks((taskData.data ?? []) as TaskRecord[]);
      setDeals((dealData.data ?? []) as DealRecord[]);
      setError("");
    } catch {
      setError("Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = tasks.filter(
    (task) => assigneeFilter === "all" || task.assignee === assigneeFilter,
  );

  const dealTitleById = new Map(deals.map((deal) => [deal.id, deal.title]));

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiSend("/api/crm/tasks", "POST", {
        ...form,
        dealId: form.dealId ? Number(form.dealId) : null,
        dueDate: form.dueDate || null,
      });
      setForm(EMPTY);
      setModal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: number, status: Status) {
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
    try {
      await apiSend(`/api/crm/tasks/${id}`, "PATCH", { status });
    } catch {
      setTasks(previous);
      setError("Could not update that task.");
    }
  }

  async function remove(id: number) {
    await apiSend(`/api/crm/tasks/${id}`, "DELETE");
    await load();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Work · Tasks & Projects
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.filter((task) => task.status !== "completed").length} open ·{" "}
            {tasks.filter((task) => task.status === "completed").length} completed
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
          >
            <option value="all">Everyone</option>
            {OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            + New task
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}

      <div className="kanban-scroll mt-7 overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = visible.filter((task) => task.status === column.key);
            return (
              <div
                key={column.key}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(column.key);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => {
                  setDragOver(null);
                  if (dragId) void setStatus(dragId, column.key);
                  setDragId(null);
                }}
                className={`w-80 shrink-0 rounded-2xl border p-3 transition ${
                  dragOver === column.key
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-brand-950">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    {column.label}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {columnTasks.map((task) => {
                    const overdue =
                      task.status !== "completed" &&
                      (task.dueDate ?? "9999") < today;
                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={() => setDragId(task.id)}
                        onDragEnd={() => setDragId(null)}
                        className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-brand-300 ${
                          dragId === task.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-bold leading-snug ${
                              task.status === "completed"
                                ? "text-slate-400 line-through"
                                : "text-brand-950"
                            }`}
                          >
                            {task.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => void remove(task.id)}
                            className="rounded p-1 text-slate-300 transition hover:text-coral-400"
                            aria-label="Delete task"
                          >
                            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                        {task.description && (
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                            {task.description}
                          </p>
                        )}
                        {task.dealId && (
                          <p className="mt-2 truncate rounded-md bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-600">
                            {dealTitleById.get(task.dealId) ?? "Linked deal"}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                              PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              overdue ? "text-coral-400" : "text-slate-500"
                            }`}
                          >
                            {shortDate(task.dueDate)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {task.assignee.split(" ")[0]}
                          </span>
                        </div>
                      </article>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs font-semibold text-slate-400">
                      Nothing here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 sm:p-8">
          <form
            onSubmit={submit}
            className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-extrabold text-brand-950">New task</h2>
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={LABEL}>Task title *</span>
                <input
                  required
                  className={FIELD}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="Send the revised proposal"
                />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL}>Description</span>
                <textarea
                  rows={3}
                  className={FIELD}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Status</span>
                <select
                  className={FIELD}
                  value={form.status}
                  onChange={(event) => update("status", event.target.value as Status)}
                >
                  {COLUMNS.map((column) => (
                    <option key={column.key} value={column.key}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Priority</span>
                <select
                  className={FIELD}
                  value={form.priority}
                  onChange={(event) =>
                    update("priority", event.target.value as FormState["priority"])
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                <span className={LABEL}>Assignee</span>
                <select
                  className={FIELD}
                  value={form.assignee}
                  onChange={(event) => update("assignee", event.target.value)}
                >
                  {OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Due date</span>
                <input
                  type="date"
                  className={FIELD}
                  value={form.dueDate}
                  onChange={(event) => update("dueDate", event.target.value)}
                />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL}>Linked deal</span>
                <select
                  className={FIELD}
                  value={form.dealId}
                  onChange={(event) => update("dealId", event.target.value)}
                >
                  <option value="">— none —</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create task"}
              </button>
              <button
                type="button"
                onClick={() => setModal(false)}
                className="ml-auto text-sm font-semibold text-slate-500 hover:text-brand-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
