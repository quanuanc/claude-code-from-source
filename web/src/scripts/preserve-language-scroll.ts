import { navigate } from 'astro:transitions/client';

const STORAGE_KEY = 'ccfs:language-switch-scroll';
const MAX_AGE_MS = 30_000;
const HEADER_OFFSET_PX = 72;

type StoredScroll = {
  path: string;
  ratio: number;
  articleRatio: number | null;
  childIndex: number | null;
  childRatio: number | null;
  x: number;
  createdAt: number;
};

function scrollableHeight(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

function getArticle(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.chapter-prose');
}

function getDocumentTop(element: Element): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

function getArticleRatio(article: HTMLElement): number | null {
  const articleTop = getDocumentTop(article);
  const articleScrollable = Math.max(0, article.scrollHeight - window.innerHeight + HEADER_OFFSET_PX);
  if (articleScrollable <= 0) return null;

  return clamp((window.scrollY - articleTop + HEADER_OFFSET_PX) / articleScrollable);
}

function getTopArticleChildPosition(article: HTMLElement): Pick<StoredScroll, 'childIndex' | 'childRatio'> {
  const children = Array.from(article.children) as HTMLElement[];
  const viewportLine = HEADER_OFFSET_PX;

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    const rect = child.getBoundingClientRect();
    if (rect.bottom < viewportLine) continue;

    const visibleOffset = viewportLine - rect.top;
    const childRatio = rect.height > 0 ? clamp(visibleOffset / rect.height) : 0;
    return { childIndex: index, childRatio };
  }

  return { childIndex: null, childRatio: null };
}

function readStoredScroll(): StoredScroll | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as StoredScroll;
    if (!payload || payload.path !== currentPath()) return null;
    if (Date.now() - payload.createdAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return payload;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function storeScrollFor(url: URL): StoredScroll {
  const maxScroll = scrollableHeight();
  const article = getArticle();
  const childPosition = article
    ? getTopArticleChildPosition(article)
    : { childIndex: null, childRatio: null };

  const payload: StoredScroll = {
    path: `${url.pathname}${url.search}`,
    ratio: maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0,
    articleRatio: article ? getArticleRatio(article) : null,
    childIndex: childPosition.childIndex,
    childRatio: childPosition.childRatio,
    x: window.scrollX,
    createdAt: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

function getRestoreTop(payload: StoredScroll): number {
  const article = getArticle();

  if (
    article &&
    payload.childIndex !== null &&
    payload.childRatio !== null &&
    article.children[payload.childIndex] instanceof HTMLElement
  ) {
    const child = article.children[payload.childIndex] as HTMLElement;
    const childTop = getDocumentTop(child);
    return childTop + child.getBoundingClientRect().height * payload.childRatio - HEADER_OFFSET_PX;
  }

  if (article && payload.articleRatio !== null) {
    const articleTop = getDocumentTop(article);
    const articleScrollable = Math.max(0, article.scrollHeight - window.innerHeight + HEADER_OFFSET_PX);
    return articleTop - HEADER_OFFSET_PX + articleScrollable * payload.articleRatio;
  }

  return scrollableHeight() * payload.ratio;
}

function restoreScroll(payload: StoredScroll, removeStoredPayload: boolean) {
  if (payload.path !== currentPath()) return;
  if (removeStoredPayload) sessionStorage.removeItem(STORAGE_KEY);

  const top = Math.round(clamp(getRestoreTop(payload), 0, scrollableHeight()));
  window.scrollTo({ left: payload.x, top, behavior: 'instant' });
}

function restoreScrollInStages(payload: StoredScroll, removeStoredPayload = true) {
  // Restore once immediately after Astro swaps the DOM, then repeat for a few
  // frames so late font/layout changes in dev mode do not leave the page at top.
  const delays = [0, 16, 80, 180];
  for (const delay of delays) {
    window.setTimeout(() => restoreScroll(payload, delay === delays[delays.length - 1] && removeStoredPayload), delay);
  }
}

function restoreScrollIfNeeded() {
  const payload = readStoredScroll();
  if (!payload) return;
  restoreScrollInStages(payload);
}

function isPlainPrimaryClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

async function handleLanguageSwitch(event: MouseEvent, link: HTMLAnchorElement) {
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (`${url.pathname}${url.search}` === currentPath()) return;

  event.preventDefault();

  const payload = storeScrollFor(url);

  const restoreAfterSwap = () => restoreScrollInStages(payload, false);
  document.addEventListener('astro:after-swap', restoreAfterSwap, { once: true });

  try {
    await navigate(url.href);
    restoreScrollInStages(payload);
  } catch {
    document.removeEventListener('astro:after-swap', restoreAfterSwap);
    window.location.href = url.href;
  }
}

export function installLanguageScrollPreserver() {
  if ((window as typeof window & { __ccfsLanguageScrollPreserver?: boolean }).__ccfsLanguageScrollPreserver) {
    return;
  }
  (window as typeof window & { __ccfsLanguageScrollPreserver?: boolean }).__ccfsLanguageScrollPreserver = true;

  document.addEventListener('click', (event) => {
    if (!isPlainPrimaryClick(event)) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[data-preserve-scroll="language-switch"]');
    if (!link || !link.href) return;

    void handleLanguageSwitch(event, link);
  }, { capture: true });

  document.addEventListener('astro:after-swap', restoreScrollIfNeeded);
  document.addEventListener('astro:page-load', restoreScrollIfNeeded);
  window.addEventListener('pageshow', restoreScrollIfNeeded);
  restoreScrollIfNeeded();
}
