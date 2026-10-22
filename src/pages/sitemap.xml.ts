import { getCollection } from 'astro:content';
export async function GET() {
  const projects = await getCollection('projects');
  const urls = ['/', ...projects.map(project => `/projects/${project.id}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path => `<url><loc>${new URL(path, 'https://timotholt.com').href}</loc></url>`).join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
