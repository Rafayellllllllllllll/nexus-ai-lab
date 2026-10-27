// Supabase Edge Function: nexus-chat
// 前端只调这个函数，DeepSeek 密钥只存在 Supabase Secrets（DEEPSEEK_API_KEY）里，绝不进前端、绝不进 Git。
// 部署后在 Supabase 后台 Edge Functions > Secrets 里添加 DEEPSEEK_API_KEY。
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { system, user, temperature, maxTokens } = await req.json();
    const key = Deno.env.get("DEEPSEEK_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY 未配置，请在 Supabase Secrets 里添加" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user || "" },
      ], temperature: typeof temperature === "number" ? temperature : 0.5, max_tokens: typeof maxTokens === "number" ? maxTokens : 1024 }),
    });
    const j = await r.json();
    if (!r.ok) return new Response(JSON.stringify({ error: j?.error?.message || "DeepSeek 调用失败" }), { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ text: j.choices?.[0]?.message?.content || "", source: "deepseek-chat" }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
