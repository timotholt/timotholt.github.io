import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'public');

export function projectMedia(slug: string) {
  // Paired captures: a desktop screenshot for wide screens and a portrait phone screenshot for phones.
  if (existsSync(join(root, 'projects', `${slug}-desktop.webp`))) {
    const phone = existsSync(join(root, 'projects', `${slug}-phone.webp`)) ? `/projects/${slug}-phone.webp` : undefined;
    return { src: `/projects/${slug}-desktop.webp`, phone, video: false };
  }
  for (const ext of ['mp4', 'webp', 'png', 'jpg']) {
    if (existsSync(join(root, 'projects', `${slug}.${ext}`))) return { src: `/projects/${slug}.${ext}`, phone: undefined, video: ext === 'mp4' };
  }
  return null;
}

// TODO(tim): Add an approved public/headshot.jpg to enable the optional hero portrait.
export const hasHeadshot = existsSync(join(root, 'headshot.jpg'));
