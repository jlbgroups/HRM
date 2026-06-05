import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { ArrowRight, Star, Check } from "lucide-react";

const Home = () => {
  const [activeIndustry, setActiveIndustry] = useState("retail");

  const services = [
    { name: "Cloud Management", desc: "Scalable cloud architecture and infrastructure management." },
    { name: "Enterprise Management", desc: "Streamlined processes and ERP solutions for large organizations." },
    { name: "Data & Artificial Intelligence", desc: "Custom machine learning models, analytics, and business intelligence." },
    { name: "Consulting & Staffing", desc: "Top-tier IT talent acquisition and strategic advisory." },
    { name: "Background Verification", desc: "Thorough candidate screening and credentials validation." },
    { name: "Network Management", desc: "Secure, reliable, and high-performance network solutions." },
    { name: "Sales", desc: "Technical sales enablement and CRM optimization." },
    { name: "Custom Software Development", desc: "Bespoke web, mobile, and desktop software engineering." },
    { name: "Managed IT Services", desc: "End-to-end IT support, monitoring, and security services." }
  ];

  const industries = {
    retail: {
      title: "Retail & E-commerce",
      label: "DIGITAL SOLUTIONS",
      desc: "We empower retailers and e-commerce businesses with robust digital platforms and seamless customer experiences. From custom storefronts to integrated inventory management — we help you win in the digital marketplace.",
      points: [
        "Custom E-commerce Platforms",
        "Inventory & OMS Integration",
        "Digital Payment Solutions",
        "Omnichannel Experience Design"
      ],
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
    },
    fintech: {
      title: "Fintech & Banking",
      label: "SECURE TRANSACTIONS",
      desc: "Accelerate your financial services with compliant, secure, and modern digital banking solutions. We build platforms that handle millions of transactions daily with maximum security.",
      points: [
        "Digital Banking Apps",
        "Blockchain & Crypto",
        "Payment Gateway Setup",
        "Fraud Detection Systems"
      ],
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
    },
    manufacturing: {
      title: "Manufacturing & Logistics",
      label: "INDUSTRY 4.0",
      desc: "Optimize supply chain efficiency and implement IoT solutions. We deliver custom systems for warehouse management, tracking, and predictive maintenance.",
      points: [
        "Warehouse Management Systems",
        "IoT Integration",
        "Supply Chain Automation",
        "Real-time Fleet Tracking"
      ],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
    }
  };

  return (
    <>
      <div className="lev-home">
        <Navbar />
        <main style={{ paddingTop: "72px" }}>
          
          {/* HERO SECTION */}
          <section className="lev-hero">
            <div className="lev-container lev-hero-grid">
              <div className="lev-hero-left">
                <div className="lev-badge">
                  <span>EMPOWERING BUSINESS THROUGH TALENT</span>
                </div>
                <h1 className="lev-hero-title">
                  Where Technology Meets Global Talent for <span className="highlight-text">Limitless Growth.</span>
                </h1>
                <p className="lev-hero-desc">
                  Levroxen Software Innovations specializes in IT Staffing & Consulting, Custom Software Development, and Managed Services across USA.
                </p>
                <div className="lev-hero-actions">
                  <Link to="/contact" className="lev-btn-primary">
                    Explore Solutions <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </Link>
                  <Link to="/contact" className="lev-btn-outline">
                    Talk to an Expert <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </Link>
                </div>
                
                <div className="lev-rating-block">
                  <div className="lev-avatar-ls">LS</div>
                  <div className="lev-rating-details">
                    <div className="lev-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <p className="lev-rating-text">Top rated by <strong>100+ clients</strong></p>
                  </div>
                </div>
              </div>
              
              <div className="lev-hero-right">
                <div className="lev-image-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                    alt="Levroxen Team" 
                    className="lev-hero-img"
                  />
                  <div className="lev-floating-tag">
                    <span className="pulse-dot"></span>
                    <span className="tag-text">USA Pipeline. Headquartered in USA</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT & SERVICES SECTION */}
          <section className="lev-about" id="about">
            <div className="lev-container lev-about-grid">
              <div className="lev-about-left">
                <div className="section-label">ABOUT US</div>
                <h2 className="section-title">About Levroxen</h2>
                <p className="section-body">
                  Levroxen Software Innovations is a premier IT Staffing and Consulting firm dedicated to bridging the talent gap in the digital economy. With expertise spanning IT Staffing, Software Development, and Managed Services, we empower businesses with top-tier technology talent and innovative digital solutions.
                </p>
                <p className="section-body">
                  Operating across the <strong>USA</strong>, we help scaling organizations build high-performing teams and deliver robust software products.
                </p>
              </div>

              <div className="lev-about-right" id="services">
                <div className="services-card">
                  <div className="services-card-header">
                    <h3>Our Services &amp; Expertise</h3>
                  </div>
                  <div className="services-list">
                    {services.map((service, idx) => (
                      <div key={idx} className="service-item">
                        <div className="service-bullet"></div>
                        <div className="service-content">
                          <p className="service-name">{service.name}</p>
                          <p className="service-desc">{service.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INDUSTRIES SECTION */}
          <section className="lev-industries" id="industries">
            <div className="lev-container">
              <div className="section-header-center">
                <div className="section-label">INDUSTRIES</div>
                <h2 className="section-title text-white">Industries We Serve</h2>
                <p className="section-desc">
                  From sales and retail to fintech and manufacturing — Levroxen Software Innovations delivers tailored IT solutions across the sectors that matter most.
                </p>
              </div>

              {/* Industry Tabs */}
              <div className="industry-tabs">
                {Object.keys(industries).map((key) => (
                  <button
                    key={key}
                    className={`industry-tab ${activeIndustry === key ? "active" : ""}`}
                    onClick={() => setActiveIndustry(key)}
                  >
                    {industries[key].title}
                  </button>
                ))}
              </div>

              {/* Industry Detail */}
              <div className="industry-grid">
                <div className="industry-left">
                  <img 
                    src={industries[activeIndustry].image} 
                    alt={industries[activeIndustry].title} 
                    className="industry-img"
                  />
                </div>
                <div className="industry-right">
                  <span className="industry-mini-label">{industries[activeIndustry].label}</span>
                  <h3 className="industry-detail-title">{industries[activeIndustry].title}</h3>
                  <p className="industry-detail-desc">{industries[activeIndustry].desc}</p>
                  
                  <div className="industry-points">
                    {industries[activeIndustry].points.map((point, i) => (
                      <div key={i} className="industry-point">
                        <div className="point-icon-box">
                          <Check size={14} className="point-icon" />
                        </div>
                        <span className="point-text">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>

      <style>{`
        .lev-home {
          background: #060b13;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .lev-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Section */
        .lev-hero {
          background: radial-gradient(circle at 80% 20%, #0c182e 0%, #060b13 70%);
          padding: 80px 0 100px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .lev-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 64px;
          align-items: center;
        }

        .lev-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          background: rgba(15, 98, 254, 0.08);
          border: 1px solid rgba(15, 98, 254, 0.2);
          border-radius: 30px;
          margin-bottom: 24px;
        }

        .lev-badge span {
          font-size: 0.75rem;
          font-weight: 700;
          color: #38bdf8;
          letter-spacing: 1px;
        }

        .lev-hero-title {
          font-size: clamp(2rem, 4.5vw, 3.25rem);
          font-weight: 700;
          line-height: 1.2;
          color: #ffffff;
          margin: 0 0 20px;
        }

        .lev-hero-title .highlight-text {
          color: #38bdf8;
        }

        .lev-hero-desc {
          font-size: 1.1rem;
          color: #94a3b8;
          line-height: 1.7;
          margin: 0 0 36px;
          max-width: 540px;
        }

        .lev-hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .lev-btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          background: #0F62FE;
          color: #ffffff;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          font-size: 0.95rem;
        }

        .lev-btn-primary:hover {
          background: #0052ec;
        }

        .lev-btn-primary:active {
          transform: scale(0.98);
        }

        .lev-btn-outline {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #ffffff;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
          font-size: 0.95rem;
        }

        .lev-btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .lev-rating-block {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .lev-avatar-ls {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0F62FE;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          border: 2px solid #060b13;
          box-shadow: 0 0 0 2px #0F62FE;
        }

        .lev-rating-text {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 2px 0 0;
        }

        .lev-image-wrapper {
          position: relative;
        }

        .lev-hero-img {
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          display: block;
        }

        .lev-floating-tag {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: rgba(9, 14, 26, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 18px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .tag-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ffffff;
        }

        /* About Section */
        .lev-about {
          background: #ffffff;
          color: #1e293b;
          padding: 100px 0;
        }

        .lev-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: flex-start;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0F62FE;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 24px;
        }

        .section-title.text-white {
          color: #ffffff;
        }

        .section-body {
          font-size: 1.05rem;
          color: #475569;
          line-height: 1.75;
          margin-bottom: 20px;
        }

        .services-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
        }

        .services-card-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 24px 0;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .service-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .service-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0F62FE;
          margin-top: 8px;
          flex-shrink: 0;
        }

        .service-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .service-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Industries Section */
        .lev-industries {
          background: #090e1a;
          padding: 100px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
        }

        .section-header-center {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 48px;
        }

        .section-desc {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        .industry-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .industry-tab {
          padding: 10px 24px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
        }

        .industry-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .industry-tab.active {
          background: #0F62FE;
          border-color: #0F62FE;
          color: #ffffff;
        }

        .industry-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .industry-img {
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
        }

        .industry-mini-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #38bdf8;
          letter-spacing: 1.5px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .industry-detail-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 16px;
          color: #ffffff;
        }

        .industry-detail-desc {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .industry-points {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .industry-point {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .point-icon-box {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(15, 98, 254, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .point-icon {
          color: #38bdf8;
        }

        .point-text {
          font-size: 0.95rem;
          color: #cbd5e1;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .lev-hero-grid, .lev-about-grid, .industry-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .lev-hero {
            padding: 48px 0 64px;
          }
          .lev-about, .lev-industries {
            padding: 64px 0;
          }
        }
      `}</style>
    </>
  );
};

export default Home;