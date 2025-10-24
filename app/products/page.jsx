'use client';

import { useMemo, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import './styles.css';
import FiltersSidebar from './components/FiltersSidebar';
import ProductCard from './components/ProductCard';

const ALL_CATEGORIES = ['electronics', 'clothing', 'home', 'sports'];
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 1000;

/** RNG seeded */
function createSeededInt(min, max, seedInit = 1337) {
  let seed = seedInit >>> 0;
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const r = seed / 2 ** 32;
    return Math.floor(r * (max - min + 1)) + min;
  };
}

/** seeded to solve Hydration*/
function generateProductsDeterministic(count = 50, seed = 1337) {
  const pickCat = createSeededInt(0, ALL_CATEGORIES.length - 1, seed ^ 0x9e3779b9);
  const randSeed = createSeededInt(0, 2 ** 31 - 1, seed ^ 0x85ebca6b);

  const ranges = {
    electronics: [100, 1000],
    clothing: [10, 200],
    home: [20, 600],
    sports: [15, 400],
  };

  const out = [];
  for (let i = 0; i < count; i++) {
    const category = ALL_CATEGORIES[pickCat()];
    const [pmin, pmax] = ranges[category];
    const price = createSeededInt(pmin, pmax, randSeed())();
    out.push({
      id: i + 1,
      name: `${category.toUpperCase()} Item #${i + 1}`,
      price,
      category,
      //image: `/placeholder-${(i % 5) + 1}.png`, if we have image for every product
      image: `/placeholder.png`,
    });
  }
  return out;
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // بيانات ثابتة (بدون useEffect/ setState)
  const products = useMemo(() => generateProductsDeterministic(50, 1337), []);

  // URL -> state قيم افتراضية 
  const minPrice = useMemo(() => {
    const v = Number(searchParams.get('minPrice'));
    if (!Number.isFinite(v) || v < DEFAULT_MIN) return DEFAULT_MIN;
    return Math.min(v, DEFAULT_MAX);
  }, [searchParams]);

  const maxPrice = useMemo(() => {
    const v = Number(searchParams.get('maxPrice'));
    if (!Number.isFinite(v) || v > DEFAULT_MAX) return DEFAULT_MAX;
    return v <= minPrice ? DEFAULT_MAX : v;
  }, [searchParams, minPrice]);

  const selectedCategories = useMemo(() => {
    const cats = searchParams.getAll('category');
    return cats.filter((c) => ALL_CATEGORIES.includes(c));
  }, [searchParams]);

  // URL helpers
  function buildURL(next = {}) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.categories) {
      params.delete('category');
      next.categories.forEach((c) => params.append('category', c));
    }
    if (typeof next.min === 'number') {
      if (next.min <= DEFAULT_MIN) params.delete('minPrice');
      else params.set('minPrice', String(Math.floor(next.min)));
    }
    if (typeof next.max === 'number') {
      if (next.max >= DEFAULT_MAX) params.delete('maxPrice');
      else params.set('maxPrice', String(Math.floor(next.max)));
    }

    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pushURL = (url) => startTransition(() => router.push(url, { scroll: false }));
  const prefetchURL = (url) => {
    try { if (typeof router.prefetch === 'function') router.prefetch(url); } catch {}
  };

  // فلترة مشتقة
  const filtered = useMemo(() => {
    const catSet = new Set(selectedCategories);
    return products.filter((p) => {
      const catOk = catSet.size === 0 || catSet.has(p.category);
      const priceOk = p.price >= minPrice && p.price <= maxPrice;
      return catOk && priceOk;
    });
  }, [products, selectedCategories, minPrice, maxPrice]);

  return (
    <div className="products-page">
      <div className="layout">
        <aside className="sidebar">
          <FiltersSidebar
            key={`${minPrice}-${maxPrice}-${selectedCategories.join(',')}`}
            allCategories={ALL_CATEGORIES}
            selected={selectedCategories}
            min={minPrice}
            max={maxPrice}
            onToggleCategory={(c) => {
              const set = new Set(selectedCategories);
              set.has(c) ? set.delete(c) : set.add(c);
              pushURL(buildURL({ categories: Array.from(set) }));
            }}
            onHoverCategory={(c) => {
              const set = new Set(selectedCategories);
              set.has(c) ? set.delete(c) : set.add(c);
              prefetchURL(buildURL({ categories: Array.from(set) }));
            }}
            onChangeMin={(v) => pushURL(buildURL({ min: Math.min(v, maxPrice) }))}
            onChangeMax={(v) => pushURL(buildURL({ max: Math.max(v, minPrice) }))}
            onHoverPrice={(min, max) => prefetchURL(buildURL({ min, max }))}
            onClear={() => pushURL(pathname)}
          />
        </aside>

        <main className="content">
          <div className="summary">
            <h1>Products:</h1>
            <div className="meta">
              Showing <b>{filtered.length}</b> · Price {minPrice} – {maxPrice}
              {selectedCategories.length > 0 && (
                <>
                  {' '}· {selectedCategories.map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                </>
              )}
            </div>
          </div>

          {isPending && (
            <div className="loading delayed">
              <span className="dot" /> Updating results…
            </div>
          )}

          <ul className="grid">
            {filtered.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
