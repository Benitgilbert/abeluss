import { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaStar, FaSave, FaTimes,
    FaQuoteLeft, FaToggleOn, FaToggleOff, FaUser
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './AdminTestimonials.css';

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        role: 'Customer',
        content: '',
        avatar: '',
        rating: 5,
        isActive: true,
        featured: false,
    });

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/testimonials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTestimonials(data.data);
            }
        } catch (err) {
            setError('Failed to fetch testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            const url = editingTestimonial
                ? `${API_URL}/testimonials/${editingTestimonial._id}`
                : `${API_URL}/testimonials`;

            const res = await fetch(url, {
                method: editingTestimonial ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(editingTestimonial ? 'Testimonial updated!' : 'Testimonial created!');
                fetchTestimonials();
                closeModal();
            } else {
                setError(data.message || 'Failed to save testimonial');
            }
        } catch (err) {
            setError('Failed to save testimonial');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this testimonial?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/testimonials/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Testimonial deleted!');
                fetchTestimonials();
            } else {
                setError(data.message || 'Failed to delete');
            }
        } catch (err) {
            setError('Failed to delete testimonial');
        }
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/testimonials/${id}/toggle`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                fetchTestimonials();
            }
        } catch (err) {
            setError('Failed to toggle testimonial');
        }
    };

    const openModal = (testimonial = null) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setForm({
                name: testimonial.name || '',
                role: testimonial.role || 'Customer',
                content: testimonial.content || '',
                avatar: testimonial.avatar || '',
                rating: testimonial.rating || 5,
                isActive: testimonial.isActive !== false,
                featured: testimonial.featured || false,
            });
        } else {
            setEditingTestimonial(null);
            setForm({
                name: '',
                role: 'Customer',
                content: '',
                avatar: '',
                rating: 5,
                isActive: true,
                featured: false,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTestimonial(null);
        setError('');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={i < rating ? 'star-filled' : 'star-empty'}
            />
        ));
    };

    if (loading) {
        return (
            <div className="admin-testimonials-layout">
                <Sidebar />
                <div className="admin-testimonials-main">
                    <Topbar />
                    <main className="admin-testimonials-content">
                        <div className="loading-state">Loading testimonials...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-testimonials-layout">
            <Sidebar />
            <div className="admin-testimonials-main">
                <Topbar title="Customer Testimonials" />
                <main className="admin-testimonials-content">
                    {/* Header */}
                    <div className="testimonials-header">
                        <button className="btn-add-testimonial" onClick={() => openModal()}>
                            <FaPlus /> Add Testimonial
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Testimonials Grid */}
                    <div className="testimonials-grid">
                        {testimonials.length === 0 ? (
                            <div className="empty-state">
                                <FaQuoteLeft className="empty-icon" />
                                <h3>No Testimonials Yet</h3>
                                <p>Add customer testimonials to display on your homepage.</p>
                            </div>
                        ) : (
                            testimonials.map((testimonial) => (
                                <div key={testimonial._id} className={`testimonial-card ${!testimonial.isActive ? 'inactive' : ''}`}>
                                    {testimonial.featured && (
                                        <span className="featured-badge">⭐ Featured</span>
                                    )}

                                    <div className="testimonial-header">
                                        <div className="avatar">
                                            {testimonial.avatar ? (
                                                <img src={testimonial.avatar} alt={testimonial.name} />
                                            ) : (
                                                <FaUser />
                                            )}
                                        </div>
                                        <div className="customer-info">
                                            <h4 className="customer-name">{testimonial.name}</h4>
                                            <span className="customer-role">{testimonial.role}</span>
                                        </div>
                                    </div>

                                    <div className="rating">
                                        {renderStars(testimonial.rating)}
                                    </div>

                                    <p className="testimonial-content">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="testimonial-actions">
                                        <button
                                            className={`btn-toggle ${testimonial.isActive ? 'active' : ''}`}
                                            onClick={() => handleToggle(testimonial._id)}
                                            title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {testimonial.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                        <button className="btn-icon edit" onClick={() => openModal(testimonial)}>
                                            <FaEdit />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(testimonial._id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3 className="modal-title">
                                        {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                                    </h3>
                                    <button onClick={closeModal} className="btn-close">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Customer Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Role/Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={form.role}
                                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                                placeholder="Customer, Verified Buyer, etc."
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Testimonial Content *</label>
                                        <textarea
                                            className="form-input form-textarea"
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            placeholder="Write the customer's testimonial here..."
                                            required
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Avatar URL</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={form.avatar}
                                            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                                            placeholder="https://example.com/avatar.jpg (optional)"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Rating</label>
                                        <div className="rating-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${star <= form.rating ? 'active' : ''}`}
                                                    onClick={() => setForm({ ...form, rating: star })}
                                                >
                                                    <FaStar />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={form.isActive}
                                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                                />
                                                Active (visible on homepage)
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={form.featured}
                                                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                                />
                                                Featured (show first)
                                            </label>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-submit">
                                        <FaSave />
                                        {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
