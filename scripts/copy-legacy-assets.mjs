import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const legacyRoot = path.resolve(process.env.ASHHOLE90_PATH || process.argv[2] || '../ashhole90');

const mappings = [
  ['public/images/shenvalee-bg.jpg', 'public/assets/scenery/shenvalee-bg.jpg'],

  ['public/old/img216_1990.jpg', 'public/assets/archive/1990/group.jpg'],
  ['public/old/19910001.jpg', 'public/assets/archive/1991/19910001.jpg'],
  ['public/old/19910003.jpg', 'public/assets/archive/1991/19910003.jpg'],
  ['public/old/19910004.jpg', 'public/assets/archive/1991/19910004.jpg'],
  ['public/old/19910005.jpg', 'public/assets/archive/1991/19910005.jpg'],
  ['public/old/19910006.jpg', 'public/assets/archive/1991/19910006.jpg'],
  ['public/old/19910007.jpg', 'public/assets/archive/1991/19910007.jpg'],
  ['public/old/19910008.jpg', 'public/assets/archive/1991/19910008.jpg'],
  ['public/old/Mainshenphoto1996.jpg', 'public/assets/archive/1996/group.jpg'],
  ['public/old/2003.JPG', 'public/assets/archive/2003/group.jpg'],
  ['public/old/mainphoto2007.jpg', 'public/assets/archive/2007/group.jpg'],
  ['public/old/2008.JPG', 'public/assets/archive/2008/group.jpg'],
  ['public/old/2009.JPG', 'public/assets/archive/2009/group.jpg'],
  ['public/old/2010.JPG', 'public/assets/archive/2010/group.jpg'],
  ['public/old/2011shenpic.jpg', 'public/assets/archive/2011/group.jpg'],
  ['public/old/2012.jpg', 'public/assets/archive/2012/group.jpg'],
  ['public/old/2013.jpg', 'public/assets/archive/2013/group.jpg'],
  ['public/old/Mainshenphoto2017.JPG', 'public/assets/archive/2017/group.jpg'],
  ['public/old/Mainshenphoto2018.JPG', 'public/assets/archive/2018/group.jpg'],
  ['public/old/IMG_2378.JPG', 'public/assets/archive/2019/group.jpg'],
  ['public/old/2020/teamphoto2020.jpg', 'public/assets/archive/2020/group.jpg'],
  ['public/old/2021/group2021.JPG', 'public/assets/archive/2021/group.jpg'],
  ['public/old/2022/IMG_2493.JPG', 'public/assets/archive/2022/group.jpg'],
  ['public/old/2023/IMG_2549.JPG', 'public/assets/archive/2023/group.jpg'],
  ['public/old/2024/IMG_2578.JPG', 'public/assets/archive/2024/group.jpg'],

  ['public/old/110-1089_IMG.JPG', 'public/assets/memorial/gil-lugo.jpg'],
  ['public/old/Mvc-023f.jpg', 'public/assets/memorial/joe-ofalt.jpg'],
];

const gallery2024 = [
  'IMG_2561.JPG', 'IMG_2562.JPG', 'IMG_2563.JPG', 'IMG_2564.JPG',
  'IMG_2565.JPG', 'IMG_2566.JPG', 'IMG_2567.JPG', 'IMG_2568.JPG',
  'IMG_2569.JPG', 'IMG_2570.JPG', 'IMG_2571.JPG', 'IMG_2572.JPG',
  'IMG_2573.JPG', 'IMG_2574.JPG', 'IMG_2578.JPG', 'IMG_2580.JPG',
];

for (const filename of gallery2024) {
  mappings.push([
    `public/old/2024/${filename}`,
    `public/assets/archive/2024/gallery/${filename}`,
  ]);
}

await access(path.join(legacyRoot, 'public', 'images', 'ashholelogo.jpg')).catch(() => {
  throw new Error(`ASHHOLE90 source not found at ${legacyRoot}. Pass its path: npm run assets:legacy -- /path/to/ashhole90`);
});

let copied = 0;
for (const [sourceRelative, targetRelative] of mappings) {
  const source = path.join(legacyRoot, sourceRelative);
  const target = path.resolve(targetRelative);
  await access(source).catch(() => {
    throw new Error(`Expected legacy asset is missing: ${source}`);
  });
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  copied += 1;
}

console.log(`Copied ${copied} curated ASHHOLE assets from ${legacyRoot}.`);
console.log('No unrelated legacy files were copied. The original logo remains managed by assets:sync and its byte-level SHA check.');
