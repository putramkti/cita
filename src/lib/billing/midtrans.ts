/**
 * Cita Billing — Midtrans Snap helper.
 *
 * Wraps the REST API for Snap (popup checkout). Intentionally minimal —
 * we only call /transactions and verify webhook signatures.
 *
 * Env vars required:
 *   MIDTRANS_SERVER_KEY      — secret, used for HTTP basic auth + signature
 *   MIDTRANS_CLIENT_KEY      — public, exposed to client SDK
 *   MIDTRANS_IS_PRODUCTION   — "true" to target prod; "false" or unset = sandbox
 *
 * If MIDTRANS_SERVER_KEY is empty / starts with "PLACEHOLDER",
 * `isMidtransConfigured()` returns false and the API routes return
 * 503 "Pembayaran sedang dipersiapkan" so we ship before keys land.
 */

import "server-only";
import * as crypto from "node:crypto";

const SANDBOX_BASE = "https://app.sandbox.midtrans.com/snap/v1";
const PROD_BASE = "https://app.midtrans.com/snap/v1";
const SANDBOX_API_BASE = "https://api.sandbox.midtrans.com/v2";
const PROD_API_BASE = "https://api.midtrans.com/v2";

export interface SnapTransactionParams {
  orderId: string;
  amountIdr: number;
  customerEmail: string;
  customerName: string | null;
  itemName: string; // shown in payment list
  callbackFinishUrl: string; // redirect after pay
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

/** Is Midtrans usable right now? */
export function isMidtransConfigured(): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  return Boolean(key) && !key.startsWith("PLACEHOLDER");
}

/** Returns true if hitting sandbox; false if production. */
export function isSandbox(): boolean {
  return (process.env.MIDTRANS_IS_PRODUCTION ?? "").toLowerCase() !== "true";
}

function snapBase(): string {
  return isSandbox() ? SANDBOX_BASE : PROD_BASE;
}

function authHeader(): string {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  // Midtrans uses HTTP Basic auth with serverKey + ":" (no password).
  const b64 = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${b64}`;
}

/**
 * Create a Snap transaction. Returns the snap token + redirect URL.
 * Throws on non-2xx response. Wrap calls with try/catch.
 */
export async function createSnapTransaction(
  params: SnapTransactionParams,
): Promise<SnapTransactionResult> {
  if (!isMidtransConfigured()) {
    throw new Error("midtrans_not_configured");
  }

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amountIdr,
    },
    item_details: [
      {
        id: "premium-monthly",
        name: params.itemName,
        price: params.amountIdr,
        quantity: 1,
      },
    ],
    customer_details: {
      first_name: params.customerName ?? "Cita User",
      email: params.customerEmail,
    },
    callbacks: {
      finish: params.callbackFinishUrl,
    },
    // Default 24-hour expiry is fine; let Midtrans clean up unpaid orders.
  };

  const res = await fetch(`${snapBase()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `midtrans_create_transaction_failed: HTTP ${res.status} ${text.slice(0, 300)}`,
    );
  }

  const json = (await res.json()) as {
    token: string;
    redirect_url: string;
  };
  return { token: json.token, redirectUrl: json.redirect_url };
}

/**
 * Verify Midtrans webhook signature.
 *
 * From docs:
 *   signature_key = sha512(order_id + status_code + gross_amount + server_key)
 *
 * Returns true if the signature in the payload matches.
 */
export function verifyWebhookSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  if (!key) return false;

  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${key}`;
  const computed = crypto.createHash("sha512").update(raw).digest("hex");
  // Constant-time compare to prevent timing attacks.
  if (computed.length !== payload.signature_key.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(payload.signature_key, "hex"),
  );
}

/**
 * Map Midtrans transaction_status + fraud_status → Cita PaymentStatus enum value.
 *
 *  Midtrans flow:
 *    pending → settlement (PAID) | deny | cancel | expire
 *    capture (cc only) → settlement | deny
 *    refund / partial_refund → REFUNDED
 *
 *  Reference: https://docs.midtrans.com/en/after-payment/http-notification
 */
export function midtransStatusToPaymentStatus(args: {
  transactionStatus: string;
  fraudStatus?: string;
}):
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "CANCELLED" {
  const ts = args.transactionStatus;
  const fs = args.fraudStatus;
  if (ts === "settlement") return "PAID";
  if (ts === "capture" && fs === "accept") return "PAID";
  if (ts === "capture" && fs === "challenge") return "PENDING";
  if (ts === "pending") return "PENDING";
  if (ts === "deny") return "FAILED";
  if (ts === "expire") return "EXPIRED";
  if (ts === "cancel") return "CANCELLED";
  if (ts === "refund" || ts === "partial_refund") return "REFUNDED";
  return "PENDING";
}

/** Get public Midtrans config to send to the client (Snap.js). */
export function getPublicMidtransConfig() {
  return {
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
    isSandbox: isSandbox(),
    snapJsUrl: isSandbox()
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js",
  };
}

/**
 * Fetch the current transaction status of a given order from Midtrans.
 *
 * Used by /admin/orders/[id] when we suspect a missed webhook (e.g.
 * notification URL not registered yet). Returns the raw JSON for audit.
 *
 * Returns null when the order isn't known to Midtrans (404).
 */
export interface MidtransStatusResponse {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  gross_amount: string;
  signature_key?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
  expiry_time?: string;
  [k: string]: unknown;
}

export async function fetchMidtransStatus(
  midtransOrderId: string,
): Promise<MidtransStatusResponse | null> {
  if (!isMidtransConfigured()) {
    throw new Error("midtrans_not_configured");
  }
  const apiBase = isSandbox() ? SANDBOX_API_BASE : PROD_API_BASE;
  const url = `${apiBase}/${encodeURIComponent(midtransOrderId)}/status`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `midtrans_status_failed: HTTP ${res.status} ${text.slice(0, 300)}`,
    );
  }

  return (await res.json()) as MidtransStatusResponse;
}
