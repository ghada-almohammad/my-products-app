'use client';
import { useState } from 'react';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 1000;

export default function FiltersSidebar({
  allCategories, selected, min, max,
  onToggleCategory, onHoverCategory,
  onChangeMin, onChangeMax, onHoverPrice, onClear,
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  const commitMin = (v) => onChangeMin(Math.max(DEFAULT_MIN, Math.min(v, localMax)));
  const commitMax = (v) => onChangeMax(Math.min(DEFAULT_MAX, Math.max(v, localMin)));

  return (
    <div className="filters">
      <div className="filters-head">
        <h2 className="section-title">Filters</h2>
        <button className="clear" onClick={onClear}>Clear all</button>
      </div>

      {/* Price FIRST on mobile */}
      <div className="section price-block" onMouseEnter={() => onHoverPrice(localMin, localMax)}>
        <div className="section-title">Price range</div>
        <div className="range-row">
          <input
            type="number"
            className="num-input"
            value={localMin}
            min={DEFAULT_MIN}
            max={localMax}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            onBlur={() => commitMin(localMin)}
          />
          <span>—</span>
          <input
            type="number"
            className="num-input"
            value={localMax}
            min={localMin}
            max={DEFAULT_MAX}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            onBlur={() => commitMax(localMax)}
          />
        </div>
        <div className="sliders">
          <input
            type="range"
            min={DEFAULT_MIN}
            max={DEFAULT_MAX}
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            onMouseUp={() => commitMin(localMin)}
            onTouchEnd={() => commitMin(localMin)}
          />
          <input
            type="range"
            min={DEFAULT_MIN}
            max={DEFAULT_MAX}
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            onMouseUp={() => commitMax(localMax)}
            onTouchEnd={() => commitMax(localMax)}
          />
        </div>
        <div className="hint">Drag sliders then release to apply. Hover prefetches.</div>
      </div>

      {/* Categories */}
      <div className="section cats-block">
        <div className="section-title">Categories</div>
        <ul className="cat-list">
          {allCategories.map((c) => {
            const checked = selected.includes(c);
            return (
              <li key={c} className="cat-item" onMouseEnter={() => onHoverCategory(c)}>
                <input id={`cat-${c}`} type="checkbox" checked={checked} onChange={() => onToggleCategory(c)} />
                <label htmlFor={`cat-${c}`}>{c}</label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
