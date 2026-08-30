"use client";

import { useRouter } from "next/navigation";

export function RoleFilter({
  locale,
  role,
  label,
  allLabel,
  roles,
}: {
  locale: string;
  role: string;
  label: string;
  allLabel: string;
  roles: { client: string; professional: string; admin: string };
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {label}
      <select
        defaultValue={role}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `/${locale}/private/users?role=${value}` : `/${locale}/private/users`);
        }}
        className="rounded border border-line bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
      >
        <option value="">{allLabel}</option>
        <option value="client">{roles.client}</option>
        <option value="professional">{roles.professional}</option>
        <option value="admin">{roles.admin}</option>
      </select>
    </label>
  );
}
