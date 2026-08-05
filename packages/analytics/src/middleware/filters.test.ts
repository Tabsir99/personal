import { describe, expect, it } from 'vitest';
import { ignoreStaticPaths } from './filters';

function allows(path: string): boolean {
  return ignoreStaticPaths(new URL(`https://tabsircg.com${path}`));
}

describe('ignoreStaticPaths', () => {
  it('keeps document paths', () => {
    expect(allows('/')).toBe(true);
    expect(allows('/blog/foo')).toBe(true);
    expect(allows('/about')).toBe(true);
  });

  it('drops framework internals and asset directories', () => {
    expect(allows('/_next/static/chunk.js')).toBe(false);
    expect(allows('/api/blogs')).toBe(false);
    expect(allows('/assets/logo.svg')).toBe(false);
    expect(allows('/.well-known/acme')).toBe(false);
  });

  it('drops static file extensions', () => {
    expect(allows('/og/cover.png')).toBe(false);
    expect(allows('/data.json')).toBe(false);
  });

  it('keeps crawler-facing files the extension list would otherwise drop', () => {
    for (const path of ['/robots.txt', '/llms.txt', '/llms-full.txt', '/sitemap.xml', '/blog/sitemap-0.xml']) {
      expect([path, allows(path)]).toEqual([path, true]);
    }
  });

  it('matches a prefix only on a segment boundary', () => {
    expect(allows('/apidocs')).toBe(true);
    expect(allows('/api')).toBe(false);
  });

  it('normalises case and duplicate slashes', () => {
    expect(allows('/_NEXT/static/chunk.js')).toBe(false);
    expect(allows('//assets//logo.svg')).toBe(false);
  });
});
