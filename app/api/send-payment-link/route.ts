import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_prototype');

export async function POST(req: Request) {
  try {
    const { bookingId, customerEmail, customerName, title, price } = await req.json();

    // Use localhost in dev, or deployed URL in production
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const paymentLink = `${baseUrl}/checkout/${bookingId}`;

    if (!process.env.RESEND_API_KEY) {
      console.log('--- RESEND API KEY NOT FOUND ---');
      console.log(`[Simulation] Sending email to: ${customerEmail}`);
      console.log(`[Simulation] Payment Link: ${paymentLink}`);
      // Send a simulated success response if keys aren't added yet
      return NextResponse.json({ success: true, simulated: true, link: paymentLink });
    }

    const data = await resend.emails.send({
      from: 'Zanzibar Booking <onboarding@resend.dev>', // Use verified domain in prod
      to: customerEmail,
      subject: `Your Booking for ${title} is Approved! Complete Payment`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000;">Good news, ${customerName}!</h2>
          <p>Your booking request for <strong>${title}</strong> has been confirmed as available.</p>
          <p>Total Price: <strong>$${price}</strong></p>
          <p>Please complete your secure payment to finalize your reservation.</p>
          <div style="margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Pay Now Securely
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
