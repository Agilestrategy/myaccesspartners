export default async (request, context) => {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const pass = decoded.slice(decoded.indexOf(":") + 1);
      if (pass === "agilestrategy") return context.next();
    } catch (e) {}
  }
  return new Response("Market Access Partners - private preview. Sign in to continue.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Market Access Partners"', "Content-Type": "text/plain" },
  });
};

export const config = { path: "/*" };
