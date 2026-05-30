import { useEffect, useState, type RefObject } from 'react';

/**
 * useInView — IntersectionObserver-backed visibility flag.
 *
 * Returns true when the observed element is intersecting the viewport
 * (extended by `rootMargin`). Used to lazily mount expensive subtrees
 * like WebGL canvases so off-screen items consume no GPU.
 *
 * Once `triggerOnce` is true, the value latches to `true` on first reveal
 * and stays there — useful for one-time hydration of placeholder content.
 */
export function useInView<T extends Element>(
  ref: RefObject<T>,
  options: { rootMargin?: string; threshold?: number; triggerOnce?: boolean } = {},
): boolean {
  const { rootMargin = '200px', threshold = 0, triggerOnce = false } = options;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, triggerOnce]);

  return inView;
}
