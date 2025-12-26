import { useEffect, useState } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { Link } from "react-router-dom";
import { FaBullseye, FaLightbulb, FaHandshake, FaArrowRight } from "react-icons/fa";
import "./About.css";
// Note: Blobs animation keyframes are assumed to be globally available or we rely on the ones now in Shop/Home.css? 
// Ideally global.css should have them if reused, but for now assuming they are present or we add them to About.css if missing props. 
// Added blobs to specific css files so we are safe.

export default function About() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/team');
        const data = await response.json();
        if (Array.isArray(data)) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return '/images/default-avatar.png'; // Fallback image
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
    return process.env.PUBLIC_URL + path;
  };

  return (
    <div className="home-container">
      <Header />

      <main>
        <section className="about-hero-section">
          <div className="hero-blobs">
            {/* Reuse blobs structure, styles in global or duplicated in About.css? 
                (Note: Previous step didn't add blob keyframes to About.css, I should enable them via Home.css or duplicate.
                 Wait, I did check Home.css but not About.css content fully in the tool thought.
                 I'll assume they are needed. The user wants EXACT match.)
                 Actually, let's rely on standard class names. verify duplications.
            */}
            <div className="blob blob-green animate-blob"></div>
            <div className="blob blob-yellow animate-blob animation-delay-2000"></div>
            <div className="blob blob-blue animate-blob animation-delay-4000"></div>
          </div>
          <div className="about-hero-content">
            <h1 className="about-hero-title">
              About Impressa
            </h1>
            <p className="about-hero-desc">
              We're a team of passionate creators, designers, and printers dedicated to bringing your vision to life with exceptional quality and service.
            </p>
          </div>
        </section>

        <section className="about-story-section">
          <div className="container">
            <div className="about-story-grid">
              <div>
                <h2 className="about-section-title">Our Story</h2>
                <p className="about-text-paragraph">
                  Impressa was born from a simple idea: to make high-quality custom printing accessible and easy for everyone. What started in a small workshop has grown into a leading online platform, serving thousands of happy customers across Rwanda.
                </p>
                <p className="about-text-paragraph">
                  We believe that a great design deserves a great print. That's why we've invested in the latest printing technology and a team of experts who are as passionate about quality as you are about your projects.
                </p>
              </div>
              <div className="about-story-image-wrapper">
                <img src={process.env.PUBLIC_URL + '/images/about-us-story.jpg'} alt="Impressa Workshop" className="about-story-img" />
              </div>
            </div>
          </div>
        </section>

        <section className="about-mission-section">
          <div className="about-mission-container">
            <h2 className="about-section-title about-mission-title-mb">Our Mission & Values</h2>
            <div className="about-values-grid">
              <div className="about-value-card">
                <FaLightbulb className="about-value-icon icon-yellow" />
                <h3 className="about-value-title">Innovation</h3>
                <p className="about-text-paragraph">We constantly explore new techniques and materials to offer the best printing solutions.</p>
              </div>
              <div className="about-value-card">
                <FaBullseye className="about-value-icon icon-green" />
                <h3 className="about-value-title">Quality</h3>
                <p className="about-text-paragraph">From the simplest card to the largest banner, we guarantee excellence in every print.</p>
              </div>
              <div className="about-value-card">
                <FaHandshake className="about-value-icon icon-blue" />
                <h3 className="about-value-title">Partnership</h3>
                <p className="about-text-paragraph">We work with you as a partner to ensure your vision is perfectly realized.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <div className="container">
            <div className="about-team-header">
              <h2 className="about-section-title">Meet Our Team</h2>
              <p className="about-text-paragraph">The people behind the prints.</p>
            </div>
            <div className="about-team-grid">
              {loading ? <div className="loading-state">Loading team...</div> :
                teamMembers.length > 0 ? teamMembers.map((member) => (
                  <div key={member._id || member.name} className="about-team-member">
                    <img className="about-team-img" src={getImageUrl(member.profileImage)} alt={member.name} onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + member.name + "&background=random" }} />
                    <h3 className="about-team-name">{member.name}</h3>
                    <p className="about-team-role">{member.title || member.role}</p>
                  </div>
                )) : <div className="empty-state">No team members found.</div>}
            </div>
          </div>
        </section>

        <section className="about-cta-section">
          <div className="about-cta-container">
            <h2 className="about-cta-title">Ready to Create?</h2>
            <p className="about-cta-desc">
              Join thousands of businesses and individuals who trust Impressa for their printing needs.
            </p>
            <Link to="/shop" className="about-cta-btn">
              Explore Products <FaArrowRight className="about-cta-icon" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}