import React from 'react';
import '../styles/LegalPages.css';

const TermsOfService = () => {
    return (
        <div className="legal-container">
            <h1 className="legal-title">Terms of Service</h1>

            <div className="legal-content">
                <section className="legal-section">
                    <h2 className="legal-section-title">1. Acceptance of Terms</h2>
                    <p className="legal-text">
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">2. Use License</h2>
                    <p className="legal-text">
                        Permission is granted to temporarily download one copy of the materials (information or software) on Impressa's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">3. Disclaimer</h2>
                    <p className="legal-text">
                        The materials on Impressa's website are provided on an 'as is' basis. Impressa makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">4. Limitations</h2>
                    <p className="legal-text">
                        In no event shall Impressa or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Impressa's website.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">5. Governing Law</h2>
                    <p className="legal-text">
                        These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="legal-section-title">6. Changes to Terms</h2>
                    <p className="legal-text">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
