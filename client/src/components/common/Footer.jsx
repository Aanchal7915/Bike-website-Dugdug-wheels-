import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid #1A1A1A', color: '#888' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo height={44} />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>The ultimate destination for premium bike enthusiasts. Buy, sell, and service elite machines with India's most trusted automotive platform.</p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { Icon: FaFacebook, href: '#' },
                { Icon: FaInstagram, href: 'https://www.instagram.com/dug.dug.wheels?igsh=MWZlemVxdXljM3l4Mw==' },
                { Icon: FaYoutube, href: '#' },
                { Icon: FaTwitter, href: '#' }
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target={href !== '#' ? '_blank' : undefined} rel={href !== '#' ? 'noopener noreferrer' : undefined} style={{ width: 36, height: 36, borderRadius: '8px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E53935'; e.currentTarget.style.color = '#E53935'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#888'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.2rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Services</h4>
            {['Concierge Service', 'Luxury Detailing', 'Engine Optimization', 'Battery Solutions', 'Precision Braking', 'Elite Washing'].map(s => (
              <Link key={s} to="/services" style={{ display: 'block', color: '#888', textDecoration: 'none', fontSize: '0.87rem', marginBottom: '0.6rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#E53935')}
                onMouseLeave={(e) => (e.target.style.color = '#888')}>
                {s}
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.2rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
            {[['Buy Bikes', '/bikes'], ['Sell My Bike', '/sell'], ['Genuine Spares', '/parts'], ['Track Order', '/my-orders'], ['Member Dashboard', '/admin'], ['User Profile', '/profile']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', color: '#888', textDecoration: 'none', fontSize: '0.87rem', marginBottom: '0.6rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#E53935')}
                onMouseLeave={(e) => (e.target.style.color = '#888')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.2rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={12} style={{ color: '#E53935', marginTop: '3px' }} />
                  <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#888' }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>GURGAON:</span> Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, 122002
                  </p>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={12} style={{ color: '#E53935', marginTop: '3px' }} />
                  <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#888' }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>MUMBAI:</span> Third Floor, Vasudev Chamber, Teli Galli Cross Rd, Andheri East, 400069
                  </p>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={12} style={{ color: '#E53935', marginTop: '3px' }} />
                  <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#888' }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>ROHTAK:</span> 106, First Floor, Agro Mall, Rohtak
                  </p>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={12} style={{ color: '#E53935', marginTop: '3px' }} />
                  <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#888' }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>AUSTRALIA:</span> Australia
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ marginBottom: '0.6rem', fontSize: '0.87rem' }}>
              <Phone size={14} style={{ color: '#E53935', flexShrink: 0 }} />
              <span>+91 9253625099</span>
            </div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.2rem', fontSize: '0.87rem' }}>
              <Mail size={14} style={{ color: '#E53935', flexShrink: 0 }} />
              <span>kp@avanienterprises.in</span>
            </div>
            
            <div style={{ padding: '1rem', background: '#1A1A1A', borderRadius: '12px', border: '1px solid #2A2A2A' }}>
              <p style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>24/7 Roadside Assistance</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Phone size={18} style={{ color: '#E53935' }} />
                <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Rajdhani, sans-serif' }}>+91 9253625099</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1A1A1A', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '0.83rem' }}>© {new Date().getFullYear()} Dugdug Wheels. All rights reserved.</p>
          <div className="flex items-center gap-4" style={{ fontSize: '0.83rem' }}>
            <Link to="/privacy" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#888', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
