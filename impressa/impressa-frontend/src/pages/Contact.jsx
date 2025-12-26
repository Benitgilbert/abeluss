import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Contact.css";

export default function Contact() {
  const { items = [] } = useCart();

  return (
    <div className="contact-page-wrapper" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <Header />

      <main className="contact-main-section">
        <div className="container">
          <div className="contact-header">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-desc">We are here to help. Send us a message and we will get back to you as soon as possible.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-form-card">
              <h2 className="contact-card-title">Send us a Message</h2>
              <form>
                <div className="contact-input-grid">
                  <div>
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" name="name" id="name" className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" name="email" id="email" className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input type="text" name="subject" id="subject" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea name="message" id="message" rows="4" className="form-textarea"></textarea>
                </div>
                <div className="contact-btn-wrapper">
                  <button type="submit" className="contact-submit-btn">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            <div className="contact-info-card">
              <h2 className="contact-card-title">Contact Information</h2>
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div className="contact-info-text">
                    <h3 className="contact-info-label">Address</h3>
                    <p className="contact-info-value">123 Impressa Lane, Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <FaPhoneAlt className="contact-icon icon-flip" />
                  <div className="contact-info-text">
                    <h3 className="contact-info-label">Phone</h3>
                    <p className="contact-info-value">(+250) 788 123 456</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <FaEnvelope className="contact-icon" />
                  <div className="contact-info-text">
                    <h3 className="contact-info-label">Email</h3>
                    <p className="contact-info-value">
                      <a href="mailto:contact@impressa.com" className="contact-link">contact@impressa.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="map-section">
          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.523336224859!2d30.06034561475492!3d-1.94399399859239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4247de48c37%3A0x6d3b3a4a9f7d6d3c!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1620052300000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
