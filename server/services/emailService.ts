import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(
  email: string,
  code: string
) {
  await transporter.sendMail({
    from: `"ConfHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "ConfHub Verification Code",

    text: `
Your ConfHub verification code is: ${code}

This code expires in 10 minutes.

If you did not request this code, you can ignore this email.
`,

    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;">

  <div style="max-width:520px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

    <div style="padding:22px 24px;border-bottom:1px solid #e5e7eb;">
      <div style="font-size:20px;font-weight:700;color:#111827;">
        ConfHub
      </div>

      <div style="font-size:12px;color:#6b7280;margin-top:3px;">
        Academic Conference Management System
      </div>
    </div>

    <div style="padding:28px 24px;">

      <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">
        Email verification
      </h2>

      <p style="font-size:14px;line-height:1.6;color:#4b5563;">
        Enter the following verification code to complete your ConfHub sign-in.
      </p>

      <div style="margin:24px 0;padding:20px;background:#f3f4f6;border-radius:8px;text-align:center;">
        <span style="font-size:30px;font-weight:700;letter-spacing:8px;color:#111827;">
          ${code}
        </span>
      </div>

      <p style="font-size:13px;color:#6b7280;">
        This code expires in 10 minutes.
      </p>

      <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
        If you did not request this code, you can safely ignore this email.
      </p>

    </div>

  </div>

</body>
</html>
`,
  });
}