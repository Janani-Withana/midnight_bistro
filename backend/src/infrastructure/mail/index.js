// Mail service stub. Wire to SendGrid, Nodemailer, etc. later.
export async function sendMail({ to, subject, text, html }) {
  if (process.env.NODE_ENV !== "test") {
    console.log("[Mail stub]", { to, subject, text: text?.slice(0, 50) });
  }
  return { ok: true };
}
