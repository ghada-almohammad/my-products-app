export default function HeaderBar({ brand }) {
return (
<header className="header">
<div className="brand">
{brand?.logoSrc ? (
<img src={brand.logoSrc} alt={brand.name} className="logo" />
) : (
<div className="logo-placeholder" />
)}
<span className="brand-name">{brand?.name ?? 'Brand'}</span>
</div>
<div className="header-right">
<input className="search" placeholder="Search (mock)" />
</div>
</header>
);
}