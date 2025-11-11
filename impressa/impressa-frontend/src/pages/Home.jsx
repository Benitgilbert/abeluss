import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StoreHeader from "../components/StoreHeader";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, t] = await Promise.all([
          api.get("/products/featured/list", { params: { limit: 8 } }),
          api.get("/products/trending", { params: { limit: 8, days: 60 } }),
        ]);
        setFeatured(f.data || []);
        setTrending(t.data || []);
      } catch (e) {
        console.error("Failed to load homepage products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero */}
        <section className="bg-white rounded-lg border p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Welcome to impressa</h1>
            <p className="text-gray-600 mt-2">Custom products, professional finishing, and fast delivery.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/shop" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Shop now</Link>
              <Link to="/track" className="px-4 py-2 border rounded hover:bg-gray-50">Track order</Link>
            </div>
          </div>
          <div className="w-full sm:w-1/3 h-32 bg-blue-50 rounded" />
        </section>

        {/* Featured */}
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-semibold">Featured</h2>
            <Link to="/shop" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                  {p.image ? (
                    <img src={assetUrl(p.image)} alt={p.name} className="aspect-[4/3] object-cover group-hover:opacity-95" />
                  ) : (
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <div className="p-3">
                    <div className="font-medium line-clamp-1">{p.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{p.description || ""}</div>
                    <div className="mt-1 font-semibold">{formatRwf(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-semibold">Trending</h2>
            <Link to="/shop" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {trending.map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                  {p.image ? (
                    <img src={assetUrl(p.image)} alt={p.name} className="aspect-[4/3] object-cover group-hover:opacity-95" />
                  ) : (
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <div className="p-3">
                    <div className="font-medium line-clamp-1">{p.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{p.description || ""}</div>
                    <div className="mt-1 font-semibold">{formatRwf(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
