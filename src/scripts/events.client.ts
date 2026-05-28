import { track, trackMeta, trackOpenAI, Events } from '../lib/tracking';

document.addEventListener('DOMContentLoaded', () => {
track({ event: Events.PAGE_VIEW, origin: window.location.pathname });

document.querySelectorAll('[data-course]').forEach(el => {
el.addEventListener('click', () => {
const course = (el as HTMLElement).dataset.course ?? '';
track({ event: Events.CLICK_COURSE, course });
trackMeta('ViewContent', { content_name: course, content_category: 'education' });
trackOpenAI('contents_viewed', { type: 'contents', contents: [{ id: course, name: course, content_type: 'product' }] });
});
});

document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
el.addEventListener('click', () => {
track({ event: Events.CLICK_WHATSAPP, origin: (el as HTMLElement).dataset.origin ?? '' });
trackMeta('Contact');
trackOpenAI('lead_created', { type: 'customer_action' });
});
});

document.querySelectorAll('[data-social="instagram"]').forEach(el => {
el.addEventListener('click', () => {
track({ event: Events.CLICK_INSTAGRAM, origin: (el as HTMLElement).dataset.origin ?? '' });
});
});
});
