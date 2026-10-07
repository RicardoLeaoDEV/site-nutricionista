import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ASAAS_API_URL = Deno.env.get("ASAAS_ENV") === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/v3";

const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PRECOS_PLANOS: Record<string, { valor: number; limite: number; nome: string }> = {
    starter: { valor: 69.00, limite: 15, nome: "Real Fit Hub PRO - Plano Starter" },
    pro: { valor: 139.00, limite: 50, nome: "Real Fit Hub PRO - Plano Pro" },
    elite: { valor: 229.00, limite: 9999, nome: "Real Fit Hub PRO - Plano Elite" }
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const body = await req.json();

        const profissionalId = body.profissionalId || body.userId;
        const planoEscolhido = body.planoEscolhido || body.plan;
        const nomeProfissional = body.nome || "Profissional Real Fit Hub";
        const emailProfissional = body.email;
        const telefoneProfissional = body.telefone;
        const cpfProfissional = body.cpf;
        const papelProfissional = body.papel || "profissional";
        const especialidade = body.especialidade || "Ambos";

        if (!profissionalId || !planoEscolhido || !PRECOS_PLANOS[planoEscolhido]) {
            return new Response(JSON.stringify({
                error: "Dados inválidos.",
                detalhes: { profissionalId, planoEscolhido }
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        let { data: prof, error: errProf } = await supabase
            .from("profissionais")
            .select("id, nome, email, asaas_customer_id")
            .or(`id.eq.${profissionalId},user_id.eq.${profissionalId}`)
            .maybeSingle();

        if (!prof) {
            const { data: novoProf, error: errInsert } = await supabase
                .from("profissionais")
                .upsert({
                    id: profissionalId,
                    nome: nomeProfissional,
                    email: emailProfissional,
                    telefone: telefoneProfissional,
                    papel: papelProfissional,
                    especialidade: especialidade
                    // Removido: plano: planoEscolhido
                })
                .select("id, nome, email, asaas_customer_id")
                .single();

            if (errInsert || !novoProf) {
                const { data: retryProf, error: errRetry } = await supabase
                    .from("profissionais")
                    .upsert({
                        user_id: profissionalId,
                        nome: nomeProfissional,
                        email: emailProfissional,
                        telefone: telefoneProfissional,
                        papel: papelProfissional,
                        especialidade: especialidade
                        // Removido: plano: planoEscolhido
                    })
                    .select("id, nome, email, asaas_customer_id")
                    .single();

                if (errRetry || !retryProf) {
                    throw new Error("Não foi possível localizar nem criar o profissional: " + (errInsert?.message || errRetry?.message));
                }
                prof = retryProf;
            } else {
                prof = novoProf;
            }
        }

        let customerId = prof.asaas_customer_id;

        if (!customerId) {
            const respCustomer = await fetch(`${ASAAS_API_URL}/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "access_token": ASAAS_API_KEY
                },
                body: JSON.stringify({
                    name: prof.nome || nomeProfissional,
                    email: prof.email || emailProfissional,
                    phone: telefoneProfissional,
                    cpfCnpj: cpfProfissional,
                    externalReference: prof.id
                })
            });

            const dataCustomer = await respCustomer.json();
            if (!dataCustomer.id) {
                throw new Error("Erro ao criar cliente no Asaas: " + JSON.stringify(dataCustomer));
            }

            customerId = dataCustomer.id;
            await supabase.from("profissionais").update({ asaas_customer_id: customerId }).eq("id", prof.id);
        }

        const planoInfo = PRECOS_PLANOS[planoEscolhido];
        const dataPrimeiroVencimento = new Date();
        dataPrimeiroVencimento.setDate(dataPrimeiroVencimento.getDate() + 1);

        const respSub = await fetch(`${ASAAS_API_URL}/subscriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": ASAAS_API_KEY
            },
            body: JSON.stringify({
                customer: customerId,
                billingType: "UNDEFINED",
                value: planoInfo.valor,
                nextDueDate: dataPrimeiroVencimento.toISOString().split("T")[0],
                cycle: "MONTHLY",
                description: planoInfo.nome,
                externalReference: JSON.stringify({ profissionalId: prof.id, plano: planoEscolhido })
            })
        });

        const dataSub = await respSub.json();
        if (!dataSub.id) {
            throw new Error("Erro ao criar assinatura: " + JSON.stringify(dataSub));
        }

        const respPayments = await fetch(`${ASAAS_API_URL}/subscriptions/${dataSub.id}/payments`, {
            headers: { "access_token": ASAAS_API_KEY }
        });
        const dataPayments = await respPayments.json();
        const invoiceUrl = dataPayments.data?.[0]?.invoiceUrl || `https://www.asaas.com/i/${dataSub.id}`;

        await supabase.from("profissionais").update({
            asaas_subscription_id: dataSub.id
            // Removido: plano: planoEscolhido
        }).eq("id", prof.id);

        return new Response(JSON.stringify({
            success: true,
            paymentUrl: invoiceUrl,
            subscriptionId: dataSub.id
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});