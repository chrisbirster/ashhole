const photos = [
  '/old/img216_1990.jpg',
  '/old/img217_1990.jpg',
  '/old/img046.jpg',
  '/old/img048.jpg',
  '/old/img051.jpg',
  '/old/img052.jpg',
  '/old/img053.jpg',
  '/old/img054.jpg',
  '/old/img066.jpg',
  '/old/img063.jpg',
  '/old/img049.jpg',
  '/old/img064.jpg',
];

export default function OldPics() {
  return (
    <div class="legacy-page center">
      <div class="legacy-photo-stack">
        <p class="year-label">Early ASHHOLE 1990-91</p>
        {photos.map((src) => <img src={src} alt="Early ASHHOLE 1990-91" loading="lazy" />)}
      </div>
    </div>
  );
}
