import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getToken } from 'next-auth/jwt';

function sha256(data: string | undefined): string | null {
  if (!data) return null;
  return crypto
    .createHash('sha256')
    .update(data.trim().toLowerCase())
    .digest('hex');
}

export async function POST(req: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return NextResponse.json({ success: false, error: 'Meta configuration missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, customData, userData: clientUserData } = body;

    // Decode session token if available to securely retrieve user email
    const token = await getToken({ req });
    const email = token?.email || clientUserData?.email;
    const phone = clientUserData?.phone;

    // Hash values for Meta Conversions API match key requirements
    const hashedEmail = sha256(email);
    const hashedPhone = sha256(phone);

    // Get client IP and User Agent securely on the server using client IP fallback chain
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      (req as NextRequest & { ip?: string }).ip ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Extract cookies for high event match quality
    const cookies = req.cookies;
    const fbp = cookies.get('_fbp')?.value;
    const fbc = cookies.get('_fbc')?.value;

    const payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: eventSourceUrl || req.nextUrl.origin,
      action_source: 'website',
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        em: hashedEmail ? [hashedEmail] : undefined,
        ph: hashedPhone ? [hashedPhone] : undefined,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
      },
      custom_data: customData || undefined,
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [payload],
        ...(process.env.META_TEST_EVENT_CODE && process.env.NODE_ENV !== 'production' && {
          test_event_code: process.env.META_TEST_EVENT_CODE
        })
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error response:', resData);
      return NextResponse.json({ success: false, error: resData.error || 'Meta API error' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: resData });
  } catch (error) {
    console.error('Meta CAPI internal error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
