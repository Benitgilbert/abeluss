import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import "./ProductCreateEditModal.css";

function ProductCreateEditModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [activeTab, setActiveTab] = useState("general");
  const [globalAttributes, setGlobalAttributes] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // For linked products selection
  const [shippingClasses, setShippingClasses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    type: "simple",
    customizable: false,
    customizationOptions: [],
    attributes: [],
    variations: [],
    isDigital: false,
    downloadLink: "",
    crossSells: [],
    upSells: [],
    shippingClass: "",
    featured: false
  });

  const [variationImages, setVariationImages] = useState({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch global attributes and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attrsRes, productsRes, shippingClassesRes] = await Promise.all([
          api.get("/attributes"),
          api.get("/products?limit=100"), // Fetch enough products for selection
          api.get("/shipping-classes")
        ]);
        setGlobalAttributes(attrsRes.data);
        setAllProducts(productsRes.data);
        setShippingClasses(shippingClassesRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        image: product.image || "",
        type: product.type || "simple",
        customizable: !!product.customizable,
        customizationOptions: Array.isArray(product.customizationOptions) ? product.customizationOptions : [],
        attributes: product.attributes || [],
        variations: product.variations || [],
        isDigital: !!product.isDigital,
        downloadLink: product.downloadLink || "",
        crossSells: product.crossSells || [],
        upSells: product.upSells || [],
        shippingClass: product.shippingClass || "",
        featured: !!product.featured
      });
    }
  }, [isEdit, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setForm((f) => ({ ...f, [name]: value === "" ? "" : Number(value) }));
    } else if (name === "customizable") {
      setForm((f) => ({ ...f, customizable: e.target.checked }));
    } else if (name === "isDigital") {
      setForm((f) => ({ ...f, isDigital: e.target.checked }));
    } else if (name === "featured") {
      setForm((f) => ({ ...f, featured: e.target.checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const toggleOption = (opt) => {
    setForm((f) => {
      const has = f.customizationOptions.includes(opt);
      const next = has ? f.customizationOptions.filter((o) => o !== opt) : [...f.customizationOptions, opt];
      return { ...f, customizationOptions: next };
    });
  };

  // Linked Products Management
  const toggleLinkedProduct = (type, productId) => {
    setForm(f => {
      const list = f[type] || [];
      const exists = list.includes(productId);
      const newList = exists ? list.filter(id => id !== productId) : [...list, productId];
      return { ...f, [type]: newList };
    });
  };

  // Attribute Management
  const addAttribute = (globalAttrId) => {
    const globalAttr = globalAttributes.find(a => a._id === globalAttrId);
    if (!globalAttr) return;

    // Check if already added
    if (form.attributes.find(a => a.name === globalAttr.name)) return;

    const newAttr = {
      name: globalAttr.name,
      values: [], // Selected values
      visible: true,
      variation: true,
      globalAttribute: globalAttr._id,
      options: globalAttr.values.map(v => v.name) // Available options
    };

    setForm(f => ({ ...f, attributes: [...f.attributes, newAttr] }));
  };

  const updateAttributeValues = (index, selectedOptions) => {
    const newAttrs = [...form.attributes];
    newAttrs[index].values = selectedOptions;
    setForm(f => ({ ...f, attributes: newAttrs }));
  };

  const removeAttribute = (index) => {
    const newAttrs = [...form.attributes];
    newAttrs.splice(index, 1);
    setForm(f => ({ ...f, attributes: newAttrs }));
  };

  // Variation Management
  const generateVariations = () => {
    // Simple Cartesian product for now
    // Only consider attributes marked for variation
    const variationAttrs = form.attributes.filter(a => a.variation && a.values.length > 0);

    if (form.variations.length > 0 && !window.confirm("This will overwrite existing variations. Continue?")) {
      return;
    }

    if (variationAttrs.length === 0) {
      alert("No attributes selected for variation!");
      return;
    }

    // Helper to generate combinations
    const cartesian = (args) => {
      const r = [];
      const max = args.length - 1;
      function helper(arr, i) {
        for (let j = 0, l = args[i].values.length; j < l; j++) {
          const a = arr.slice(0); // clone arr
          a.push(args[i].values[j]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(variationAttrs);

    const newVariations = combinations.map(combo => {
      const sku = `${form.name.substring(0, 3).toUpperCase()}-${combo.join("-").toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const attrMap = {};
      variationAttrs.forEach((attr, idx) => {
        attrMap[attr.name] = combo[idx];
      });

      return {
        sku,
        price: form.price,
        stock: form.stock,
        attributes: attrMap,
        isActive: true
      };
    });

    setForm(f => ({ ...f, variations: newVariations }));
  };

  const updateVariation = (index, field, value) => {
    const newVars = [...form.variations];
    newVars[index][field] = value;
    setForm(f => ({ ...f, variations: newVars }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("type", form.type);

      if (form.price !== "") fd.append("price", String(form.price));
      if (form.stock !== "") fd.append("stock", String(form.stock));

      fd.append("customizable", String(form.customizable));
      fd.append("featured", String(form.featured));
      fd.append("customizationOptions", JSON.stringify(form.customizationOptions));

      // Digital Product Fields
      fd.append("isDigital", String(form.isDigital));
      fd.append("downloadLink", form.downloadLink);

      // Linked Products
      fd.append("crossSells", JSON.stringify(form.crossSells));
      fd.append("upSells", JSON.stringify(form.upSells));

      // Shipping Class
      if (form.shippingClass) fd.append("shippingClass", form.shippingClass);

      // Attributes & Variations
      fd.append("attributes", JSON.stringify(form.attributes));
      fd.append("variations", JSON.stringify(form.variations));

      if (form.image instanceof File) {
        fd.append("image", form.image);
      }

      // Append variation images
      Object.keys(variationImages).forEach(key => {
        fd.append(`variation_image_${key}`, variationImages[key]);
      });

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const res = isEdit
        ? await api.put(`/products/${product._id}`, fd, config)
        : await api.post("/products", fd, config);
      onSaved(res.data);
    } catch (err) {
      console.error("Save product failed:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded shadow-lg max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{isEdit ? "Edit Product" : "Create Product"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">×</button>
        </div>

        {error && <div className="px-4 pt-3 text-sm text-red-600">{error}</div>}

        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'attributes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('attributes')}
          >
            Attributes
          </button>
          {form.type === 'variable' && (
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'variations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('variations')}
            >
              Variations
            </button>
          )}
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'linked' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('linked')}
          >
            Linked Products
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'shipping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Product Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Base Price</label>
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stock (Total)</label>
                  <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm"></textarea>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((f) => ({ ...f, image: file }));
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <div className="mt-2">
                  {form.image instanceof File ? (
                    <img src={URL.createObjectURL(form.image)} alt="preview" className="h-16 w-16 object-cover rounded border" />
                  ) : form.image ? (
                    <img src={form.image} alt="current" className="h-16 w-16 object-cover rounded border" />
                  ) : null}
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" name="customizable" checked={form.customizable} onChange={handleChange} />
                  This product allows customer customization
                </label>
                {form.customizable && (
                  <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {["image", "text", "cloud", "pdf"].map(opt => (
                      <label key={opt} className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={form.customizationOptions.includes(opt)} onChange={() => toggleOption(opt)} />
                        Custom {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </label>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" name="isDigital" checked={form.isDigital} onChange={handleChange} />
                  This is a Digital Product (Downloadable)
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                  Featured Product (Show on Home Page)
                </label>
                {form.isDigital && (
                  <div className="pl-6">
                    <label className="block text-xs text-gray-600 mb-1">Download Link (URL)</label>
                    <input
                      type="url"
                      name="downloadLink"
                      value={form.downloadLink}
                      onChange={handleChange}
                      placeholder="https://example.com/file.zip"
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ATTRIBUTES TAB */}
          {activeTab === 'attributes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  className="border rounded px-3 py-2 text-sm flex-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      addAttribute(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Add existing attribute...</option>
                  {globalAttributes.map(attr => (
                    <option key={attr._id} value={attr._id}>{attr.name}</option>
                  ))}
                </select>
              </div>

              {form.attributes.map((attr, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{attr.name}</span>
                    <button type="button" onClick={() => removeAttribute(idx)} className="text-red-500 text-sm">Remove</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attr.options && attr.options.map(opt => (
                      <label key={opt} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border text-sm">
                        <input
                          type="checkbox"
                          checked={attr.values.includes(opt)}
                          onChange={(e) => {
                            const newValues = e.target.checked
                              ? [...attr.values, opt]
                              : attr.values.filter(v => v !== opt);
                            updateAttributeValues(idx, newValues);
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={attr.variation}
                      onChange={(e) => {
                        const newAttrs = [...form.attributes];
                        newAttrs[idx].variation = e.target.checked;
                        setForm(f => ({ ...f, attributes: newAttrs }));
                      }}
                    />
                    Used for variations
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* VARIATIONS TAB */}
          {activeTab === 'variations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{form.variations.length} variations</span>
                <button
                  type="button"
                  onClick={generateVariations}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Generate Variations
                </button>
              </div>

              {form.variations.map((v, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50 text-sm">
                  <div className="flex justify-between mb-2 font-medium">
                    <span>{Object.values(v.attributes).join(" / ")}</span>
                    <span className="text-gray-500">{v.sku}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Price</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariation(idx, 'price', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Stock</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariation(idx, 'stock', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500">Variation Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setVariationImages(prev => ({ ...prev, [idx]: file }));
                      }}
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                    {variationImages[idx] ? (
                      <div className="text-xs text-green-600 mt-1">New image selected</div>
                    ) : v.image ? (
                      <img src={v.image} alt="variation" className="h-8 w-8 object-cover mt-1 rounded border" />
                    ) : null}
                  </div>
                </div>

              ))}
            </div>
          )}

          {/* LINKED PRODUCTS TAB */}
          {activeTab === 'linked' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Up-Sells</h4>
                <p className="text-xs text-gray-500 mb-2">Products you recommend instead of the currently viewed product (e.g., more profitable, better quality).</p>
                <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50">
                  {allProducts.filter(p => p._id !== product?._id).map(p => (
                    <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.upSells.includes(p._id)}
                        onChange={() => toggleLinkedProduct('upSells', p._id)}
                      />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Cross-Sells</h4>
                <p className="text-xs text-gray-500 mb-2">Products you promote in the cart, based on the current product (e.g., accessories).</p>
                <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50">
                  {allProducts.filter(p => p._id !== product?._id).map(p => (
                    <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.crossSells.includes(p._id)}
                        onChange={() => toggleLinkedProduct('crossSells', p._id)}
                      />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Shipping Class</label>
                <select
                  name="shippingClass"
                  value={form.shippingClass}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">No Shipping Class</option>
                  {shippingClasses.map(sc => (
                    <option key={sc._id} value={sc._id}>{sc.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Assign a shipping class to apply specific shipping rules (e.g., Heavy Items).
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t mt-4">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border text-sm">Cancel</button>
            <button type="submit" disabled={saving} className={`px-3 py-2 rounded text-sm text-white ${saving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}>
              {saving ? "Saving…" : (isEdit ? "Save Changes" : "Create Product")}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}

export default ProductCreateEditModal;
