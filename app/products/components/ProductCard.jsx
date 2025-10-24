'use client';

export default function ProductCard({ product }) {
  return (
    <article className="card" tabIndex={0}>
      <div className="card-media">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="card-body">
        <div className="badge">{product.category}</div>
        <h3 className="title">{product.name}</h3>
        <div className="price">${product.price}</div>
      </div>
    </article>
  );
}
