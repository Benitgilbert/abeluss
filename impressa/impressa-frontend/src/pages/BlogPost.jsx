import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import "./Blog.css";

export default function BlogPost() {
  const { items = [] } = useCart();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/blogs/${id}`);
        setPost(data);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="blog-center-screen">
        <div className="blog-loading-text">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-center-screen">
        <div className="blog-post-error-text">{error || "Post not found"}</div>
        <Link to="/blog" className="blog-post-back-link">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-page-wrapper">
      <Header />

      <main className="blog-main-section">
        <div className="blog-post-wrapper">
          <div className="blog-post-card">
            {post.image && (
              <img src={post.image.startsWith('http') ? post.image : process.env.PUBLIC_URL + post.image} alt={post.title} className="blog-post-featured-img" />
            )}
            <div className="blog-meta">
              <div className="blog-meta-item">
                <FaUser className="blog-meta-icon" />
                <span>{post.author}</span>
              </div>
              <div className="blog-meta-item">
                <FaCalendarAlt className="blog-meta-icon" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="blog-meta-item">
                <Link to="#" className="blog-category-link">{post.category}</Link>
              </div>
            </div>
            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-post-content">{post.content}</p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
