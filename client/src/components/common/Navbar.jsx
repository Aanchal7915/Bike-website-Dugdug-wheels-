import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Menu, X, ChevronDown, User, Heart, LogOut, Settings, Wrench, MapPin, Search } from 'lucide-react';
import API from '../../api/axios';
import Logo from './Logo';



const navLinks = [
  { label: 'Buy Bikes', href: '/bikes' },
  { label: 'Sell Bike', href: '/sell' },
  { label: 'Service', href: '/services' },
  { label: 'Rentals', href: '/rentals' },
  { label: 'Parts', href: '/parts' },
  { label: 'Featured', href: '/featured' },
  { label: 'Bestseller', href: '/bestseller' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState(() => localStorage.getItem('selectedPincode') || '');
  const [isDeliverable, setIsDeliverable] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-save & check availability when 6-digit pincode entered
  useEffect(() => {
    if (pincode.length === 6) {
      const saved = localStorage.getItem('selectedPincode');
      if (saved !== pincode) {
        localStorage.setItem('selectedPincode', pincode);
        window.dispatchEvent(new Event('pincode-updated'));
      }
      API.get('/store/parts', { params: { pincode, limit: 1 } })
        .then(({ data }) => setIsDeliverable((data.total || 0) > 0))
        .catch(() => setIsDeliverable(false));
    } else if (pincode.length === 0) {
      setIsDeliverable(null);
      if (localStorage.getItem('selectedPincode')) {
        localStorage.removeItem('selectedPincode');
        window.dispatchEvent(new Event('pincode-updated'));
      }
    } else {
      setIsDeliverable(null);
    }
  }, [pincode]);

  // Sync pincode when another component updates it
  useEffect(() => {
    const handlePincodeUpdate = () => {
      const saved = localStorage.getItem('selectedPincode') || '';
      setPincode(prev => prev !== saved ? saved : prev);
    };
    window.addEventListener('pincode-updated', handlePincodeUpdate);
    return () => window.removeEventListener('pincode-updated', handlePincodeUpdate);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim().length >= 1) {
      setSearchOpen(false);
      setMobileOpen(false);
      navigate(`/bikes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    // Clear pincode on logout like the shoe project
    localStorage.removeItem('selectedPincode');
    setPincode('');
    window.dispatchEvent(new Event('pincode-updated'));
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav style={{ background: '#111111', borderBottom: '1px solid #1e1e1e' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-1 sm:gap-4 lg:gap-8">
          <Link to="/" className="flex items-center flex-shrink-0" style={{ marginLeft: '-2px', textDecoration: 'none' }}>
            <Logo height={42} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 ml-4 lg:ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  color: location.pathname.startsWith(link.href) ? '#E53935' : '#ccc',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (!location.pathname.startsWith(link.href)) e.target.style.color = 'white'; }}
                onMouseLeave={(e) => { if (!location.pathname.startsWith(link.href)) e.target.style.color = '#ccc'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search Toggle */}
            <div style={{ position: 'relative' }}>
              {!searchOpen ? (
                <button onClick={() => { setSearchOpen(true); setTimeout(() => document.getElementById(window.innerWidth < 768 ? 'nav-search-input-mobile' : 'nav-search-input')?.focus(), 100); }}
                  style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Search size={20} />
                </button>
              ) : (
                <>
                  {/* Desktop Only Inline Search */}
                  <form onSubmit={handleSearchSubmit} 
                    className="hidden md:flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 absolute right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300"
                    style={{ width: '200px' }}>
                    <Search size={14} style={{ color: '#E53935', flexShrink: 0 }} />
                    <input
                      id="nav-search-input"
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'white', flex: 1, fontSize: '0.82rem' }}
                    />
                    <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </form>
                  {/* Mobile Search is handled below the main row */}
                </>
              )}
            </div>

            {/* Pincode Input - Desktop only */}
            <div className="hidden md:flex items-center gap-1.5" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '0.3rem 0.7rem', marginLeft: '12px' }}>
              <MapPin size={13} style={{ color: '#E53935', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Pincode"
                maxLength="6"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: 62, fontSize: '0.82rem' }}
              />
              {isDeliverable !== null && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isDeliverable ? '#4CAF50' : '#E53935', whiteSpace: 'nowrap' }}>
                  {isDeliverable ? '✓' : '✗'}
                </span>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', color: '#ccc', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#E53935', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: '#1A1A1A', border: '1px solid #2A2A2A',
                    borderRadius: '8px', padding: '0.35rem 0.6rem', color: 'white',
                    cursor: 'pointer', fontSize: '0.8rem',
                  }}
                >
                  {dropdownOpen ? (
                    <X size={18} style={{ color: '#E53935' }} />
                  ) : (
                    <>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="hidden sm:block">{user.name?.split(' ')[0]}</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: '#1A1A1A', border: '1px solid #2A2A2A',
                    borderRadius: '10px', minWidth: '180px', zIndex: 100,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                  }}>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}>
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}>
                      <Wrench size={15} /> My Bookings
                    </Link>
                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}>
                      <Heart size={15} /> Wishlist
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', color: '#E53935', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <Settings size={15} /> Admin Panel
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid #2A2A2A' }}>
                      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', color: '#E53935', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#1f0a0a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link to="/login" className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Login</Link>
                <Link to="/register" className="btn-primary !hidden sm:!inline-flex" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Sign Up</Link>
              </div>
            )}


            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Directly Below Navbar Row */}
        {searchOpen && (
          <div className="md:hidden" style={{ background: '#111111', padding: '0.75rem 1rem', borderTop: '1px solid #1e1e1e' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '0.5rem 0.8rem' }}>
              <Search size={14} style={{ color: '#E53935', flexShrink: 0 }} />
              <input
                id="nav-search-input-mobile"
                type="text"
                placeholder="Search bikes, parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', flex: 1, fontSize: '0.9rem' }}
              />
              <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Nav Menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #1e1e1e', padding: '1rem 0' }}>
            {/* Pincode in mobile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '0.5rem 0.8rem', marginBottom: '0.75rem' }}>
              <MapPin size={14} style={{ color: '#E53935', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Enter Pincode"
                maxLength="6"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', flex: 1, fontSize: '0.9rem' }}
              />
              {isDeliverable !== null && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDeliverable ? '#4CAF50' : '#E53935' }}>
                  {isDeliverable ? '✓ Available' : '✗ Not Available'}
                </span>
              )}
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', color: '#ccc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 500 }}>
                {link.label}
              </Link>
            ))}
            {/* Mobile user actions */}
            {user && (
              <div style={{ borderTop: '1px solid #1e1e1e', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 500 }}>
                  <User size={14} /> My Profile
                </Link>
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 500 }}>
                  <Wrench size={14} /> My Bookings
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 500 }}>
                  <Heart size={14} /> Wishlist
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E53935', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Settings size={14} /> Admin Panel
                  </Link>
                )}

                <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E53935', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0', fontSize: '0.88rem', fontWeight: 600, width: '100%' }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
