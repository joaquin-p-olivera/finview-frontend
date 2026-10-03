// Product search for the cart suggestions and the products page. Runs on the
// cached product list, so it also works without signal.

const normalize = (text) =>
  (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const matchesProduct = (product, query) => {
  const q = normalize(query);
  if (!q) return true;
  return [product.name, ...(product.aliases || [])].some((name) => normalize(name).includes(q));
};

// Best matches first: names that start with what was typed, then the
// products bought most often.
export const suggestProducts = (products, query, limit = 6) => {
  const q = normalize(query);
  if (!q) return [];
  const startsWith = (p) =>
    [p.name, ...(p.aliases || [])].some((name) => normalize(name).startsWith(q)) ? 0 : 1;
  return (products || [])
    .filter((p) => matchesProduct(p, q))
    .sort((a, b) => startsWith(a) - startsWith(b) || b.times_bought - a.times_bought)
    .slice(0, limit);
};
