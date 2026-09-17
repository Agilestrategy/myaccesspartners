// Market Access Partners preview gate.
// Two ways in, never a username or password:
//   1. An access key (Netlify environment variable MAP_ACCESS_KEY). Share https://myaccesspartners.com/?key=THE_KEY; change the key to revoke every link at once.
//   2. Google sign in with a @myaccesspartners.com account (crew). The sign in is verified server side against Supabase Auth before the cookie is set.
// Either way the visitor gets the same 30 day cookie.

const COOKIE = "map_access";
const DAYS = 30;
const CREW_DOMAIN = "@myaccesspartners.com";
const SUPABASE_URL = "https://iwdibogfypdjgsinwube.supabase.co";
const SUPABASE_ANON = "sb_publishable_BRmzLQw94Lt49xLFmDHJVQ_yoo68o4c";

const page = (bad) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Market Access Partners</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#161B24;color:#F5F1E6;font-family:Arial,Helvetica,sans-serif}
  .card{width:min(440px,90vw);background:#1F2633;border:1px solid rgba(245,241,230,.14);border-radius:14px;padding:36px 32px}
  .mark{font-weight:700;letter-spacing:.08em;font-size:15px}
  .mark b{color:#D98324}
  .rule{width:48px;height:3px;background:#D98324;margin:12px 0 22px}
  h1{font-size:20px;margin:0 0 8px}
  p{color:#9AA1AD;font-size:14px;line-height:1.5;margin:0 0 18px}
  input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid rgba(245,241,230,.2);background:#161B24;color:#F5F1E6;font-size:15px}
  button{margin-top:12px;width:100%;padding:12px;border:0;border-radius:8px;background:#D98324;color:#161B24;font-weight:700;font-size:15px;cursor:pointer}
  button.g{background:#F5F1E6;color:#161B24;display:flex;align-items:center;justify-content:center;gap:10px}
  button.g svg{width:18px;height:18px}
  .or{display:flex;align-items:center;gap:12px;color:#6A6F7A;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:22px 0 14px}
  .or:before,.or:after{content:"";flex:1;height:1px;background:rgba(245,241,230,.14)}
  .err{color:#E8A87C;font-size:13px;margin-top:10px;min-height:16px}
  .small{font-size:12px;color:#6A6F7A;margin-top:8px}
</style></head><body>
<div class="card">
  <div class="mark">MARKET <b>ACCESS</b> PARTNERS</div><div class="rule"></div>
  <h1>Crew and partners</h1>
  <p>Crew: sign in with your myaccesspartners.com Google account (pick it when Google asks). Partners: open the link you were sent, or enter your access key.</p>
  <button class="g" id="g" type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>Continue with Google</button>
  <div class="err" id="gerr"></div>
  <div class="or">or</div>
  <form method="get" action="/">
    <input name="key" placeholder="Access key" autocomplete="off">
    <button type="submit">Open the site</button>
    <div class="err">${bad ? "That key was not recognised." : ""}</div>
  </form>
</div>
<script>
(async () => {
  const sb = window.supabase.createClient("${SUPABASE_URL}", "${SUPABASE_ANON}");
  const err = document.getElementById("gerr");
  const clean = () => location.origin + location.pathname + (location.search || "");
  async function admit(session){
    err.textContent = "Checking your account…";
    const r = await fetch("/__gate/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ access_token: session.access_token }) });
    if (r.ok) { let back = "/"; try { back = localStorage.getItem("map_gate_return") || (location.pathname + (location.search || "")); localStorage.removeItem("map_gate_return"); } catch {} location.replace(back); return; }
    const j = await r.json().catch(() => ({}));
    err.textContent = j.error || "That account is not a myaccesspartners.com account.";
    await sb.auth.signOut();
  }
  document.getElementById("g").onclick = async () => {
    err.textContent = "";
    try { localStorage.setItem("map_gate_return", location.pathname + (location.search || "")); } catch {}
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: clean(), queryParams: { prompt: "select_account", hd: "myaccesspartners.com" } } });
    if (error) err.textContent = error.message;
  };
  const { data: { session } } = await sb.auth.getSession();
  if (session) admit(session);
  sb.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) admit(s); });
})();
</script>
</body></html>`;

const admitCookie = (key) => `${COOKIE}=${key}; Path=/; Max-Age=${DAYS * 86400}; Secure; HttpOnly; SameSite=Lax`;

export default async (request, context) => {
  const key = (Deno.env.get("MAP_ACCESS_KEY") || "").trim();
  if (!key) return context.next(); // no key configured: site is open

  const url = new URL(request.url);

  // Google sign in: verify the Supabase session server side, then admit crew on the domain.
  if (url.pathname === "/__gate/google" && request.method === "POST") {
    let token = "";
    try { token = String((await request.json()).access_token || ""); } catch { /* fall through */ }
    if (!token) return Response.json({ error: "No session." }, { status: 400 });
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` } });
    if (!r.ok) return Response.json({ error: "Sign in could not be verified." }, { status: 401 });
    const user = await r.json();
    const email = String(user.email || "").toLowerCase();
    if (!email.endsWith(CREW_DOMAIN)) return Response.json({ error: `Sign in is limited to ${CREW_DOMAIN.slice(1)} accounts.` }, { status: 403 });
    return new Response(JSON.stringify({ ok: true, email }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": admitCookie(key) } });
  }

  const cookies = request.headers.get("cookie") || "";
  const has = cookies.split(";").some((c) => c.trim() === `${COOKIE}=${key}`);
  if (has) return context.next();

  const offered = url.searchParams.get("key");
  if (offered !== null) {
    if (offered.trim() === key) {
      url.searchParams.delete("key");
      return new Response(null, { status: 302, headers: { Location: url.pathname + (url.search || ""), "Set-Cookie": admitCookie(key) } });
    }
    return new Response(page(true), { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  return new Response(page(false), { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
};

// The client investor portal is opened by a per client token link, so it sits outside the gate.
export const config = { path: "/*", excludedPath: ["/investor-portal.html"] };
