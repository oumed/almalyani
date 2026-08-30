"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contracts, payments, buildingPermits } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { defaultLocale, dictionaries, isLocale, type Locale } from "@/lib/i18n";

export type PaymentActionState = { error?: string };

const STATUSES = ["pending", "completed", "failed", "refunded"] as const;
const TYPES = ["contract_fee", "tax", "other"] as const;
const METHODS = ["bank_transfer", "cash", "check"] as const;

function localeFrom(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.userType !== "admin") return null;
  return user;
}

export async function addPayment(
  projectId: string,
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const locale = localeFrom(formData);
  const dict = dictionaries[locale];

  const admin = await requireAdmin();
  if (!admin) return { error: dict.paymentsSection.errorGeneric };

  const target = String(formData.get("target") ?? "");
  const [targetType, targetId] = target.split(":");
  const amount = Number(formData.get("amount") ?? 0) || 0;
  const paymentType = String(formData.get("paymentType") ?? "contract_fee");
  const method = String(formData.get("method") ?? "bank_transfer");

  if (
    !targetId ||
    (targetType !== "contract" && targetType !== "permit") ||
    !TYPES.includes(paymentType as (typeof TYPES)[number]) ||
    !METHODS.includes(method as (typeof METHODS)[number])
  ) {
    return { error: dict.paymentsSection.errorGeneric };
  }

  if (targetType === "contract") {
    const [contract] = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(and(eq(contracts.id, targetId), eq(contracts.projectId, projectId)))
      .limit(1);
    if (!contract) return { error: dict.paymentsSection.errorGeneric };
  } else {
    const [permit] = await db
      .select({ id: buildingPermits.id })
      .from(buildingPermits)
      .where(and(eq(buildingPermits.id, targetId), eq(buildingPermits.projectId, projectId)))
      .limit(1);
    if (!permit) return { error: dict.paymentsSection.errorGeneric };
  }

  try {
    await db.insert(payments).values({
      contractId: targetType === "contract" ? targetId : null,
      buildingPermitId: targetType === "permit" ? targetId : null,
      status: "pending",
      attributes: {
        amount,
        currency: "MAD",
        payment_type: paymentType,
        method,
        transaction_reference: "",
        paid_at: null,
        receipt_url: "",
      },
    });
  } catch {
    return { error: dict.paymentsSection.errorGeneric };
  }

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
  return {};
}

export async function updatePaymentStatus(
  paymentId: string,
  projectId: string,
  locale: Locale,
  formData: FormData
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db.update(payments).set({ status }).where(eq(payments.id, paymentId));

  revalidatePath(`/${locale}/private/projects/${projectId}/edit`);
}
