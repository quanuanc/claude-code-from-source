const STORAGE_KEY = 'ccfs:language-switch-scroll';

type StoredScroll = {
  path: string;
  ratio: number;
  x: number;
  createdAt: number;
};

function scrollableHeight(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function storeScrollFor(url: URL) {
  const maxScroll = scrollableHeight();
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const payload: StoredScroll = {
    path: `${url.pathname}${url.search}`,
    ratio: Math.min(Math.max(ratio, 0), 1),
    x: window.scrollX,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreScrollIfNeeded() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let payload: StoredScroll | null = null;
  try {
    payload = JSON.parse(raw) as StoredScroll;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  if (!payload || payload.path !== currentPath()) return;

  sessionStorage.removeItem(STORAGE_KEY);

  // Let Astro swap the body, run page scripts, and let fonts/layout settle for a frame.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetY = Math.round(scrollableHeight() * payload!.ratio);
      window.scrollTo({ left: payload!.x, top: targetY, behavior: 'instant' });
    });
  });
}

export function installLanguageScrollPreserver() {
  if ((window as typeof window & { __ccfsLanguageScrollPreserver?: boolean }).__ccfsLanguageScrollPreserver) {
    return;
  }
  (window as typeof window & { __ccfsLanguageScrollPreserver?: boolean }).__ccfsLanguageScrollPreserver = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[data-preserve-scroll="language-switch"]');
    if (!link || !link.href) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (`${url.pathname}${url.search}` === currentPath()) return;

    storeScrollFor(url);
  }, { capture: true });

  document.addEventListener('astro:page-load', restoreScrollIfNeeded);
  window.addEventListener('pageshow', restoreScrollIfNeeded);
  restoreScrollIfNeeded();
}

