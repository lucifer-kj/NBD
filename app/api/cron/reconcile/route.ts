import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    // 1. Validate Cron Secret
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Enqueue Reconciliation Task to QStash
    // This allows the cron to finish quickly while the worker handles the heavy sync
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/worker`,
      body: {
        topic: "reconciliation/run",
        payload: { triggeredAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ success: true, message: "Reconciliation enqueued" });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
