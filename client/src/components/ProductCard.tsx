import { Link } from "react-router-dom";
import { money } from "./Layout";

export default function ProductCard({ p }: { p: any }) {
  const price = Number(p.salePrice || p.originalPrice || 0);
  const original = Number(p.originalPrice || price);
  const discount =
    original > price ? Math.round((1 - price / original) * 100) : 0;
  const stock = Number(p.availableStock ?? p.stock ?? 0);

  const image =
    p.images?.[0] ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85";

  return (
    <article className="product-card">
      <div className="product-media">
        <Link
          className="product-image-link"
          to={`/product/${p.slug}`}
          aria-label={`View ${p.name}`}
        >
          <div className="product-image-wrap">
            <img
              loading="lazy"
              src={image}
              alt={p.name}
            />

            {discount > 0 && (
              <span className="product-badge">
                -{discount}%
              </span>
            )}

            {stock > 0 && stock < 5 && (
              <span className="product-stock-badge">
                Only {stock} left
              </span>
            )}
          </div>
        </Link>

        <button
          className="wishlist"
          type="button"
          aria-label={`Save ${p.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          &#9825;
        </button>
      </div>

      <div className="product-copy">
        <div className="product-topline">
          <span className="product-meta">
            {p.brand || p.category?.name || "NovaCart"}
          </span>

          {p.gender && (
            <span className="product-gender">
              {p.gender}
            </span>
          )}
        </div>

        <Link
          className="product-title-link"
          to={`/product/${p.slug}`}
        >
          <h3>{p.name}</h3>
        </Link>

        <div className="rating-row">
          <span className="rating-stars">
            &#9733;
          </span>
          <span>
            {Number(p.rating || 0).toFixed(1)}
          </span>
          <span className="rating-reviews">
            ({p.reviewCount || 0})
          </span>
        </div>

        <div className="price-row">
          <strong>{money(price)}</strong>

          {discount > 0 && (
            <del>{money(original)}</del>
          )}
        </div>

        <div className="product-foot">
          <span
            className={
              stock > 0
                ? stock < 5
                  ? "stock low"
                  : "stock"
                : "stock out"
            }
          >
            {stock > 0
              ? stock < 5
                ? `${stock} left`
                : "In stock"
              : "Out of stock"}
          </span>

          <Link
            className="view-link"
            to={`/product/${p.slug}`}
          >
            View product <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
