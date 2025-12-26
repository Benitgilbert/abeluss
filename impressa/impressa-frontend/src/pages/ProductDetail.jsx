import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext"; // Added useToast import
import { formatRwf } from "../utils/currency";
import assetUrl from "../utils/assetUrl";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  FaSearch, FaHeart, FaShoppingCart, FaStar, FaStarHalfAlt,
  FaTshirt, FaChevronLeft, FaPlus, FaMinus
} from "react-icons/fa";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState("");
  const [cloudLink, setCloudLink] = useState("");
  const [cloudPassword, setCloudPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Variable product state
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariation, setCurrentVariation] = useState(null);

  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { showSuccess, showError } = useToast(); // Initialized useToast

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        // Fetch Reviews
        try {
          const reviewsRes = await api.get(`/reviews/product/${id}`);
          setReviews(reviewsRes.data);

          // Calculate average rating locally if not on product
          if (reviewsRes.data.length > 0) {
            const avg = reviewsRes.data.reduce((acc, r) => acc + r.rating, 0) / reviewsRes.data.length;
            setProduct(prev => ({ ...prev, averageRating: avg }));
          }
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }

        // Fetch Related Products
        try {
          const relatedRes = await api.get(`/products/${id}/related`);
          setRelatedProducts(relatedRes.data);
        } catch (err) {
          console.error("Failed to fetch related products", err);
        }

        // Initialize attributes if variable
        if (res.data.type === 'variable' && res.data.attributes) {
          const initialAttrs = {};
          res.data.attributes.forEach(attr => {
            if (attr.variation && attr.values.length > 0) {
              initialAttrs[attr.name] = ""; // Start empty to force selection
            }
          });
          setSelectedAttributes(initialAttrs);
        }
      } catch (e) {
        console.error("Failed to load product", e);
        showError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const res = await api.post(`/reviews/product/${id}`, {
        rating: newReviewRating,
        comment: newReviewComment
      });
      setReviews(prev => [res.data, ...prev]);
      setNewReviewComment("");
      showSuccess("Review submitted successfully!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit review. Please login.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle variation selection
  useEffect(() => {
    if (product?.type === 'variable' && product.variations) {
      // Check if all attributes are selected
      const allSelected = Object.values(selectedAttributes).every(v => v !== "");

      if (allSelected) {
        const match = product.variations.find(v =>
          Object.entries(v.attributes).every(([key, val]) => selectedAttributes[key] === val)
        );
        setCurrentVariation(match || null);
      } else {
        setCurrentVariation(null);
      }
    }
  }, [selectedAttributes, product]);

  const handleAdd = () => {
    if (!product) return;

    if (product.type === 'variable') {
      if (!currentVariation) {
        showError("Please select all options first."); // Replaced alert with showError
        return;
      }
      if (currentVariation.stock < quantity) {
        showError("Not enough stock for this variation"); // Replaced alert with showError
        return;
      }

      // Add variation to cart
      addItem({
        ...product,
        _id: product._id, // Keep main product ID
        variationId: currentVariation.sku, // Use SKU as ID for now or generate one
        price: currentVariation.price,
        name: `${product.name} - ${Object.values(currentVariation.attributes).join(" / ")}`,
        image: currentVariation.image || product.image
      }, { quantity, customText, cloudLink, cloudPassword });
    } else {
      addItem(product, { quantity, customText, cloudLink, cloudPassword });
    }
    nav("/cart");
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAttributeSelect = (name, value) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  // Determine display price and stock
  const displayPrice = currentVariation ? currentVariation.price : product?.price;
  const displayStock = currentVariation ? currentVariation.stock : product?.stock;

  return (
    <div className="product-page-wrapper">
      <Header />

      <main className="py-8 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: 'Shop', link: '/shop' },
              ...(product?.category ? [{ label: product.category, link: `/shop?category=${product.category}` }] : []),
              { label: product?.name || 'Loading...' }
            ]}
          />

          {loading ? (
            <div className="product-loading">Loading product details...</div>
          ) : !product ? (
            <div className="product-error">
              <h2 className="product-error-title">Product Not Found</h2>
              <p>We couldn't find the product you're looking for.</p>
            </div>
          ) : (
            <div className="product-detail-grid">
              <div className="product-image-card">
                {product.image ? (
                  <img src={assetUrl(product.image)} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">
                    <FaTshirt className="text-8xl text-gray-400 opacity-50" />
                  </div>
                )}
              </div>

              <div className="product-info-col">
                <h1 className="product-title">{product.name}</h1>
                <p className="product-desc">{product.description || "No description available."}</p>
                <div className="product-meta-row">
                  <div className="product-rating">
                    <div className="product-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < (product.averageRating || 0) ? "star-filled" : "star-empty"} />
                      ))}
                    </div>
                    <span className="product-review-count">({reviews.length} reviews)</span>
                  </div>
                  {product.seller && (
                    <div className="product-seller-badge">
                      <span className="text-gray-500 text-sm">Sold by: </span>
                      <Link to={`/shop?seller=${product.seller._id}`} className="seller-link font-semibold hover:underline">
                        {product.seller.storeName || product.seller.name}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="product-price">
                  {product.type === 'variable' && !currentVariation ? (
                    <span className="product-price-from">From {formatRwf(product.price)}</span>
                  ) : (
                    formatRwf(displayPrice)
                  )}
                </div>

                {/* Variable Product Options */}
                {product.type === 'variable' && product.attributes && (
                  <div className="product-options-container">
                    {product.attributes.filter(a => a.variation).map(attr => (
                      <div key={attr.name}>
                        <label className="option-group-label">{attr.name}</label>
                        <div className="option-values">
                          {attr.values.map(val => (
                            <button
                              key={val}
                              onClick={() => handleAttributeSelect(attr.name, val)}
                              className={`option-btn ${selectedAttributes[attr.name] === val ? 'selected' : ''}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {currentVariation && (
                      <div className="stock-status">
                        {currentVariation.stock > 0 ? (
                          <span className="text-green-600 font-medium">In Stock ({currentVariation.stock})</span>
                        ) : (
                          <span className="text-red-500 font-medium">Out of Stock</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="product-qty-row">
                  <label className="product-qty-label">Quantity</label>
                  <div className="product-qty-control">
                    <button onClick={() => handleQuantityChange(-1)} className="qty-btn rounded-l-lg"><FaMinus /></button>
                    <input type="text" readOnly value={quantity} className="qty-input" />
                    <button onClick={() => handleQuantityChange(1)} className="qty-btn rounded-r-lg"><FaPlus /></button>
                  </div>
                </div>

                {product.customizable && (
                  <div className="product-custom-box">
                    <h3 className="custom-box-title">Add Your Customization</h3>
                    {product.customizationOptions?.includes("text") && (
                      <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter custom text (e.g., name, message)" className="custom-input" />
                    )}
                    {product.customizationOptions?.includes("cloud") && (
                      <div className="custom-input-grid">
                        <input value={cloudLink} onChange={(e) => setCloudLink(e.target.value)} placeholder="Cloud link (eg. Google Drive)" className="custom-input" />
                        <input value={cloudPassword} onChange={(e) => setCloudPassword(e.target.value)} placeholder="Password (optional)" className="custom-input" />
                      </div>
                    )}
                    {!product.customizationOptions?.length && (
                      <div className="custom-note">This item supports customization. Please provide details in the notes during checkout.</div>
                    )}
                  </div>
                )}

                <div className="product-actions">
                  <button
                    onClick={handleAdd}
                    disabled={product.type === 'variable' && (!currentVariation || currentVariation.stock === 0)}
                    className="add-cart-btn"
                  >
                    <FaShoppingCart /> {product.type === 'variable' && !currentVariation ? 'Select Options' : 'Add to Cart'}
                  </button>
                  <button onClick={() => toggle(product._id)} className={`wishlist-btn ${has(product._id) ? 'active' : ''}`}>
                    <FaHeart /> {has(product._id) ? 'Wishlisted' : 'Wishlist'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS SECTION */}
          {product && (
            <div className="reviews-section">
              <h2 className="reviews-title">Customer Reviews</h2>

              {/* Add Review Form */}
              <div className="review-form-card">
                <h3 className="review-form-title">Write a Review</h3>
                <div className="review-star-select">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setNewReviewRating(star)} className="star-btn">
                      <FaStar className={star <= newReviewRating ? "star-filled" : "star-empty"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="review-textarea"
                  rows="3"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="submit-review-btn"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p className="no-reviews-msg">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="review-author-info">
                          <div className="review-avatar">
                            {review.user?.name?.[0] || 'U'}
                          </div>
                          <span className="review-author-name">{review.user?.name || "Anonymous"}</span>
                        </div>
                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? "star-filled" : "star-empty"} />
                        ))}
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {relatedProducts.length > 0 && (
            <div className="related-section mt-12">
              <h2 className="related-title">You may also like</h2>
              <div className="related-grid">
                {relatedProducts.map(p => (
                  <Link key={p._id} to={`/product/${p.slug || p._id}`} className="related-card group">
                    <div className="related-img-wrapper">
                      {p.image ? (
                        <img src={assetUrl(p.image)} alt={p.name} className="related-img" />
                      ) : (
                        <div className="related-img-placeholder">
                          <FaTshirt className="text-4xl" />
                        </div>
                      )}
                    </div>
                    <div className="related-content">
                      <h3 className="related-name">{p.name}</h3>
                      <div className="related-price">{formatRwf(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
