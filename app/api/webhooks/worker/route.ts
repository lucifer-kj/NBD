import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { Receiver } from "@upstash/qstash";
import { revalidateTag, revalidatePath } from "next/cache";
import { Redis } from "@upstash/redis";

async function handler(req: NextRequest) {
  try {
    const redis = Redis.fromEnv();
    const { topic, payload } = await req.json();
    const updatedAt = payload.updated_at || payload.processed_at || new Date().toISOString();
    const resourceId = payload.id || "global";

    console.log(`Processing webhook topic: ${topic} for resource: ${resourceId}`);

    // 0. Race Condition Check: Ensure we don't process an older update than what we've already seen
    const redisKey = `webhook:last_updated:${topic}:${resourceId}`;
    const lastProcessed = await redis.get<string>(redisKey);

    if (lastProcessed && new Date(updatedAt) <= new Date(lastProcessed)) {
      console.log(`Skipping stale webhook: ${updatedAt} <= ${lastProcessed}`);
      return NextResponse.json({ processed: false, reason: "stale" });
    }

    // Update the last processed timestamp
    await redis.set(redisKey, updatedAt, { ex: 604800 }); // 7-day TTL

    // 1. Handle Product Updates
    if (topic.startsWith("products/")) {
      const productId = payload.id;
      const handle = payload.handle;
      let productHandle = handle;

      try {
        if (topic === "products/delete") {
          const storedHandle = await redis.get<string>(`product:id_to_handle:${productId}`);
          if (storedHandle) {
            productHandle = storedHandle;
            await redis.del(`product:id_to_handle:${productId}`);
          }
        } else if (productId && handle) {
          // Store/update the mapping with 30 days TTL
          await redis.set(`product:id_to_handle:${productId}`, handle, { ex: 2592000 });
        }
      } catch (redisError) {
        console.error("Redis ID-to-handle mapping failed in worker:", redisError);
      }

      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/products");
      
      if (productHandle) {
        revalidateTag(`product-${productHandle}`);
        revalidatePath(`/products/${productHandle}`);
      }
    }

    // 2. Handle Collection Updates
    if (topic.startsWith("collections/")) {
      revalidateTag("collections");
      revalidatePath("/collections");
    }

    // 3. Handle Inventory Updates
    if (topic === "inventory_levels/update") {
      revalidateTag("products");
    }

    // 4. Handle Articles/Blogs
    if (topic.startsWith("articles/") || topic.startsWith("blogs/")) {
      revalidateTag("articles");
      revalidatePath("/blog");
    }

    // 5. Handle Manual/Scheduled Reconciliation
    if (topic === "reconciliation/run") {
      console.log("Running inventory reconciliation...");
      revalidateTag("products");
      revalidateTag("collections");
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ processed: true });
  } catch (error) {
    console.error("Worker processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Lazily verify signature to avoid build-time errors
  const signature = req.headers.get("upstash-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  const body = await req.text();
  const isValid = await receiver.verify({
    signature,
    body,
  }).catch(() => false);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Clone the request for the handler since we consumed the body
  const newReq = new NextRequest(req.url, {
    method: req.method,
    headers: req.headers,
    body: body,
  });

  return handler(newReq);
}
