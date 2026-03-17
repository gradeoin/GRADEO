export async function onRequestPost({ request }) {
  const formData = await request.formData();

  // Honeypot anti-spam
  if (formData.get("_gotcha")) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Forward to Formspree (kept server-side; not exposed in page source)
  const resp = await fetch("https://formspree.io/f/mykdgevl", {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: formData
  });

  if (resp.ok) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
}
