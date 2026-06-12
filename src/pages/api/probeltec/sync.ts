import type { APIRoute } from "astro";
import { getLeadsWithProbeltecId, updateProbeltecStatus, upsertLead } from "../../../lib/db";
import { fetchLeadStatus } from "../../../lib/probeltec";

export const GET: APIRoute = async ({ request }) => {
  try {
    // Para proteger a rota de ser chamada publicamente à toa,
    // em produção poderíamos exigir um token de autorização.
    // Como é um MVP, vamos apenas executar o sync.
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const leads = await getLeadsWithProbeltecId();
    let updatedCount = 0;

    for (const lead of leads) {
      if (lead.probeltec_id) {
        const status = await fetchLeadStatus(lead.probeltec_id);
        if (status) {
          await updateProbeltecStatus(lead.phone, status);
          
          // Se o CRM confirmar a matrícula, atualizamos a máquina de estados local 
          // para CHECKOUT_PAGO, o que automaticamente engatilha o disparo do Meta CAPI (Purchase)
          if (status === 'Matriculado') {
            await upsertLead({ phone: lead.phone, status: "CHECKOUT_PAGO" });
          }
          
          updatedCount++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: leads.length,
      updated: updatedCount,
      message: "Sync completed" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[CRON] Erro no sync Probeltec:", error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
