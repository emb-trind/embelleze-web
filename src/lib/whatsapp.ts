import { WHATSAPP_NUMBER } from './constants';

export interface WhatsAppOptions {
  course?: string;
  ticket?: string;
  origin?: string;
  utmSource?: string;
  utmCampaign?: string;
}

function buildMessage(options: WhatsAppOptions = {}): string {
  const { course, ticket, origin } = options;

  if (course && ticket) {
    return `Olá, vim pela página e quero saber sobre ${course}. Meu código é ${ticket}.`;
  }

  if (course) {
    return `Olá, vim pela página e quero saber sobre ${course}.`;
  }

  if (origin) {
    return `Olá, vim de ${origin} e quero saber mais sobre os cursos.`;
  }

  return 'Olá, vim pela página e quero saber mais sobre os cursos.';
}

export function getWhatsAppLink(options: WhatsAppOptions = {}): string {
  const message = encodeURIComponent(buildMessage(options));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function getCourseWhatsAppLink(_courseId: string, courseName: string, ticket?: string): string {
  return getWhatsAppLink({ course: courseName, ticket });
}
