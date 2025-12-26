import React from 'react';
import '../styles/LegalPages.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-container">
            <h1 className="legal-title">Privacy Policy</h1>

            <div className="legal-content">
                <section className="legal-section">
                    <h2 className="legal-section-title">1. Introduction</h2>
                    <p className="legal-text">
                        Welcome to Impressa. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">2. Information We Collect</h2>
                    <p className="legal-text">
                        We collect several different types of information for various purposes to provide and improve our Service to you:
                    </p>
                    <ul className="legal-list">
                        <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data").</li>
                        <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used ("Usage Data").</li>
                        <li><strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">3. Use of Data</h2>
                    <p className="legal-text">
                        Impressa uses the collected data for various purposes:
                    </p>
                    <ul className="legal-list">
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">4. Data Security</h2>
                    <p className="legal-text">
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">5. Contact Us</h2>
                    <p className="legal-text">
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@impressa.com" className="legal-link">support@impressa.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
