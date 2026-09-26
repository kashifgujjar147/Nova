export type StockProduct = { stock?: number; variants?: Array<{ stock?: number; active?: boolean }> };
export function getTotalVariantStock(product: StockProduct): number { return (product.variants ?? []).filter(v=>v.active !== false).reduce((n,v)=>n+Math.max(0,Math.trunc(Number(v.stock||0))),0); }
export function getAvailableStock(product: StockProduct): number { return (product.variants?.length ?? 0) > 0 ? getTotalVariantStock(product) : Math.max(0,Math.trunc(Number(product.stock||0))); }
export function hasAvailableStock(product: StockProduct, quantity=1): boolean { return getAvailableStock(product) >= quantity; }
export function isOutOfStock(product: StockProduct): boolean { return getAvailableStock(product) <= 0; }
export function isLowStock(product: StockProduct, threshold=5): boolean { const stock=getAvailableStock(product); return stock>0 && stock<=threshold; }
