import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'public');

export function projectMedia(slug: string) {
  for (const ext of ['mp4', 'webp', 'png', 'jpg']) {
    if (existsSync(join(root, 'projects', `${slug}.${ext}`))) return { src: `/projects/${slug}.${ext}`, video: ext === 'mp4' };
  }
  return null;
}

// TODO(tim): Add an approved public/headshot.jpg to enable the optional hero portrait.
export const hasHeadshot = existsSync(join(root, 'headshot.jpg'));
