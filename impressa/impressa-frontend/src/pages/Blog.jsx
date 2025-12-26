import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaSearch } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import "./Blog.css";

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get("/blogs");
        setBlogPosts(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = ["Design Tips", "Marketing", "Branding", "Inspiration"];

  return (
    <div className="blog-page-wrapper">
      <Header />

      <main className="blog-main-section">
        <div className="blog-container">
          <div className="blog-header">
            <h1 className="blog-title">Impressa Blog</h1>
            <p className="blog-desc">Insights, tips, and inspiration for your printing projects.</p>
          </div>
          <div className="blog-layout-grid">
            <div className="blog-content-col">
              {loading ? (
                <div className="blog-loading">Loading blogs...</div>
              ) : error ? (
                <div className="blog-error">{error}</div>
              ) : blogPosts.length === 0 ? (
                <div className="blog-empty">No blog posts found.</div>
              ) : (
                <div className="blog-list-space">
                  {blogPosts.map((post) => (
                    <div key={post._id} className="blog-card">
                      {post.image && (
                        <img src={post.image.startsWith('http') ? post.image : process.env.PUBLIC_URL + post.image} alt={post.title} className="blog-card-img" />
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
                      <h2 className="blog-card-title">{post.title}</h2>
                      <p className="blog-card-excerpt">{post.excerpt}</p>
                      <Link to={`/blog/${post._id}`} className="blog-read-more">Read More &rarr;</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="blog-sidebar">
              <h2 className="blog-sidebar-title">Search</h2>
              <div className="blog-search-wrapper">
                <input type="text" placeholder="Search..." className="blog-search-input" />
                <FaSearch className="blog-search-icon" />
              </div>
              <h2 className="blog-sidebar-title blog-sidebar-title-mt">Categories</h2>
              <ul className="blog-categories-list">
                {categories.map((category) => (
                  <li key={category}>
                    <Link to="#" className="blog-category-item-link">{category}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
