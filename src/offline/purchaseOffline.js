import { useSyncExternalStore } from "react";
import { enqueue, getOutboxState, subscribeOutbox } from "./outbox";
import { readJson, writeJson, newId } from "./storage";

// Offline layer for the purchase module: the last cart, lists and categories
// the server returned are kept in localStorage so the pages open instantly and
// without signal, and queued writes (see outbox.js) are laid over them so the
// screen always shows what the user did, synced or not.

export const useOutbox = () => useSyncExternalStore(subscribeOutbox, getOutboxState);

export const cacheKeys = {
  cart: (id) => `cart.${id}`,
  list: (id) => `list.${id}`,
  activeCart: "purchaseActiveCart",
  categories: "purchaseCategories",
  dashboard: "purchaseDashboard",
};

export const readCache = (key) => readJson(key);
export const writeCache = (key, value) => writeJson(key, value);

const cartItemsUrl = (cartId) => `/purchase/carts/${cartId}/items`;

export const queueAddCartItem = (cartId, item) => {
  const id = newId();
  enqueue({
    kind: "cart-add",
    cartId,
    itemId: id,
    label: item.product_name,
    method: "post",
    url: cartItemsUrl(cartId),
    data: { id, ...item },
  });
  return id;
};

export const queueUpdateCartItem = (cartId, itemId, updates, label) =>
  enqueue({
    kind: "cart-update",
    cartId,
    itemId,
    label,
    method: "put",
    url: `${cartItemsUrl(cartId)}/${itemId}`,
    data: updates,
  });

export const queueDeleteCartItem = (cartId, itemId, label) =>
  enqueue({
    kind: "cart-delete",
    cartId,
    itemId,
    label,
    method: "delete",
    url: `${cartItemsUrl(cartId)}/${itemId}`,
  });

export const queueUpdateListItem = (listId, itemId, updates, label) =>
  enqueue({
    kind: "list-update",
    listId,
    itemId,
    label,
    method: "put",
    url: `/purchase/lists/${listId}/items/${itemId}`,
    data: updates,
  });

const categoryName = (categories, categoryId) =>
  categories?.find((c) => c.id === categoryId)?.name ?? null;

// Returns the cart as it will be once every queued write for it is sent.
// Items touched by a queued write are flagged with `pending`.
export const applyCartOps = (cart, ops, categories) => {
  if (!cart) return cart;
  let items = [...(cart.items || [])];
  ops
    .filter((op) => op.cartId === cart.id)
    .forEach((op) => {
      if (op.kind === "cart-add") {
        if (!items.some((item) => item.id === op.itemId)) {
          items.push({
            ...op.data,
            id: op.itemId,
            cart_id: cart.id,
            category_name: categoryName(categories, op.data.category_id),
            created_at: new Date(op.createdAt).toISOString(),
            pending: true,
          });
        }
      } else if (op.kind === "cart-update") {
        items = items.map((item) =>
          item.id === op.itemId
            ? {
                ...item,
                ...Object.fromEntries(Object.entries(op.data).filter(([, v]) => v !== undefined && v !== null)),
                ...(op.data.category_id ? { category_name: categoryName(categories, op.data.category_id) } : {}),
                pending: true,
              }
            : item
        );
      } else if (op.kind === "cart-delete") {
        items = items.filter((item) => item.id !== op.itemId);
      }
    });
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  return { ...cart, items, total };
};

export const applyListOps = (list, ops) => {
  if (!list) return list;
  const listOps = ops.filter((op) => op.kind === "list-update" && op.listId === list.id);
  if (listOps.length === 0) return list;
  return {
    ...list,
    items: (list.items || []).map((item) =>
      listOps
        .filter((op) => op.itemId === item.id)
        .reduce((acc, op) => ({ ...acc, ...op.data, pending: true }), item)
    ),
  };
};

export const pendingCountFor = (ops, cartId) => ops.filter((op) => op.cartId === cartId).length;
