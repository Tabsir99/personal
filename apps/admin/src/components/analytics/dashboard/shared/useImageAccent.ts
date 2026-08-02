import { useEffect, useState } from "react";

// Average accent colour sampled via canvas, skipping transparent and near-
// white/black pixels. Null on a cross-origin taint or load error.
export function useImageAccent(src: string | null | undefined): string | null {
  const [result, setResult] = useState<{ src: string; color: string } | null>(
    null,
  );

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 16;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const cr = data[i];
          const cg = data[i + 1];
          const cb = data[i + 2];
          const max = Math.max(cr, cg, cb);
          const min = Math.min(cr, cg, cb);
          if (max > 240 && min > 240) continue;
          if (max < 24) continue;
          r += cr;
          g += cg;
          b += cb;
          n++;
        }
        if (n === 0 || cancelled) return;
        setResult({
          src,
          color: `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`,
        });
      } catch {
        // Tainted canvas (cross-origin without CORS) — leave null for fallback.
      }
    };

    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return result && result.src === src ? result.color : null;
}
