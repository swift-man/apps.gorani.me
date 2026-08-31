import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';

import HomeVideo from '../src/components/site/HomeVideo.astro';

const autoplayVideo = {
  enabled: true,
  sourceMode: 'external' as const,
  uploadedFile: '',
  externalUrl: 'https://media.example.com/home.mp4',
  poster: '/og-gorani.webp',
  autoplay: true,
  muted: true,
  loop: true,
  controls: false,
  src: 'https://media.example.com/home.mp4',
};

describe('HomeVideo', () => {
  test('renders safe initial playback controls without an autoplay attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomeVideo, {
      props: {
        video: autoplayVideo,
        label: 'Gorani Apps 소개 동영상',
        fallbackText: '이 브라우저에서는 동영상을 재생할 수 없습니다.',
      },
    });
    const openingTag = html.match(/<video\b[^>]*>/)?.[0];
    const sourceTag = html.match(/<source\b[^>]*>/)?.[0];

    expect(openingTag).toBeDefined();
    expect(sourceTag).toBeDefined();
    expect(openingTag).toMatch(/\scontrols(?:[=\s>]|$)/);
    expect(openingTag).toContain('data-autoplay="true"');
    expect(openingTag).toContain('data-controls="false"');
    expect(openingTag).toMatch(/\smuted(?:[=\s>]|$)/);
    expect(openingTag).toContain('poster="/og-gorani.webp"');
    expect(openingTag).toContain('aria-label="Gorani Apps 소개 동영상"');
    expect(openingTag).not.toMatch(/\sautoplay(?:[\s=>]|$)/);
    expect(sourceTag).toContain('src="https://media.example.com/home.mp4"');
    expect(sourceTag).toContain('type="video/mp4"');
    expect(html).toContain('이 브라우저에서는 동영상을 재생할 수 없습니다.');
  });
});
