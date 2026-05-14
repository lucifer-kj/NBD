import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import crypto from "crypto";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";

export async function POST(req: NextRequest) {
  const qstash = new Client({
    token: process.env.QSTASH_TOKEN!,
  });

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  try {
    const rawBody = await req.text();
    const hmac = req.headers.get("x-shopify-hmac-sha256");
    const topic = req.headers.get("x-shopify-topic");
    const webhookId = req.headers.get("x-shopify-webhook-id");

    if (!hmac || !topic || !webhookId) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    // 1. Validate HMAC
    const genHash = crypto
      .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
      .update(rawBody, "utf8")
      .digest("base64");

    if (genHash !== hmac) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Check Idempotency (Redis)
    const idempotencyKey = `webhook:${webhookId}`;
    const exists = await redis.set(idempotencyKey, "processed", {
      nx: true,
      ex: 604800, // 7 days TTL
    });

    if (!exists) {
      console.log(`Duplicate webhook ignored: ${webhookId}`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 3. Enqueue to QStash
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/worker`,
      body: {
        topic,
        payload: JSON.parse(rawBody),
      },
      headers: {
        "x-shopify-topic": topic,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook ingestion error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
