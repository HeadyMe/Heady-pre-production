export default {
  async fetch(request, env, ctx) {
    return new Response(JSON.stringify({ status: "ok" }), { headers: { "content-type": "application/json" } });
  }
};
