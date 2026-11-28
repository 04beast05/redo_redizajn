// =========================================================
// AGENCY REDO – Supabase Edge funkcija "contact"
// Prima podatke s kontakt forme, sprema ih u tablicu contact_messages
// i šalje mail preko Resenda.
//
// Potrebne tajne (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   – ključ s resend.com (API Keys)
//   CONTACT_TO       – kamo stižu upiti, npr. os.agency.redo@gmail.com
//   CONTACT_FROM     – pošiljatelj, npr. "Redo <web@tvojadomena.hr>"
//                      (dok domena nije potvrđena u Resendu koristi
//                       "Redo <onboarding@resend.dev>")
// SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY Supabase daje sam.
// =========================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  // skriveno polje – botovi ga popune, ljudi ne
  if (clean(body.website, 200)) return json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const service = clean(body.service, 120);
  const message = clean(body.message, 4000);

  if (name.length < 2) return json({ ok: false, error: "Name is required" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: "Valid email is required" }, 400);
  if (!service) return json({ ok: false, error: "Service is required" }, 400);

  // 1) spremi u bazu
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error: dbError } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, service, message });
  if (dbError) {
    console.error("DB error", dbError);
    return json({ ok: false, error: "Could not save message" }, 500);
  }

  // 2) pošalji mail preko Resenda
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (apiKey) {
    const to = Deno.env.get("CONTACT_TO") || "os.agency.redo@gmail.com";
    const from = Deno.env.get("CONTACT_FROM") || "Redo <onboarding@resend.dev>";
    const html = `
      <h2 style="font-family:Arial,sans-serif">Novi upit s weba</h2>
      <table style="font-family:Arial,sans-serif;font-size:15px" cellpadding="6">
        <tr><td><b>Ime i prezime</b></td><td>${esc(name)}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(email)}</td></tr>
        <tr><td><b>Mobitel</b></td><td>${esc(phone || "-")}</td></tr>
        <tr><td><b>Usluga</b></td><td>${esc(service)}</td></tr>
      </table>
      <p style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-line">${esc(message || "")}</p>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Novi upit: ${name} – ${service}`,
        html,
      }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  }

  return json({ ok: true });
});
