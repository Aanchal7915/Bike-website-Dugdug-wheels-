import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star, ArrowRight, Calendar } from 'lucide-react';
import { getPart } from '../api/storeApi';
import { getBike } from '../api/bikeApi';
import toast from 'react-hot-toast';

function WishlistItemLoader({ partId, pincode, toggleWishlist, addToCart }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        // Try parts first
        const pRes = await getPart(partId);
        if (pRes.data.part) {
          setItem({ ...pRes.data.part, itemType: 'part' });
          return;
        }
      } catch (e) {
        // Part fetch failed, try bikes
        try {
          const bRes = await getBike(partId);
          if (bRes.data.bike) {
            setItem({ ...bRes.data.bike, itemType: 'bike' });
            return;
          }
        } catch (err) {
          setItem(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [partId]);
 
  if (loading) return (
    <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '24px', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #F5F5F5', borderTopColor: '#E53935', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
 
  if (!item) return null;

  const isBike = item.itemType === 'bike';
  const detailUrl = isBike ? `/bikes/${item._id}` : `/parts/${item._id}`;
  const title = isBike ? (item.title || `${item.brand} ${item.model}`) : item.name;
  const brand = item.brand;
  const images = item.images || [];

  // Pincode logic only for parts
  let price = item.price;
  let originalPrice = item.price;
  let discount = 0;
  let effectiveStock = isBike ? 1 : item.stock;

  if (!isBike) {
    const hasPincodePricing = Array.isArray(item.pincodePricing) && item.pincodePricing.length > 0;
    const pincodeEntry = pincode.length === 6 && hasPincodePricing
      ? item.pincodePricing.find(p => p.pincode === pincode) : null;
    price = pincodeEntry ? Number(pincodeEntry.price) : (item.discountedPrice || item.price);
    originalPrice = pincodeEntry?.originalPrice ? Number(pincodeEntry.originalPrice) : item.price;
    effectiveStock = pincodeEntry ? Number(pincodeEntry.inventory) : item.stock;
    discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FFF',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        height: '100%',
      }}
    >
      <Link to={detailUrl} style={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: '180px', background: '#F5F5F5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={images[0] || 'https://via.placeholder.com/400x300/F5F5F5/E53935?text=No+Image'}
            alt={title}
            style={{
              width: '100%', height: '100%', objectFit: 'contain', padding: '1rem',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          
          {/* Top-right: Trash (Remove) */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item._id); }}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(17,17,17,0.85)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              transition: 'all 0.25s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E53935'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(17,17,17,0.85)'}
          >
            <Trash2 size={14} color="white" />
          </button>

          {/* Top-left: Type Badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.5rem' }}>
            <span style={{
              background: isBike ? '#111' : '#E53935', color: 'white',
              fontSize: '0.65rem', fontWeight: 950,
              padding: '3px 12px', borderRadius: '30px',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              {isBike ? 'BIKE' : 'PART'}
            </span>
            {discount > 0 && (
              <span style={{ background: '#2E7D32', color: 'white', fontSize: '0.65rem', fontWeight: 950, padding: '3px 10px', borderRadius: '30px' }}>
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Bottom Content Section */}
        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderTop: '1px solid #EEE' }}>
          {/* Metadata Row */}
          <div style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <span style={{ color: '#888', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'Rajdhani, sans-serif' }}>
                 {isBike ? <Calendar size={10} /> : <div style={{width: 4, height: 4, background: '#E53935', borderRadius: '50%'}} />} 
                 {isBike ? item.year : brand?.toUpperCase()}
              </span>
            </div>
            {!isBike && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Star size={9} fill="#FFB400" color="#FFB400" />
                <span style={{ color: '#AAA', fontSize: '0.65rem', fontWeight: 600 }}>{item.ratings || '5.0'}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            color: '#111', fontWeight: 900, fontSize: '0.85rem',
            lineHeight: 1.2, marginBottom: '0.3rem',
            fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.02em',
            textTransform: 'uppercase',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {title}
          </h3>

          {/* Price row + Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', fontWeight: 950, color: '#E53935', lineHeight: 1 }}>
                ₹{price?.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <span style={{ color: '#AAA', fontSize: '0.75rem', textDecoration: 'line-through', fontWeight: 600 }}>₹{originalPrice?.toLocaleString('en-IN')}</span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {!isBike && effectiveStock > 0 && (
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...item, effectivePrice: price }); }}
                  style={{ width: '28px', height: '28px', background: '#F5F5F5', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111' }}
                >
                  <ShoppingCart size={13} />
                </button>
              )}
              <div style={{
                height: '28px', padding: '0 0.7rem',
                background: '#111', borderRadius: '6px', color: 'white',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.65rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '0.04em', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                VIEW <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
 
export default function Wishlist() {
  const { user, wishlist = [], toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [pincode, setPincode] = useState(() => localStorage.getItem('selectedPincode') || '');
 
  useEffect(() => {
    const handler = () => setPincode(localStorage.getItem('selectedPincode') || '');
    window.addEventListener('pincode-updated', handler);
    return () => window.removeEventListener('pincode-updated', handler);
  }, []);
 
  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', gap: '2rem', padding: '2rem' }}>
        <div style={{ background: '#F9F9F9', width: 140, height: 140, borderRadius: '40px', border: '2px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transform: 'rotate(-5deg)' }}>
          <Heart size={60} style={{ color: '#DDD' }} />
        </div>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>READY TO SAVE <span style={{ color: '#E53935' }}>YOUR FAVORITES?</span></h2>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5 }}>Login to your Dugdug Wheels account to view and manage your personalized wishlist.</p>
        </div>
        <Link to="/login" style={{ background: '#111', color: 'white', padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}>
          ACCOUNT LOGIN
        </Link>
      </div>
    );
  }
 
  if (wishlist.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', gap: '2rem', padding: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ background: '#F9F9F9', width: 140, height: 140, borderRadius: '40px', border: '2px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Heart size={60} style={{ color: '#DDD' }} />
          </div>
          <div style={{ position: 'absolute', top: -10, right: -10, width: 44, height: 44, background: '#E53935', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white', fontWeight: 900, boxShadow: '0 5px 15px rgba(229,57,53,0.3)', border: '4px solid white' }}>0</div>
        </div>
        <div style={{ textAlign: 'center', maxWidth: '450px' }}>
          <h2 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '0.05em', lineHeight: 1.1 }}>YOUR WISHLIST <span style={{ color: '#E53935' }}>IS EMPTY</span></h2>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>Start exploring our massive inventory of genuine spare parts and save what you love!</p>
        </div>
        <Link to="/parts" style={{ background: '#E53935', color: 'white', padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(229,57,53,0.2)', transition: 'all 0.3s' }}>
          EXPLORE STORE
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        .wishlist-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
          gap: 1.5rem !important;
        }
        @media (max-width: 768px) {
          .wishlist-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 0.8rem !important;
          }
          .wishlist-grid > div h3 { font-size: 0.85rem !important; }
          .wishlist-grid > div p { font-size: 0.7rem !important; }
          .wishlist-grid > div .font-size-price { font-size: 1rem !important; }
        }
        @media (max-width: 400px) {
          .wishlist-grid { gap: 0.5rem !important; }
        }
      `}</style>
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #E53935, #FF7043, transparent)' }} />
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
          <button onClick={() => navigate('/')}
            style={{ 
              background: '#111', border: 'none', borderRadius: '10px', 
              padding: '0.6rem 1.2rem', color: 'white', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.3s', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Rajdhani, sans-serif', 
              letterSpacing: '0.05em' 
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}>
            <ArrowLeft size={14} /> BACK
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: 4, height: 32, background: '#E53935', borderRadius: '4px' }} />
            <h1 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '0.04em' }}>
              YOUR <span style={{ color: '#E53935' }}>WISHLIST</span>
            </h1>
          </div>
        </div>
 
        {pincode.length === 6 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#F9F9F9', borderRadius: '10px', border: '1px solid #EEE', width: 'fit-content', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 700 }}>
              Checking availability for <span style={{ color: '#E53935' }}>{pincode}</span>
            </span>
          </div>
        )}
 
        <div className="animate-fadeInUp wishlist-grid">
          {wishlist.map((id) => (
            <WishlistItemLoader key={id} partId={id} pincode={pincode} toggleWishlist={toggleWishlist} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
}
