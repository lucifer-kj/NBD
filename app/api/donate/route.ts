import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, name, email, phone } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid donation amount.' },
        { status: 400 }
      );
    }

    const amountInPaisa = Math.round(Number(amount) * 100);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay keys are not configured on the server.' },
        { status: 500 }
      );
    }

    // Call Razorpay API to create an order
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaisa,
        currency: 'INR',
        receipt: `receipt_donation_${Date.now()}`,
        notes: {
          name: name || 'Anonymous Donor',
          email: email || 'anonymous@naazbook.in',
          phone: phone || '',
          purpose: 'Donation - Sadqa-e-Jariyah'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Razorpay Order Creation Error]', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create order with Razorpay.' },
        { status: 500 }
      );
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: keyId
    });
  } catch (error) {
    console.error('[Donation API Error]', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while creating the donation order.' },
      { status: 500 }
    );
  }
}
