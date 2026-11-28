/* =========================================================
   AGENCY REDO – postavke
   Ovdje upiši podatke svog Supabase projekta
   (Supabase → Project Settings → API).
   Dok je ovo prazno, stranica radi kao i dosad (sadržaj iz HTML-a),
   a kontakt forma otvara mail program.
   ========================================================= */
window.REDO_CONFIG = {
  // npr. "https://ptluyvxorqsvbrmchnwa.supabase.co"
  supabaseUrl: "",

  // "anon public" ili "publishable" ključ (NIKAKO service_role!)
  supabaseKey: "sb_publishable_izQM6OOlKYnA2y2mQM8aKg_1lB1Amms",

  // naziv Storage bucketa za slike i videe
  storageBucket: "media",

  // naziv Edge funkcije za kontakt formu
  contactFunction: "contact",

  // na ovaj mail ide kontakt forma ako Supabase nije povezan
  contactEmail: "os.agency.redo@gmail.com"
};
