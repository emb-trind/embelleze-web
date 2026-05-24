import { z } from "zod";

export const LeadSchema = z.object({
  phone: z
    .string()
    .min(1)
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 13, {
      message: "Telefone deve ter entre 10 e 13 dígitos",
    }),
  name: z.string().max(120).optional(),
  origin: z.string().max(80).optional(),
  course_interest: z.string().max(120).optional(),
  objective: z.string().max(200).optional(),
  status: z.enum(["NOVO", "QUALIFICADO", "INTERESSADO", "PIX_GERADO", "PIX_PAGO"]).optional(),
  last_message: z.string().max(500).optional(),
  // Atribuição de canal — first-touch
  utm_source:   z.string().max(100).optional(),
  utm_medium:   z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content:  z.string().max(200).optional(),
  utm_term:     z.string().max(200).optional(),
});

export const LocationIntentSchema = z.object({
  event: z.string().min(1).max(80),
  neighborhood: z.string().max(100).nullable().optional(),
  permission: z.string().max(40).nullable().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional(),
  auto: z.boolean().optional(),
});
