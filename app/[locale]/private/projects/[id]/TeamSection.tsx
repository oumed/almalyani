"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/i18n";
import { addTeamMember, setTeamMemberActive, type TeamActionState } from "./team-actions";

const ROLE_ORDER = [
  "architect",
  "bet_engineer",
  "rebar_controller",
  "topographer",
  "main_contractor",
] as const;

type Dict = {
  projectTeam: {
    title: string;
    tableName: string;
    tableRole: string;
    tableActive: string;
    active: string;
    inactive: string;
    remove: string;
    reactivate: string;
    addMemberTitle: string;
    memberLabel: string;
    roleLabel: string;
    roles: Record<(typeof ROLE_ORDER)[number], string>;
    addButton: string;
    addingButton: string;
    empty: string;
  };
};

export type TeamMemberRow = {
  id: string;
  role: string;
  isActive: boolean;
  userName: string | null;
  userEmail: string;
};

const initialState: TeamActionState = {};

export function TeamSection({
  locale,
  dict,
  projectId,
  members,
  users,
}: {
  locale: Locale;
  dict: Dict;
  projectId: string;
  members: TeamMemberRow[];
  users: { id: string; label: string }[];
}) {
  const t = dict.projectTeam;
  const boundAdd = addTeamMember.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAdd, initialState);

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">{t.title}</h2>

      {members.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="px-3 py-2 text-start">{t.tableName}</th>
                <th className="px-3 py-2 text-start">{t.tableRole}</th>
                <th className="px-3 py-2 text-start">{t.tableActive}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-foreground" dir="ltr">
                    {m.userName || m.userEmail}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {t.roles[m.role as (typeof ROLE_ORDER)[number]] ?? m.role}
                  </td>
                  <td className="px-3 py-2 text-muted">{m.isActive ? t.active : t.inactive}</td>
                  <td className="px-3 py-2 text-end">
                    <form action={setTeamMemberActive.bind(null, m.id, projectId, locale, !m.isActive)}>
                      <button type="submit" className="text-accent underline underline-offset-4 hover:text-foreground">
                        {m.isActive ? t.remove : t.reactivate}
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
          {t.memberLabel}
          <select
            name="userId"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t.roleLabel}
          <select
            name="role"
            required
            className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {t.roles[r]}
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
          disabled={pending}
          className="rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
        >
          {pending ? t.addingButton : t.addButton}
        </button>
      </form>
    </section>
  );
}
