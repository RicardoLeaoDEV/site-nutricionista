import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const LIMITES_PLANOS: Record<string, number> = {
    starter: 15,
    pro: 50,
    elite: 9999
};

serve(async (req) => {
    try {
        const authToken = req.headers.get("asaas-access-token");
        if (ASAAS_WEBHOOK_TOKEN && authToken !== ASAAS_WEBHOOK_TOKEN) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const event = body.event;
        const payment = body.payment;

        if (!payment) return new Response("Ignorado", { status: 200 });

        let refData = { profissionalId: "", plano: "pro" };
        try {
            refData = JSON.parse(payment.externalReference || "{}");
        } catch (_) {
            refData.profissionalId = payment.externalReference;
        }

        const { profissionalId, plano } = refData;
        if (!profissionalId) return new Response("Sem profissionalId", { status: 200 });

        const limiteCalculado = LIMITES_PLANOS[plano] || 50;

        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            const dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 32);

            await supabase
                .from("profissionais")
                .update({
                    status_assinatura: "active",
                    plano: plano,
                    limite_alunos: limiteCalculado,
                    data_renovacao: dataVencimento.toISOString()
                })
                .eq("id", profissionalId);
        }

        if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_REFUNDED") {
            await supabase
                .from("profissionais")
                .update({
                    status_assinatura: "past_due"
                })
                .eq("id", profissionalId);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }
});