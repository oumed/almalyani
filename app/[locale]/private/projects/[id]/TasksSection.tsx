"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addTask, updateTaskStatus, type TaskActionState } from "./task-actions";

const STATUS_ORDER = ["todo", "in_progress", "review", "done"] as const;

type Dict = {
  projectTasksSection: {
    title: string;
    tablePhase: string;
    tableTitle: string;
    tableAssignee: string;
    tableStatus: string;
    phaseLabel: string;
    titleLabel: string;
    assigneeLabel: string;
    unassigned: string;
    statusLabel: string;
    statuses: Record<(typeof STATUS_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    updateButton: string;
    empty: string;
  };
};

export type TaskRow = {
  id: string;
  phaseId: string;
  phaseName: string;
  title: string;
  status: string;
  assigneeName: string | null;
};

const initialState: TaskActionState = {};

export function TasksSection({
  locale,
  dict,
  projectId,
  tasks,
  phases,
  users,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  tasks: TaskRow[];
  phases: { id: string; name: string }[];
  users: { id: string; label: string }[];
}) {
  const t = dict.projectTasksSection;
  const boundAdd = addTask.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tablePhase}</th>
                <th className="px-3 py-2 text-start">{t.tableTitle}</th>
                <th className="px-3 py-2 text-start">{t.tableAssignee}</th>
                <th className="px-3 py-2 text-start">{t.tableStatus}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-muted">{task.phaseName}</td>
                  <td className="px-3 py-2 text-foreground">{task.title}</td>
                  <td className="px-3 py-2 text-muted">{task.assigneeName || t.unassigned}</td>
                  <td className="px-3 py-2 text-muted">
                    {t.statuses[task.status as (typeof STATUS_ORDER)[number]] ?? task.status}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <form
                      action={updateTaskStatus.bind(null, task.id, task.phaseId, locale)}
                      className="flex items-center justify-end gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={task.status}
                        className="rounded border border-line bg-transparent px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {t.statuses[s]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-accent underline underline-offset-4 hover:text-foreground">
                        {t.updateButton}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.phaseLabel}
          <select
            name="phaseId"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.titleLabel}
          <input
            type="text"
            name="title"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.assigneeLabel}
          <select
            name="assignedToId"
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">{t.unassigned}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-accent">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || phases.length === 0}
          className="rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
        >
          {pending ? t.addingButton : t.addButton}
        </button>
      </form>
    </section>
  );
}
