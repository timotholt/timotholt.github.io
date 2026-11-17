import { sectionCss } from '../data/sections';

// Built to dist/section-colors.css. See sectionCss() for why the colors live here.
export const GET = () => new Response(sectionCss(), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
