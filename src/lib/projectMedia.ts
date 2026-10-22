import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = join(process.cwd(), 'public');

// Version each file by a hash of its contents so browsers and the CDN never serve a stale screenshot after an update.
const versioned = (file: string) => `/projects/${file}?v=${createHash('sha1').update(readFileSync(join(root, 'projects', file))).digest('hex').slice(0, 8)}`;

export function projectMedia(slug: string) {
  // Paired captures: a desktop screenshot for wide screens and a portrait phone screenshot for phones.
  if (existsSync(join(root, 'projects', `${slug}-desktop.webp`))) {
    const phone = existsSync(join(root, 'projects', `${slug}-phone.webp`)) ? versioned(`${slug}-phone.webp`) : undefined;
    return { src: versioned(`${slug}-desktop.webp`), phone, video: false };
  }
  for (const ext of ['mp4', 'webp', 'png', 'jpg']) {
    if (existsSync(join(root, 'projects', `${slug}.${ext}`))) return { src: versioned(`${slug}.${ext}`), phone: undefined, video: ext === 'mp4' };
  }
  return null;
}

// TODO(tim): Add an approved public/headshot.jpg to enable the optional hero portrait.
export const hasHeadshot = existsSync(join(root, 'headshot.jpg'));
