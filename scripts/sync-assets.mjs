import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const legacyBase = 'https://raw.githubusercontent.com/chrisbirster/ashhole90/master/';

const assets = [
  {
    source: 'public/images/ashholelogo.jpg',
    target: 'public/assets/logo/ashholelogo.jpg',
    sha: '9e143529f85458070d71b7353e579d87c9daa7ad',
  },
  {
    source: 'public/images/shenvalee-bg.jpg',
    target: 'public/assets/scenery/shenvalee-bg.jpg',
    sha: 'd76f5c9816bb561eadff588ab29a8c727bd02885',
  },
  {
    source: 'public/old/img216_1990.jpg',
    target: 'public/assets/archive/1990/photo.jpg',
    sha: 'c9557d8568e1be412c66c6340962f71d86a1b9fb',
  },
  {
    source: 'public/old/19910001.jpg',
    target: 'public/assets/archive/1991/document.jpg',
    sha: '7e4f92b8ba26c24a5724f026a11020d7690e947d',
  },
  {
    source: 'public/old/Mainshenphoto1996.jpg',
    target: 'public/assets/archive/1996/group.jpg',
    sha: 'c17b289391c81a29e084b7ae6c69085afed28210',
  },
  {
    source: 'public/old/2003.JPG',
    target: 'public/assets/archive/2003/group.jpg',
    sha: '38a734112e9f627bd212018e1e8d71e6b419c865',
  },
  {
    source: 'public/old/IMG_2378.JPG',
    target: 'public/assets/archive/2019/group.jpg',
    sha: '49c341f17fa26a8fd8069fd9ddb2fa91ba5d5f86',
  },
  {
    source: 'public/old/2024/IMG_2578.JPG',
    target: 'public/assets/archive/2024/group.jpg',
    sha: '6519da6dbb4fb9b75276bb69edca6c3612c737e1',
  },
  {
    source: 'public/old/110-1089_IMG.JPG',
    target: 'public/assets/memorial/gil-lugo.jpg',
    sha: '58a2fa7c0fcc0c57e4a09a75e0af15984d965ba5',
  },
  {
    source: 'public/old/Mvc-023f.jpg',
    target: 'public/assets/memorial/joe-ofalt.jpg',
    sha: '77b75fabae6bfa24e0a5d5fe7f3b0b363ddbb885',
  },
];

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

for (const asset of assets) {
  const url = new URL(asset.source, legacyBase);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${asset.source}: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const actualSha = gitBlobSha(bytes);
  if (actualSha !== asset.sha) {
    throw new Error(
      `Legacy asset verification failed for ${asset.source}: expected ${asset.sha}, got ${actualSha}`,
    );
  }

  await mkdir(dirname(asset.target), { recursive: true });
  await writeFile(asset.target, bytes);
  console.log(`synced ${asset.target} (${actualSha})`);
}
