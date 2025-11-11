import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StoreHeader from "../components/StoreHeader";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { ids, remove } = useWishlist();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      if (!ids.length) { setProducts([]); return; }
      try {
        const res = await api.get("/products/by-ids", { params: { ids: ids.join(",") } });
        setProducts(res.data || []);
      } catch (e) {
        console.error("Failed to load wishlist products", e);
      }
    })();
  }, [ids]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <Link to="/shop" className="text-sm text-blue-600 hover:underline">Continue shopping</Link>
        </div>
        {ids.length === 0 ? (
          <div className="bg-white p-6 border rounded">Your wishlist is empty.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p)=> (
              <div key={p._id} className="bg-white rounded border overflow-hidden">
                {p.image ? (
                  <img src={assetUrl(p.image)} alt={p.name} className="aspect-[4/3] object-cover" />
                ) : (
                  <div className="aspect-[4/3] bg-gray-100" />
                )}
                <div className="p-3">
                  <div className="font-medium line-clamp-1">{p.name}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{p.description || ""}</div>
                  <div className="mt-1 font-semibold">{formatRwf(p.price)}</div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/product/${p._id}`} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">View</Link>
                    <button onClick={()=>remove(p._id)} className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
