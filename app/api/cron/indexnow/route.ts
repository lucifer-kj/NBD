import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    // 1. Optional auth verification if CRON_SECRET is set
    const authHeader = req.headers.get("Authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const host = "www.naazbook.in";
    const key = "9fcff651c9d445c78d6b33f383895514";
    const keyLocation = `https://${host}/${key}.txt`;

    const primaryPaths = [
      `https://${host}/`,
      `https://${host}/books`,
      `https://${host}/atar`,
      `https://${host}/products`,
      `https://${host}/blog`,
    ];

    let urlsToSubmit = [...primaryPaths];

    // 2. Fetch URLs dynamically from sitemap if possible
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${host}`;
    try {
      const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`, {
        next: { revalidate: 3600 },
      });
      if (sitemapRes.ok) {
        const xmlText = await sitemapRes.text();
        const matches = xmlText.match(/<loc>(https:\/\/[^<]+)<\/loc>/g);
        if (matches) {
          const sitemapUrls = matches.map(m => m.replace(/<\/?loc>/g, '').trim());
          // Merge with primary paths, ensuring uniqueness and correct host
          const allUrls = new Set([...primaryPaths, ...sitemapUrls]);
          // Filter to make sure URLs belong to the same host
          urlsToSubmit = Array.from(allUrls).filter(url => url.startsWith(`https://${host}`));
        }
      }
    } catch (sitemapError) {
      console.error("Failed to fetch/parse sitemap, using primary paths:", sitemapError);
    }

    // Limit IndexNow batch size to 10000 per the spec
    const finalUrls = urlsToSubmit.slice(0, 10000);

    const payload = {
      host,
      key,
      keyLocation,
      urlList: finalUrls,
    };

    // 3. Ping the IndexNow endpoints (Bing and Yandex for redundancy/maximum SEO)
    const endpoints = [
      "https://www.bing.com/indexnow",
      "https://yandex.com/indexnow"
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(payload),
          });

          return {
            endpoint,
            status: res.status,
            success: res.ok,
          };
        } catch (err) {
          return {
            endpoint,
            status: 500,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    );

    // Consider it a success if at least Bing succeeded (or any)
    const bingResult = results.find(r => r.endpoint.includes("bing.com"));
    const isSuccess = bingResult ? bingResult.success : results.some(r => r.success);

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess 
        ? "IndexNow ping successfully initiated" 
        : "Failed to ping IndexNow service",
      submittedUrlsCount: finalUrls.length,
      endpoints: results,
      urls: finalUrls,
    }, {
      status: isSuccess ? 200 : 500
    });
  } catch (error) {
    console.error("IndexNow cron failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    }, {
      status: 500
    });
  }
}
