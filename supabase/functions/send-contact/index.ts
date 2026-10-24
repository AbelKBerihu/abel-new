import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(10).max(3000),
  projectNeeds: z.string().trim().max(3000).optional().default(""),
  preferredDate: z.string().date(),
});

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";

async function generateBrief(apiKey: string, input: { name: string; message: string; projectNeeds: string }) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      input: [
        {
          role: "system",
          content:
            "You turn portfolio inquiries for Abel Kebede (cybersecurity student & software developer) into a concise project or collaboration brief. Reply in plain text under 120 words with exactly these sections:\nSummary: one sentence\nScope: 2-4 short bullets starting with '- '\nNext steps: 2-3 short bullets starting with '- '\nNo markdown headings, no greetings.",
        },
        { role: "user", content: `Client: ${input.name}\nProject needs: ${input.projectNeeds || "(not provided)"}\nMessage: ${input.message}` },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    console.error(`AI brief failed [${res.status}]: ${await res.text().catch(() => "")}`);
    return null;
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const evt = JSON.parse(data);
        if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
        if (evt.type === "error" || evt.type === "response.failed") console.error("AI stream error", data);
      } catch { /* ignore partial */ }
    }
  }
  return text.trim() || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });
  }

  try {
    const parsed = ContactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Please check the submitted details." }), { status: 400, headers: jsonHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!supabaseUrl || !serviceRoleKey || !telegramToken) throw new Error("Contact service is not configured");

    const { name, email, phone, message, projectNeeds, preferredDate } = parsed.data;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: row, error: insertError } = await supabase
      .from("contact_submissions")
      .insert({ name, email, phone: phone || null, message, project_needs: projectNeeds || null, preferred_date: preferredDate })
      .select("id")
      .single();
    if (insertError) throw new Error(`Could not save submission: ${insertError.message}`);

    let brief: string | null = null;
    if (lovableKey) {
      try {
        brief = await generateBrief(lovableKey, { name, message, projectNeeds });
      } catch (e) {
        console.error("Brief generation error", e);
      }
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "8738536556",
        text: [
          "New portfolio enquiry",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Preferred date: ${preferredDate}`,
          "",
          `Project needs: ${projectNeeds || "Not provided"}`,
          `Message: ${message}`,
          ...(brief ? ["", "AI project brief", brief] : []),
        ].join("\n").slice(0, 4000),
      }),
    });
    const telegramResult = await telegramResponse.json();
    const delivered = telegramResponse.ok && telegramResult.ok;

    await supabase.from("contact_submissions").update({ ai_brief: brief, telegram_delivered: delivered }).eq("id", row.id);

    if (!delivered) {
      console.error(`Telegram request failed [${telegramResponse.status}]: ${telegramResult.description}`);
      return new Response(JSON.stringify({ error: "Your message was saved, but the Telegram notification failed.", brief }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true, brief }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error("send-contact failed", error);
    return new Response(JSON.stringify({ error: "Unable to send your message right now." }), { status: 500, headers: jsonHeaders });
  }
});
