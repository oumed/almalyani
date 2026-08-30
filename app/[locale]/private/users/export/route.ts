import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

const COLUMNS = ["email", "firstName", "lastName", "phone", "cin", "userType", "status"] as const;

// Neutralize CSV formula injection: a field starting with =, +, -, @, tab,
// or CR is interpreted as a formula by Excel/Google Sheets/LibreOffice when
// the file is opened. These fields come from user-editable attributes
// (name, phone, CIN), so prefix with a single quote to force text -- the
// standard OWASP mitigation.
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvEscape(value: string): string {
  const safe = neutralizeFormula(value);
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
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
