import nodemailer from 'nodemailer';

// Configure transporter (using Ethereal for dev/testing if no real creds)
const createTransporter = async () => {
    // In production, use real SMTP credentials from .env
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback to Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal Email Test Account:', testAccount.user);

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

let transporter = null;

const getTransporter = async () => {
    if (!transporter) {
        transporter = await createTransporter();
    }
    return transporter;
};

export const sendOrderConfirmation = async (order) => {
    try {
        const transport = await getTransporter();
        const info = await transport.sendMail({
            from: '"Impressa Store" <no-reply@impressa.com>',
            to: order.guestInfo?.email || order.customer?.email,
            subject: `Order Confirmation #${order.publicId}`,
            html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'},</p>
        <p>We have received your order <strong>#${order.publicId}</strong>.</p>
        <p><strong>Total:</strong> ${order.totals.grandTotal} Rwf</p>
        <p>We will notify you when your items are shipped.</p>
      `,
        });
        console.log("✅ Order Confirmation Sent:", info.messageId);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("❌ Failed to send order confirmation:", error);
    }
};

export const sendStatusUpdate = async (order) => {
    try {
        const transport = await getTransporter();
        const info = await transport.sendMail({
            from: '"Impressa Store" <no-reply@impressa.com>',
            to: order.guestInfo?.email || order.customer?.email,
            subject: `Order Update #${order.publicId}`,
            html: `
        <h1>Order Update</h1>
        <p>Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'},</p>
        <p>Your order <strong>#${order.publicId}</strong> status has been updated to: <strong>${order.status.toUpperCase()}</strong>.</p>
      `,
        });
        console.log("✅ Status Update Email Sent:", info.messageId);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("❌ Failed to send status update:", error);
    }
};
