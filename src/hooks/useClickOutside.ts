import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  ignoreRef?: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ignoreRef?.current?.contains(target)) {
        return;
      }
      if (!el.contains(target)) {
        handler();
      }
    };

    document.addEventListener("pointerdown", listener);
    return () => {
      document.removeEventListener("pointerdown", listener);
    };
  }, [ref, handler, ignoreRef]);
}
