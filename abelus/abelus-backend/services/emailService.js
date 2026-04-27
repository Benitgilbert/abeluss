import { Resend } from 'resend';

// Initialize Resend with API key (with fallback if not set)
let resend = null;

if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn('⚠️  RESEND_API_KEY not set. Email functionality will be disabled.');
}

export const sendOrderConfirmation = async (order) => {
    try {
        if (!resend) {
            console.warn('⚠️  Resend not configured. Skipping order confirmation email.');
            return;
        }

        const { data, error } = await resend.emails.send({
            from: 'Abelus <onboarding@resend.dev>',
            to: order.guestInfo?.email || order.customer?.email,
            subject: `Order Confirmation #${order.publicId} — Abelus`,
            html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ABELUS</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">Thank you for your order!</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                    Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'}, we've received your order <strong>#${order.publicId}</strong> and it's being processed. We'll notify you as soon as your items are on their way.
                </p>

                <!-- Order Info Card -->
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Summary</span>
                        <span style="color: #94a3b8; font-size: 12px;">${new Date().toLocaleDateString()}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 14px;">Total Amount</span>
                        <span style="color: #0f172a; font-size: 18px; font-weight: 800;">${order.totals.grandTotal.toLocaleString()} RWF</span>
                    </div>

                    <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0; font-style: italic;">
                        Payment Method: ${order.payment?.method || 'Standard'}
                    </p>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-top: 40px;">
                    <a href="https://abelus.vercel.app/orders/${order.publicId}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: background-color 0.2s;">
                        Track My Order
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Abelus Marketplace. All rights reserved.
                </p>
                <div style="margin-top: 16px;">
                    <a href="https://abelus.vercel.app" style="color: #6366f1; font-size: 12px; text-decoration: none; margin: 0 8px;">Website</a>
                    <a href="#" style="color: #6366f1; font-size: 12px; text-decoration: none; margin: 0 8px;">Support</a>
                </div>
            </div>
        </div>
      `,
        });

        if (error) {
            console.error("❌ Failed to send order confirmation:", error);
            return;
        }

        console.log("✅ Order Confirmation Sent:", data.id);
    } catch (error) {
        console.error("❌ Failed to send order confirmation:", error);
    }
};

export const sendStatusUpdate = async (order) => {
    try {
        if (!resend) {
            console.warn('⚠️  Resend not configured. Skipping status update email.');
            return;
        }

        const { data, error } = await resend.emails.send({
            from: 'Abelus <onboarding@resend.dev>',
            to: order.guestInfo?.email || order.customer?.email,
            subject: `Order Update #${order.publicId}`,
            html: `
        <h1>Order Update</h1>
        <p>Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'},</p>
        <p>Your order <strong>#${order.publicId}</strong> status has been updated to: <strong>${order.status.toUpperCase()}</strong>.</p>
      `,
        });

        if (error) {
            console.error("❌ Failed to send status update:", error);
            return;
        }

        console.log("✅ Status Update Email Sent:", data.id);
    } catch (error) {
        console.error("❌ Failed to send status update:", error);
    }
};

export const sendGiftCardEmail = async (giftCard, senderName) => {
    try {
        if (!resend) {
            console.warn('⚠️  Resend not configured. Skipping gift card delivery email.');
            return;
        }

        const { data, error } = await resend.emails.send({
            from: 'Abelus <onboarding@resend.dev>',
            to: giftCard.recipientEmail,
            subject: `You received a Gift Card from ${senderName}!`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white;">
            <h1 style="font-size: 32px; margin-bottom: 10px;">Surprise! 🎁</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">${senderName} has sent you an Abelus Gift Card.</p>
            
            <div style="background: rgba(255, 255, 255, 0.1); border: 2px dashed rgba(255, 255, 255, 0.5); padding: 30px; border-radius: 20px; margin: 40px 0;">
                <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 12px; margin: 0 0 10px 0; opacity: 0.8;">Your Gift Code</p>
                <h2 style="font-size: 36px; margin: 0; font-weight: 900; letter-spacing: 1px;">${giftCard.code}</h2>
                <p style="font-size: 24px; font-weight: 700; margin: 15px 0 0 0;">${giftCard.initialAmount.toLocaleString()} RWF</p>
            </div>

            ${giftCard.message ? `<p style="font-style: italic; margin-bottom: 30px; opacity: 0.9;">"${giftCard.message}"</p>` : ''}

            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 30px;">You can use this code at checkout to get a discount on your next purchase.</p>
            
            <a href="https://abelus.vercel.app/shop" style="display: inline-block; background: white; color: #6366f1; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">Shop Now</a>
            
            <p style="font-size: 12px; margin-top: 40px; opacity: 0.6;">This gift card expires on ${new Date(giftCard.expiryDate).toLocaleDateString()}</p>
        </div>
      `,
        });

        if (error) {
            console.error("❌ Failed to send gift card email:", error);
            return;
        }

        console.log("✅ Gift Card Email Sent:", data.id);
    } catch (error) {
        console.error("❌ Failed to send gift card email:", error);
    }
};
