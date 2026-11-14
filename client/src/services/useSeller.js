import { useEffect, useState } from 'react';
import { getSeller } from './productService.js';

let cache;
export function useSeller() {
  const [seller, setSeller] = useState(null);
  useEffect(() => {
    cache = cache || getSeller().catch(() => { cache = undefined; return null; });
    let live = true;
    cache.then((s) => live && setSeller(s)).catch(() => {});
    return () => { live = false; };
  }, []);
  return seller;
}
