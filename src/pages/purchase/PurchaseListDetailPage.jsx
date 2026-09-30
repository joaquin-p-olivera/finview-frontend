import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getPurchaseList,
  addListItem,
  updateListItem,
  deleteListItem,
  getActiveCart,
  addListItemToCart,
} from "../../api/purchase";

function PurchaseListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ product_name: "", quantity: "" });
  const [adding, setAdding] = useState(false);
  const [activeCart, setActiveCart] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [modalData, setModalData] = useState({ price: "", quantity: 1 });
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchData = async () => {
    try {
      const [listData, cartData] = await Promise.all([
        getPurchaseList(id),
        getActiveCart().catch(() => null),
      ]);
      setList(listData);
      setActiveCart(cartData);
    } catch (err) {
      console.error(err);
      navigate("/purchase/lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.product_name.trim()) return;
    
    setAdding(true);
    try {
      await addListItem(id, {
        product_name: newItem.product_name.trim(),
        quantity: newItem.quantity ? parseInt(newItem.quantity) : null,
      });
      setNewItem({ product_name: "", quantity: "" });
      fetchData();
    } catch (err) {
      alert("Error al agregar item");
    } finally {
      setAdding(false);
    }
  };

  const handleOpenModal = async (item) => {
    if (!activeCart) {
      alert("No hay un carrito activo. Creá uno primero en Carrito de Compras.");
      return;
    }
    if (item.is_checked) {
      try {
        await updateListItem(id, item.id, { is_checked: false });
        fetchData();
      } catch (err) {
        alert("Error al desmarcar item");
      }
      return;
    }
    setModalItem(item);
    setModalData({ price: "", quantity: item.quantity || 1 });
  };

  const handleAddToCartSingle = async () => {
    if (!modalData.price || !modalData.quantity) return;
    setAddingToCart(true);
    try {
      await addListItemToCart(id, modalItem.id, activeCart.id, {
        price: parseFloat(modalData.price),
        quantity: parseInt(modalData.quantity),
      });
      await updateListItem(id, modalItem.id, { is_checked: true });
      setModalItem(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(id, itemId);
      fetchData();
    } catch (err) {
      alert("Error al eliminar item");
    }
  };

  const checkedCount = list?.items?.filter(i => i.is_checked).length || 0;
  const totalCount = list?.items?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p>Lista no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link to="/purchase/lists" className="text-lg font-semibold hover:text-indigo-400">← Volver</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">{list.name}</h1>
          <p className="text-slate-400">
            {checkedCount} de {totalCount} productos marcados
          </p>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Producto"
            value={newItem.product_name}
            onChange={(e) => setNewItem((p) => ({ ...p, product_name: e.target.value }))}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
            required
          />
          <input
            type="number"
            placeholder="Cant"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
            className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {adding ? "Agregando..." : "Agregar"}
          </button>
        </form>

        {/* Items List */}
        {totalCount === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            No hay productos en esta lista. Agregá uno arriba.
          </div>
        ) : (
          <ul className="space-y-2">
            {list.items?.map((item) => (
              <li
                key={item.id}
                className={`flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-4 ${
                  item.is_checked ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => handleOpenModal(item)}
                    className="h-5 w-5 rounded-sm border-slate-600 bg-slate-900 text-indigo-500"
                  />
                  <span className={item.is_checked ? "line-through" : ""}>
                    {item.product_name}
                  </span>
                  {item.quantity && (
                    <span className="text-sm text-slate-400">x{item.quantity}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Add to Cart Modal */}
      {modalItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">Agregar al Carrito</h3>
            <p className="mb-4 text-slate-300">
              <span className="font-medium">{modalItem.product_name}</span>
            </p>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={modalData.price}
                  onChange={(e) => setModalData((p) => ({ ...p, price: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={modalData.quantity}
                  onChange={(e) => setModalData((p) => ({ ...p, quantity: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModalItem(null)}
                className="flex-1 rounded-lg border border-slate-700 py-2 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddToCartSingle}
                disabled={addingToCart || !modalData.price}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {addingToCart ? "Agregando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseListDetailPage;
