import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { request, apiError } from "../../api";
import ProductCard from "../../components/ProductCard";

function State({
  loading,
  error
}: {
  loading: boolean;
  error?: string;
}) {
  if (loading) {
    return <div className="state">Loading products...</div>;
  }

  if (error) {
    return <div className="state error">{error}</div>;
  }

  return null;
}

export function Products() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();

  const [p, setP] = useState<any>({ items: [] });
  const [q, setQ] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("");
  const [gender, setGender] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [discounted, setDiscounted] = useState(false);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24"
      });

      if (q) params.set("search", q);
      if (sort) params.set("sort", sort);
      if (category) params.set("category", category);
      if (gender) params.set("gender", gender);
      if (brand) params.set("brand", brand);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (availability) params.set("availability", availability);
      if (discounted) params.set("discounted", "true");

      request("get", "/products?" + params)
        .then((r) => {
          setP(r.data);
          setErr("");
        })
        .catch((e) => {
          setErr(apiError(e));
        });
    }, 250);

    return () => clearTimeout(t);
  }, [
    q,
    sort,
    category,
    gender,
    brand,
    minPrice,
    maxPrice,
    availability,
    discounted,
    page
  ]);

  const reset = () => {
    setQ("");
    setSort("");
    setGender("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("");
    setDiscounted(false);
    setPage(1);
  };

  return (
    <main className="page products-page">
      <div className="section-head">
        <div>
          <span className="eyebrow">CATALOG</span>

          <h1>
            {category
              ? category.replace(/-/g, " ")
              : "Shop"}
          </h1>

          <p className="catalog-subtitle">
            Discover products selected for everyday shopping.
          </p>
        </div>
      </div>

      <div className="filter-panel">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search products, brands, SKUs..."
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="popular">Best sellers</option>
          <option value="discount">Discount</option>
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">All genders</option>
          <option>Male</option>
          <option>Female</option>
          <option>Unisex</option>
        </select>

        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Brand"
        />

        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min PKR"
        />

        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max PKR"
        />

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="">Any availability</option>
          <option value="true">In stock</option>
          <option value="false">Unavailable</option>
        </select>

        <label className="check">
          <input
            type="checkbox"
            checked={discounted}
            onChange={(e) => setDiscounted(e.target.checked)}
          />
          On sale
        </label>

        <button
          className="btn ghost"
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <State
        loading={!p.items && !err}
        error={err}
      />

      <div className="product-grid">
        {p.items?.map((x: any) => (
          <ProductCard
            key={x._id}
            p={x}
          />
        ))}
      </div>

      {!p.items?.length && !err && (
        <div className="empty">
          No products found.
        </div>
      )}

      <div className="pagination">
        {Array.from(
          { length: p.pages || 0 },
          (_, i) => (
            <button
              key={i}
              className={
                page === i + 1 ? "active" : ""
              }
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </main>
  );
}
