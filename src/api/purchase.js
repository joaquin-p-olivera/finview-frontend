import api from "./client";

export const listPurchaseCategories = async () => {
  const { data } = await api.get("/purchase/categories");
  return data;
};

export const createPurchaseCategory = async (category) => {
  const { data } = await api.post("/purchase/categories", category);
  return data;
};

export const updatePurchaseCategory = async (id, category) => {
  const { data } = await api.put(`/purchase/categories/${id}`, category);
  return data;
};

export const deletePurchaseCategory = async (id) => {
  const { data } = await api.delete(`/purchase/categories/${id}`);
  return data;
};

export const listPurchaseProducts = async () => {
  const { data } = await api.get("/purchase/products");
  return data;
};

export const updatePurchaseProduct = async (id, product) => {
  const { data } = await api.put(`/purchase/products/${id}`, product);
  return data;
};

export const mergePurchaseProduct = async (id, intoProductId) => {
  const { data } = await api.post(`/purchase/products/${id}/merge`, { into_product_id: intoProductId });
  return data;
};

export const countUnlinkedPurchaseItems = async () => {
  const { data } = await api.get("/purchase/products/unlinked-items");
  return data.count;
};

export const linkPurchaseItemsToProducts = async () => {
  const { data } = await api.post("/purchase/products/link-items");
  return data;
};

export const listPurchaseStores = async () => {
  const { data } = await api.get("/purchase/stores");
  return data;
};

export const createPurchaseStore = async (store) => {
  const { data } = await api.post("/purchase/stores", store);
  return data;
};

export const updatePurchaseStore = async (id, store) => {
  const { data } = await api.put(`/purchase/stores/${id}`, store);
  return data;
};

export const deletePurchaseStore = async (id) => {
  const { data } = await api.delete(`/purchase/stores/${id}`);
  return data;
};

export const listPurchaseCarts = async (limit = 20) => {
  const { data } = await api.get(`/purchase/carts?limit=${limit}`);
  return data;
};

export const getActiveCart = async () => {
  const { data } = await api.get("/purchase/carts/active");
  return data;
};

export const createPurchaseCart = async (cart) => {
  const { data } = await api.post("/purchase/carts", cart);
  return data;
};

export const getPurchaseCart = async (id) => {
  const { data } = await api.get(`/purchase/carts/${id}`);
  return data;
};

export const addCartItem = async (cartId, item) => {
  const { data } = await api.post(`/purchase/carts/${cartId}/items`, item);
  return data;
};

export const updateCartItem = async (cartId, itemId, item) => {
  const { data } = await api.put(`/purchase/carts/${cartId}/items/${itemId}`, item);
  return data;
};

export const deleteCartItem = async (cartId, itemId) => {
  const { data } = await api.delete(`/purchase/carts/${cartId}/items/${itemId}`);
  return data;
};

export const completeCart = async (cartId) => {
  const { data } = await api.post(`/purchase/carts/${cartId}/complete`);
  return data;
};

export const listPurchaseLists = async () => {
  const { data } = await api.get("/purchase/lists");
  return data;
};

export const createPurchaseList = async (list) => {
  const { data } = await api.post("/purchase/lists", list);
  return data;
};

export const getPurchaseList = async (id) => {
  const { data } = await api.get(`/purchase/lists/${id}`);
  return data;
};

export const updatePurchaseList = async (id, list) => {
  const { data } = await api.put(`/purchase/lists/${id}`, list);
  return data;
};

export const deletePurchaseList = async (id) => {
  const { data } = await api.delete(`/purchase/lists/${id}`);
  return data;
};

export const addListItem = async (listId, item) => {
  const { data } = await api.post(`/purchase/lists/${listId}/items`, item);
  return data;
};

export const updateListItem = async (listId, itemId, item) => {
  const { data } = await api.put(`/purchase/lists/${listId}/items/${itemId}`, item);
  return data;
};

export const deleteListItem = async (listId, itemId) => {
  const { data } = await api.delete(`/purchase/lists/${listId}/items/${itemId}`);
  return data;
};

export const addListToCart = async (listId, cartId) => {
  const { data } = await api.post(`/purchase/lists/${listId}/add-to-cart/${cartId}`);
  return data;
};

export const addListItemToCart = async (listId, itemId, cartId, { price, quantity }) => {
  const { data } = await api.post(`/purchase/lists/${listId}/items/${itemId}/add-to-cart/${cartId}`, { price, quantity });
  return data;
};

export const getPurchaseAnalytics = async (months = 12) => {
  const { data } = await api.get(`/purchase/analytics?months=${months}`);
  return data;
};

export const getPurchaseProductPrices = async (productId) => {
  const { data } = await api.get(`/purchase/analytics/products/${productId}/prices`);
  return data;
};

export const getPurchaseStats = async (days = 30) => {
  const { data } = await api.get(`/purchase/stats?days=${days}`);
  return data;
};
