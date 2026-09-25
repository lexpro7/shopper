import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const content = readFileSync('data/seed-data.ts', 'utf8') + readFileSync('app/page.tsx', 'utf8');
const ids = [...new Set(content.match(/photo-[a-zA-Z0-9-]+/g))];
mkdirSync('public/images', { recursive: true });
const success = [];
const failures = [];
async function download(id) {
  const path = `public/images/${id}.jpg`;
  if (existsSync(path)) {
    success.push(id);
    return;
  }
  const photo = id === 'photo-1592789705501-f9ae4278a3bb' ? 'photo-1503602642458-232111445657' : id;
  try {
    const response = await fetch(
      `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=85`,
      { signal: AbortSignal.timeout(25000) },
    );
    if (!response.ok) throw Error(String(response.status));
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
    success.push(id);
  } catch (e) {
    failures.push({ id, error: e.message });
  }
}
for (let i = 0; i < ids.length; i += 4) await Promise.all(ids.slice(i, i + 4).map(download));
writeFileSync('data/image-manifest.json', JSON.stringify(success, null, 2));
console.log(JSON.stringify({ downloaded: success.length, failures }));
