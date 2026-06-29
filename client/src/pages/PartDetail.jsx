import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPart, getParts } from '../api/storeApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PartCard from '../components/parts/PartCard';
import {
  Heart, Share2, ChevronLeft, ChevronRight, Star, ShoppingCart,
  MapPin, CheckCircle, AlertCircle, Clock, Maximize2, X,
  Search, ZoomIn, ZoomOut, Phone, Mail, User, Info, Check, Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const normalizeSize = (s) => (s ? s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '').trim() : '');
const isVideoUrl = (url = '') => /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(url) || url.includes('/video/upload/');

export default function PartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addToCart, updateQty } = useCart();
  const cartItem = items.find(i => i._id === id);
  const { user, wishlist = [], toggleWishlist } = useAuth();

  const [part, setPart] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullScreenZoom, setFullScreenZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [selectedPincode, setSelectedPincode] = useState(() => localStorage.getItem('selectedPincode') || '');
  const [selectedSize, setSelectedSize] = useState(null);
  const userPickedSize = useRef(false);

  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  const isWishlisted = user && Array.isArray(wishlist) && (wishlist.includes(id) || wishlist.some(i => i._id === id));

  useEffect(() => {
    setLoading(true);
    getPart(id)
      .then(({ data }) => {
        setPart(data.part);
        return getParts({ category: data.part.category, limit: 8 });
      })
      .then(({ data }) => setSimilar((data.parts || []).filter(p => (p._id || p.id) !== id).slice(0, 8)))
      .catch(() => toast.error('Failed to load part'))
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  }, [id]);

  useEffect(() => {
    const handler = () => setSelectedPincode(localStorage.getItem('selectedPincode') || '');
    window.addEventListener('pincode-updated', handler);
    return () => window.removeEventListener('pincode-updated', handler);
  }, []);

  useEffect(() => {
    userPickedSize.current = false;
    setSelectedSize(null);
  }, [selectedPincode]);

  const availableSizes = useMemo(() => {
    if (!part) return [];
    if (selectedPincode.length === 6) {
      const entries = (part.pincodePricing || []).filter(p => p.pincode === selectedPincode.trim() && p.size);
      if (entries.length > 0) {
        const seen = new Map();
        entries.forEach(p => {
          const key = normalizeSize(p.size);
          if (!seen.has(key)) seen.set(key, { 
            size: p.size, 
            price: Number(p.price), 
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null, 
            inventory: Number(p.inventory) 
          });
        });
        return Array.from(seen.values());
      }
      return [];
    }
    return (part.variants || []).map(v => ({ 
      size: v.size, 
      price: Number(v.price || part.discountedPrice || part.price), 
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null, 
      inventory: Number(v.countInStock ?? part.stock ?? 0) 
    }));
  }, [part, selectedPincode]);

  useEffect(() => {
    if (availableSizes.length > 0 && !userPickedSize.current) {
      const best = availableSizes.find(s => s.inventory > 0) || availableSizes[0];
      setSelectedSize(best);
    }
  }, [availableSizes]);

  const pincodeRule = useMemo(() => {
    if (!part || selectedPincode.length !== 6 || !selectedSize) return null;
    return (part.pincodePricing || []).find(p => p.pincode === selectedPincode.trim() && normalizeSize(p.size) === normalizeSize(selectedSize.size)) || null;
  }, [part, selectedPincode, selectedSize]);

  const effectivePrice = selectedSize?.price ?? part?.discountedPrice ?? part?.price ?? 0;
  const effectiveOriginal = selectedSize?.originalPrice ?? part?.price ?? 0;
  const effectiveStock = selectedSize?.inventory ?? part?.stock ?? 0;
  const discount = (effectiveOriginal && effectivePrice && effectiveOriginal > effectivePrice) 
    ? Math.round(((effectiveOriginal - effectivePrice) / effectiveOriginal) * 100) 
    : 0;

  const isUnavailable = selectedPincode.length === 6 && availableSizes.length === 0;
  const isCheckingPincode = selectedPincode.length > 0 && selectedPincode.length < 6;

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    if (isUnavailable) { toast.error('Not available at this pincode'); return; }
    if (effectiveStock <= 0) { toast.error('Out of stock'); return; }
    
    addToCart({ 
      ...part, 
      effectivePrice, 
      selectedVariant: selectedSize ? { ...selectedSize, price: effectivePrice, originalPrice: effectiveOriginal, countInStock: effectiveStock } : null
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handlePincodeChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setSelectedPincode(cleaned);
    if (cleaned.length === 6) {
      localStorage.setItem('selectedPincode', cleaned);
      window.dispatchEvent(new Event('pincode-updated'));
    }
  };

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const maskPhone = (phone = "") => {
    const d = String(phone).replace(/\D/g, "");
    if (d.length <= 4) return d;
    return `${"*".repeat(d.length - 4)}${d.slice(-4)}`;
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin" />
        <p className="font-bold text-gray-400 tracking-widest uppercase text-sm">Loading Excellence...</p>
      </div>
    </div>
  );

  if (!part) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-4">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">PART NOT FOUND</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">We couldn't locate the specific spare part you're looking for. It might have been moved or discontinued.</p>
      <Link to="/parts" className="btn-primary">BACK TO STORE</Link>
    </div>
  );

  const imagesList = (part.images || []).filter(url => url && typeof url === 'string' && url.trim() !== '');
  const images = imagesList.length ? imagesList : ['https://via.placeholder.com/800x800/F9F9F9/E53935?text=No+Preview'];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        @media (max-width: 768px) {
          .part-detail-grid { grid-template-columns: 1fr !important; }
          .part-detail-grid > div:last-child { position: static !important; }
          .main-detail-img { height: 400px !important; object-fit: contain !important; padding: 1rem !important; width: 100% !important; }
          .part-thumb-row { gap: 0.5rem !important; }
          .part-thumb-row button { width: 60px !important; height: 60px !important; border-radius: 10px !important; }
        }
        .action-btn-zoom { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .action-btn-zoom:hover { transform: scale(1.02) translateY(-2px) !important; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
        .action-btn-zoom:active { transform: scale(0.98) !important; }
        
        .size-btn { transition: all 0.2s; border: 1.5px solid #EEE; background: #FFF; cursor: pointer; }
        .size-btn:hover:not(:disabled) { border-color: #111; background: #F9F9F9; }
        .size-btn.active { border-color: #3B82F6; background: rgba(59,130,246,0.05); color: #3B82F6; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background: '#F9F9F9', borderBottom: '1px solid #EEE', padding: '0.8rem 0' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
          <button onClick={() => navigate('/parts')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Store
          </button>
          <span>/</span>
          <span style={{ color: '#E53935', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.02em' }}>{part.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-fadeInUp part-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* Left: Media & Description */}
          <div>
            <div style={{ position: 'relative', background: '#F5F5F5', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #EEE', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isVideoUrl(images[activeImg]) ? 'default' : 'crosshair' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomed(false)}
              onClick={() => isMobile && !isVideoUrl(images[activeImg]) && setFullScreenZoom(true)}>

              {/* Wishlist Floating Button */}
              <button onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  toast.error('Please login first to wishlist this item');
                  return;
                }
                toggleWishlist?.(id);
              }}
                style={{ position: 'absolute', top: '20px', right: '20px', width: '44px', height: '44px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <Heart size={20} fill={isWishlisted ? '#E53935' : 'none'} color={isWishlisted ? '#E53935' : '#111'} strokeWidth={2.5} />
              </button>

              {/* Discount badge */}
              {discount > 0 && (
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                  <span style={{ background: '#2E7D32', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '5px 12px', borderRadius: '10px', letterSpacing: '0.04em', boxShadow: '0 4px 12px rgba(46,125,50,0.2)' }}>{discount}% OFF</span>
                </div>
              )}

              {isVideoUrl(images[activeImg]) ? (
                <video key={images[activeImg]} src={images[activeImg]} controls autoPlay muted playsInline className="main-detail-img" style={{ width: '100%', height: 480, objectFit: 'contain', background: '#000' }} />
              ) : (
                <img src={images[activeImg]} alt={part.name} className="main-detail-img"
                  style={{ width: '100%', height: 480, objectFit: 'contain', padding: isMobile ? '1.5rem' : '1rem', transition: 'transform 0.5s ease-out', transform: zoomed && !isMobile ? 'scale(2)' : 'scale(1)', transformOrigin: zoomed && !isMobile ? `${mousePos.x}% ${mousePos.y}%` : 'center' }} />
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + images.length) % images.length); setZoomed(false); }}
                    style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    <ChevronLeft size={22} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % images.length); setZoomed(false); }}
                    style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => { setActiveImg(i); setZoomed(false); }}
                    style={{ flexShrink: 0, width: 90, height: 90, borderRadius: '18px', overflow: 'hidden', border: '2.5px solid', borderColor: activeImg === i ? '#E53935' : 'transparent', cursor: 'pointer', background: '#F5F5F5', opacity: activeImg === i ? 1 : 0.7, transition: 'all 0.2s' }}>
                    {isVideoUrl(src) ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                          <Play size={16} fill="white" color="white" />
                        </div>
                      </div>
                    ) : (
                      <img src={src} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 6, height: 24, background: '#E53935', borderRadius: '4px' }} />
                Product Overview
              </h3>
              <p style={{ color: '#555', lineHeight: 1.7, fontSize: '1.05rem', fontWeight: 500 }}>{part.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#F9F9F9', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Category</div>
                  <div style={{ color: '#111', fontWeight: 800, fontSize: '0.95rem' }}>{part.category?.replace('_', ' ').toUpperCase()}</div>
                </div>
                <div style={{ padding: '1rem', background: '#F9F9F9', borderRadius: '16px', border: '1px solid #EEE' }}>
                  <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Availability</div>
                  <div style={{ color: effectiveStock > 0 ? '#2E7D32' : '#E53935', fontWeight: 800, fontSize: '0.95rem' }}>
                    {effectiveStock > 0 ? `In Stock (${effectiveStock} units)` : 'Out of Stock'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info & CTA */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              {/* Badge */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ background: 'rgba(229,57,53,0.1)', color: '#E53935', fontSize: '0.65rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.05em' }}>
                  GENUINE PART
                </span>
                {part.condition === 'new' && (
                  <span style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32', fontSize: '0.65rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.05em' }}>
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              <h1 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem', lineHeight: 1.1 }}>
                {part.name}
              </h1>
              <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.2rem' }}>{part.brand || 'Original Dugdug Wheels Equipment'}</p>

              {/* Ratings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EEE' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} fill={i <= 4 ? "#FFB400" : "none"} color="#FFB400" />
                  ))}
                </div>
                <span style={{ color: '#AAA', fontSize: '0.85rem', fontWeight: 700 }}>({part.numReviews || 12} Verified Reviews)</span>
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 950, color: '#111', lineHeight: 1 }}>
                    ₹{effectivePrice?.toLocaleString('en-IN')}
                  </div>
                  {effectiveOriginal > effectivePrice && (
                    <div style={{ color: '#AAA', fontSize: '1.1rem', textDecoration: 'line-through', fontWeight: 700 }}>
                      ₹{effectiveOriginal?.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
                {effectiveOriginal > effectivePrice && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <span style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32', fontSize: '0.8rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', fontFamily: 'Rajdhani, sans-serif' }}>
                      YOU SAVE ₹{(effectiveOriginal - effectivePrice).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Pincode Section */}
              <div style={{ background: '#F9F9F9', borderRadius: '18px', padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid #EEE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <MapPin size={16} color="#E53935" />
                  <span style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif' }}>CHECK DELIVERY STATUS</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={selectedPincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    maxLength={6}
                    style={{ width: '100%', height: '48px', background: 'white', border: '1.5px solid #EEE', borderRadius: '12px', padding: '0 1rem', fontSize: '0.9rem', fontWeight: 700, outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#111'}
                    onBlur={e => e.target.style.borderColor = '#EEE'}
                  />
                  {selectedPincode.length === 6 && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      {!isUnavailable ? <CheckCircle size={20} color="#2E7D32" /> : <AlertCircle size={20} color="#E53935" />}
                    </div>
                  )}
                </div>
                {selectedPincode.length === 6 && !isUnavailable && (
                  <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Location: <span style={{ color: '#111', fontWeight: 800 }}>{pincodeRule?.location || 'Verified Area'}</span></div>
                    <div style={{ color: '#2E7D32', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Delivery available to your doorstep</div>
                  </div>
                )}
                {isUnavailable && <div style={{ marginTop: '0.8rem', color: '#E53935', fontSize: '0.75rem', fontWeight: 800 }}>Sorry, we don't deliver to this area yet.</div>}
              </div>

              {/* Variants */}
              {availableSizes.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Available Sizes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {availableSizes.map((variant, index) => {
                      const isSelected = selectedSize && normalizeSize(selectedSize.size) === normalizeSize(variant.size);
                      const oos = variant.inventory <= 0 && !isCheckingPincode;
                      return (
                        <button key={index} disabled={oos} onClick={() => { userPickedSize.current = true; setSelectedSize(variant); }}
                          className={`size-btn ${isSelected ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, opacity: oos ? 0.4 : 1, cursor: oos ? 'not-allowed' : 'pointer' }}>
                          {variant.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action */}
              <div>
                {cartItem ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F9F9F9', padding: '0.8rem', borderRadius: '16px', border: '1px solid #EEE' }}>
                    <button onClick={() => updateQty(id, cartItem.quantity - 1)} className="action-btn-zoom"
                      style={{ width: 44, height: 44, borderRadius: '12px', border: 'none', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 900 }}>-</button>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#888', textTransform: 'uppercase', display: 'block' }}>In Cart</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 950, color: '#111', fontFamily: 'Rajdhani, sans-serif' }}>{cartItem.quantity}</span>
                    </div>
                    <button onClick={() => updateQty(id, cartItem.quantity + 1)} className="action-btn-zoom"
                      style={{ width: 44, height: 44, borderRadius: '12px', border: 'none', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 900 }}>+</button>
                  </div>
                ) : (
                  <button disabled={isUnavailable || effectiveStock === 0} onClick={handleAddToCart}
                    className="action-btn-zoom" 
                    style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 900, background: isUnavailable || effectiveStock === 0 ? '#EEE' : '#E53935', color: isUnavailable || effectiveStock === 0 ? '#AAA' : 'white', cursor: isUnavailable || effectiveStock === 0 ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontFamily: 'Rajdhani, sans-serif' }}>
                    <ShoppingCart size={22} /> {effectiveStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                )}
                
                <button onClick={handleShare} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#888', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                  <Share2 size={16} /> Share with Friends
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div style={{ marginTop: '5rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>RECOMMENDED <span style={{ color: '#E53935' }}>SPARE PARTS</span></h3>
                <div style={{ width: 60, height: 4, background: '#E53935', marginTop: '0.8rem', borderRadius: '4px' }} />
              </div>
              <Link to="/parts" style={{ color: '#E53935', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                VIEW ALL STORE <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {similar.map(p => <PartCard key={p._id || p.id} part={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Root Portal-like (keeping it simple) */}
      {fullScreenZoom && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }} onClick={() => setFullScreenZoom(false)}>
          <img src={images[activeImg]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          <button style={{ position: 'absolute', top: 30, right: 30, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={30} />
          </button>
        </div>
      )}
    </div>
  );
}

