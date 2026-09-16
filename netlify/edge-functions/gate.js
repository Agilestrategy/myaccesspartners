// Market Access Partners preview gate.
// Access is by key, never by username or password.
// Share a link like https://myaccesspartners.com/?key=THE_KEY and the visitor is let in for 30 days.
// The key lives in the Netlify environment variable MAP_ACCESS_KEY. Change it there to revoke every link at once.

const COOKIE = "map_access";
const DAYS = 30;

const page = (bad) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Market Access Partners</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#161B24;color:#F5F1E6;font-family:Arial,Helvetica,sans-serif}
  .card{width:min(420px,90vw);background:#1F2633;border:1px solid rgba(245,241,230,.14);border-radius:14px;padding:36px 32px}
  .mark{font-weight:700;letter-spacing:.08em;font-size:15px}
  .mark b{color:#D98324}
  .rule{width:48px;height:3px;background:#D98324;margin:12px 0 22px}
  h1{font-size:20px;margin:0 0 8px}
  p{color:#9AA1AD;font-size:14px;line-height:1.5;margin:0 0 18px}
  input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid rgba(245,241,230,.2);background:#161B24;color:#F5F1E6;font-size:15px}
  button{margin-top:12px;width:100%;padding:12px;border:0;border-radius:8px;background:#D98324;color:#161B24;font-weight:700;font-size:15px;cursor:pointer}
  .err{color:#E8A87C;font-size:13px;margin-top:10px;min-height:16px}
</style></head><body>
<form class="card" method="get" action="/">
  <div class="mark">MARKET <b>ACCESS</b> PARTNERS</div><div class="rule"></div>
  <h1>Private preview</h1>
  <p>This site is open to partners by access key. If you were sent a link, open that link. Otherwise enter the key you were given.</p>
  <input name="key" placeholder="Access key" autocomplete="off" autofocus>
  <button type="submit">Open the site</button>
  <div class="err">${bad ? "That key was not recognised." : ""}</div>
</form>
</body></html>`;

export default async (request, context) => {
  const key = (Deno.env.get("MAP_ACCESS_KEY") || "").trim();
  if (!key) return context.next(); // no key configured: site is open

  const url = new URL(request.url);
  const cookies = request.headers.get("cookie") || "";
  const has = cookies.split(";").some((c) => c.trim() === `${COOKIE}=${key}`);
  if (has) return context.next();

  const offered = url.searchParams.get("key");
  if (offered !== null) {
    if (offered.trim() === key) {
      url.searchParams.delete("key");
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.pathname + (url.search || ""),
          "Set-Cookie": `${COOKIE}=${key}; Path=/; Max-Age=${DAYS * 86400}; Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }
    return new Response(page(true), { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  return new Response(page(false), { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
};

export const config = { path: "/*" };
