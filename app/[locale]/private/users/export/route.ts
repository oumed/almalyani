import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const COLUMNS = ["email", "firstName", "lastName", "phone", "cin", "userType", "status"] as const;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = request.nextUrl.searchParams.get("role");
  const validRole = role === "client" || role === "professional" || role === "admin" ? role : null;

  const rows = await db
    .select({
      email: users.email,
      userType: users.userType,
      status: users.status,
      attributes: users.attributes,
    })
    .from(users)
    .where(validRole ? eq(users.userType, validRole) : undefined)
    .orderBy(users.email);

  const lines = [COLUMNS.join(",")];
  for (const row of rows) {
    const attrs = row.attributes as { first_name?: string; last_name?: string; phone?: string; cin?: string };
    lines.push(
      [
        row.email,
        attrs.first_name ?? "",
        attrs.last_name ?? "",
        attrs.phone ?? "",
        attrs.cin ?? "",
        row.userType,
        row.status,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users.csv"`,
    },
  });
}
