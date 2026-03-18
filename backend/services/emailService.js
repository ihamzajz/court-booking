const nodemailer = require("nodemailer");

const isMailConfigured = () => {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_APP_PASSWORD);
};

const getTransporter = () => {
  if (!isMailConfigured()) {
    throw new Error("MAIL_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASSWORD,
    },
  });
};

const getFromAddress = () => {
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER;
  const fromName = process.env.MAIL_FROM_NAME || "BookFlow";

  return `"${fromName}" <${fromEmail}>`;
};

const sendPasswordResetOtpEmail = async ({ to, name, otp, expiresInMinutes }) => {
  const transporter = getTransporter();
  const safeName = name?.trim() || "there";

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Your BookFlow password reset code",
    text: [
      `Hello ${safeName},`,
      "",
      `Your BookFlow password reset code is ${otp}.`,
      `This code expires in ${expiresInMinutes} minutes.`,
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dbe5f0;border-radius:20px;padding:32px;">
          <div style="font-size:24px;font-weight:700;color:#1e3a8a;margin-bottom:8px;">BookFlow</div>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Hello ${safeName},</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
            Use the following code to reset your password.
          </p>
          <div style="margin:0 0 18px;padding:16px 18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;text-align:center;">
            <div style="letter-spacing:8px;font-size:32px;font-weight:700;color:#1d4ed8;">${otp}</div>
          </div>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
            This code expires in ${expiresInMinutes} minutes.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  isMailConfigured,
  sendPasswordResetOtpEmail,
};
