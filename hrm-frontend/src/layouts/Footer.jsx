import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, ShieldCheck } from "lucide-react";

const Footer = () => {
  const companyName = "Levroxen Software Innovations";
  const email = "admin@levroxen.com";
  const phone1 = "+91 9703296994";
  const address = "905 N Pershing Ave, Salem, MO 65560-1144, United States";
  const copyright = `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  return (
    <>
      <style>{`
        .shn-footer-cta {
          background: #ffffff;
          padding: 48px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid #eef2f6;
        }

        .shn-footer-cta-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .shn-footer-cta-title {
          font-size: clamp(1.4rem, 2.5vw, 1.8rem);
          font-weight: 700;
          color: #090e1a;
          margin: 0 0 6px 0;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-footer-cta-desc {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-footer-cta-btn {
          padding: 12px 28px;
          background: #0F62FE;
          color: #ffffff;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          display: inline-block;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-footer-cta-btn:hover {
          background: #0052ec;
        }

        .shn-footer-cta-btn:active {
          transform: scale(0.98);
        }

        .shn-footer {
          background: #090e1a;
          color: rgba(255, 255, 255, 0.75);
          font-family: 'DM Sans', sans-serif;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .shn-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 24px 48px;
          display: grid;
          grid-template-columns: 2.5fr 1.5fr 2fr 2fr;
          gap: 48px;
        }

        .shn-footer-logo-img {
          height: 32px;
          width: auto;
          margin-bottom: 20px;
          object-fit: contain;
        }

        .shn-footer-tagline {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0;
        }

        .shn-footer-col-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 24px;
        }

        .shn-footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shn-footer-link {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.15s;
        }

        .shn-footer-link:hover {
          color: #ffffff;
        }

        .shn-footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
        }

        .shn-footer-contact-icon {
          color: #0F62FE;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .shn-footer-contact-text {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        .shn-footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: #060a13;
        }

        .shn-footer-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .shn-footer-copy {
          font-size: 0.825rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .shn-footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 640px) {
          .shn-footer-inner {
            grid-template-columns: 1fr;
            padding: 48px 20px 32px;
            gap: 32px;
          }
          .shn-footer-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* CTA Footer Banner Section */}
      <div className="shn-footer-cta">
        <div className="shn-footer-cta-inner">
          <div>
            <h3 className="shn-footer-cta-title">Ready to scale your business with top talent?</h3>
            <p className="shn-footer-cta-desc">IT Staffing + Software Development expertise, under one roof.</p>
          </div>
          <Link to="/contact" className="shn-footer-cta-btn">
            Get in Touch
          </Link>
        </div>
      </div>

      <footer className="shn-footer">
        <div className="shn-footer-inner">
          <div className="shn-footer-brand-col">
            <img src="/logo.png" className="shn-footer-logo-img" alt={companyName} />
            <p className="shn-footer-tagline">
              Levroxen Software Innovations specializes in IT Staffing & Consulting, Software Development, and Managed Services across the USA.
            </p>
          </div>
          <div>
            <p className="shn-footer-col-title">Navigation</p>
            <ul className="shn-footer-links">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/#about" },
                { label: "Services", path: "/#services" },
                { label: "Industries", path: "/#industries" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  {link.path.startsWith("/#") ? (
                    <a
                      href={link.path}
                      className="shn-footer-link"
                      onClick={(e) => {
                        const element = document.getElementById(link.path.substring(2));
                        if (element) {
                          e.preventDefault();
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.path} className="shn-footer-link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="shn-footer-col-title">Expertise</p>
            <ul className="shn-footer-links">
              {[
                "Cloud Management",
                "Enterprise Management",
                "Data & AI",
                "Consulting & Staffing",
                "Background Verification",
                "Network Management"
              ].map((item) => (
                <li key={item}>
                  <a href="/#services" className="shn-footer-link" onClick={(e) => {
                    const el = document.getElementById("services");
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
                  }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="shn-footer-col-title">Let's Connect</p>
            <div className="shn-footer-contact-item">
              <Mail size={16} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{email}</span>
            </div>
            <div className="shn-footer-contact-item" style={{ marginBottom: "8px" }}>
              <Phone size={16} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{phone1}</span>
            </div>
            <div className="shn-footer-contact-item" style={{ marginBottom: "8px" }}>
              <MapPin size={16} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{address}</span>
            </div>
            <div className="shn-footer-contact-item" style={{ marginBottom: "8px" }}>
              <Globe size={16} className="shn-footer-contact-icon" aria-hidden="true" />
              <a href="https://www.levroxen.com/" target="_blank" rel="noopener noreferrer" className="shn-footer-link" style={{ fontSize: "0.9rem" }}>
                www.levroxen.com
              </a>
            </div>
            <div className="shn-footer-contact-item" style={{ marginBottom: "8px" }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="shn-footer-contact-icon" 
                style={{ flexShrink: 0, marginTop: "2px" }}
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <a href="https://www.linkedin.com/company/levroxenllc/" target="_blank" rel="noopener noreferrer" className="shn-footer-link" style={{ fontSize: "0.9rem" }}>
                LinkedIn
              </a>
            </div>
            <div className="shn-footer-contact-item">
              <ShieldCheck size={16} className="shn-footer-contact-icon" aria-hidden="true" />
              <a href="https://assessments.levroxen.com" target="_blank" rel="noopener noreferrer" className="shn-footer-link" style={{ fontSize: "0.9rem" }}>
                assessments.levroxen.com
              </a>
            </div>
          </div>
        </div>

        <div className="shn-footer-bottom">
          <div className="shn-footer-bottom-inner">
            <p className="shn-footer-copy">{copyright}</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;