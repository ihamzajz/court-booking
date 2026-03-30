const pool = require("../config/db");
const { getAppName, getPrivacyContactName, getSupportEmail } = require("../config/env");

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getPolicyHtml = () => {
  const appName = escapeHtml(getAppName());
  const supportEmail = escapeHtml(getSupportEmail() || "support@example.com");
  const contactName = escapeHtml(getPrivacyContactName());

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName} Privacy Policy</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #0f172a; }
      main { max-width: 860px; margin: 0 auto; padding: 32px 20px 48px; }
      section { background: #fff; border: 1px solid #dbe5f0; border-radius: 18px; padding: 24px; margin-top: 18px; }
      h1, h2 { color: #163b7a; }
      ul { padding-left: 22px; }
      a { color: #1d4ed8; }
      .muted { color: #475569; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${appName} Privacy Policy</h1>
        <p class="muted">Last updated: March 30, 2026</p>
        <p>${appName} helps users request court and event bookings. To provide these services, the app stores limited account and booking information.</p>
      </section>
      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li>Account details such as name, username, email address, and optional club or member number.</li>
          <li>Authentication information such as encrypted passwords and session data.</li>
          <li>Booking data such as court bookings, event bookings, status history, and payment status.</li>
          <li>Admin-uploaded media such as court, event, slide, and news images.</li>
        </ul>
      </section>
      <section>
        <h2>How We Use Information</h2>
        <ul>
          <li>To create and manage user accounts.</li>
          <li>To process booking requests and show booking history.</li>
          <li>To let administrators review, approve, reject, and manage bookings.</li>
          <li>To publish app content such as slides, FAQs, news, courts, and events.</li>
          <li>To protect accounts and improve app security.</li>
        </ul>
      </section>
      <section>
        <h2>Data Sharing</h2>
        <p>${appName} does not sell personal information. Data is only shared with authorized administrators and service providers required to operate the platform, such as hosting, database, and email delivery providers.</p>
      </section>
      <section>
        <h2>Data Retention</h2>
        <p>We keep account and booking information only as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce policies.</p>
      </section>
      <section>
        <h2>Account Deletion</h2>
        <p>If you create an account in ${appName}, you can request deletion directly inside the app from the Profile screen by selecting <strong>Delete Account</strong>.</p>
        <p>You can also submit a deletion request on the web at <a href="/account-deletion">/account-deletion</a>.</p>
      </section>
      <section>
        <h2>Security</h2>
        <p>We use reasonable technical and organizational safeguards to protect account information, including encrypted password storage and authenticated access controls.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>If you have questions about this policy, contact ${contactName} at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      </section>
    </main>
  </body>
</html>`;
};

const getDeletionPageHtml = (message = "", isSuccess = false) => {
  const appName = escapeHtml(getAppName());
  const supportEmail = escapeHtml(getSupportEmail() || "support@example.com");
  const banner = message
    ? `<div style="margin-bottom:16px;padding:14px 16px;border-radius:12px;border:1px solid ${
        isSuccess ? "#a7f3d0" : "#fecaca"
      };background:${isSuccess ? "#ecfdf5" : "#fef2f2"};color:${isSuccess ? "#166534" : "#991b1b"};">${escapeHtml(
        message
      )}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName} Account Deletion</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #0f172a; }
      main { max-width: 720px; margin: 0 auto; padding: 32px 20px 48px; }
      section { background: #fff; border: 1px solid #dbe5f0; border-radius: 18px; padding: 24px; }
      label { display: block; margin-bottom: 8px; font-weight: 700; color: #163b7a; }
      input, textarea { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 16px; }
      textarea { min-height: 110px; resize: vertical; }
      button { background: #1d4ed8; color: #fff; border: 0; border-radius: 12px; padding: 12px 18px; font-weight: 700; cursor: pointer; }
      .muted { color: #475569; }
      a { color: #1d4ed8; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${appName} Account Deletion Request</h1>
        <p class="muted">Use this page if you need to request deletion outside the mobile app. If you can still sign in, the fastest option is the in-app <strong>Delete Account</strong> action from your profile.</p>
        ${banner}
        <form method="post" action="/account-deletion">
          <label for="email">Account Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required />

          <label for="note">Additional Details (Optional)</label>
          <textarea id="note" name="note" placeholder="Add any information that will help us identify your account."></textarea>

          <button type="submit">Submit Deletion Request</button>
        </form>
        <p class="muted" style="margin-top:18px;">If you need help, contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      </section>
    </main>
  </body>
</html>`;
};

const renderPrivacyPolicy = (_req, res) => {
  res.type("html").send(getPolicyHtml());
};

const renderAccountDeletionPage = (_req, res) => {
  res.type("html").send(getDeletionPageHtml());
};

const submitAccountDeletionRequest = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const note = String(req.body?.note || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).type("html").send(
      getDeletionPageHtml("Please enter a valid email address.", false)
    );
  }

  try {
    const [users] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    const userId = users[0]?.id || null;

    await pool.query(
      `INSERT INTO account_deletion_requests (user_id, email, note)
       VALUES (?, ?, ?)`,
      [userId, email, note || null]
    );

    return res
      .status(200)
      .type("html")
      .send(
        getDeletionPageHtml(
          "Your deletion request has been received. We will review it and process your request.",
          true
        )
      );
  } catch (error) {
    console.error("Failed to submit account deletion request", error);
    return res
      .status(500)
      .type("html")
      .send(getDeletionPageHtml("We could not submit your request right now. Please try again.", false));
  }
};

module.exports = {
  renderPrivacyPolicy,
  renderAccountDeletionPage,
  submitAccountDeletionRequest,
};
