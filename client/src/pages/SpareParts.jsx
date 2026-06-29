import { useState, useEffect } from 'react';
import { getParts, getPartCategories } from '../api/storeApi';
import PartCard from '../components/parts/PartCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const formatCategoryLabel = (val) => val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function SpareParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pincode, setPincode] = useState(() => localStorage.getItem('selectedPincode') || '');
  const [categories, setCategories] = useState([]);
  const { itemCount } = useCart();

  useEffect(() => {
    getPartCategories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePincodeUpdate = () => {
      setPincode(localStorage.getItem('selectedPincode') || '');
      setPage(1);
    };
    window.addEventListener('pincode-updated', handlePincodeUpdate);
    return () => window.removeEventListener('pincode-updated', handlePincodeUpdate);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { category, search, page, limit: 12 };
    if (pincode.length === 6) params.pincode = pincode;
    getParts(params)
      .then(({ data }) => { setParts(data.parts); setTotal(data.total); setPages(Math.ceil(data.total / 12)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, page, pincode]);

  const activeCatLabel = category ? formatCategoryLabel(category) : 'All Parts';

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        @media (max-width: 640px) {
          .parts-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
          .parts-header h1 { font-size: 1.8rem !important; }
        }
        @media (max-width: 400px) {
          .parts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
       {/* ── HERO HEADER ── */}
       <div style={{ position: 'relative', background: '#F9F9F9', overflow: 'hidden', paddingBottom: '0', borderBottom: '1px solid #EEE' }}>
         {/* Decorative red line */}
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#E53935' }} />
 
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
 
             <div>
               {/* Eyebrow */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                 <div style={{ width: 24, height: 3, background: '#E53935', borderRadius: '2px' }} />
                 <span style={{ color: '#E53935', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                   Dugdug Wheels Store
                 </span>
               </div>
               <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 3.2rem)', fontWeight: 900, color: '#111', lineHeight: 1, margin: 0 }}>
                 SPARE <span style={{ color: '#E53935' }}>PARTS</span>
               </h1>
               <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.88rem' }}>
                 {total > 0 ? <><span style={{ color: '#333', fontWeight: 700 }}>{total}</span> products available</> : 'Browse our collection'}
                 {pincode.length === 6 && (
                   <span style={{ color: '#2E7D32', marginLeft: '0.7rem', fontWeight: 700, fontSize: '0.82rem', background: 'rgba(46,125,50,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                     📍 {pincode}
                   </span>
                 )}
               </p>
             </div>
 
             {/* Cart button */}
             <Link to="/cart" style={{
               display: 'flex', alignItems: 'center', gap: '0.7rem',
               padding: '0.7rem 1.4rem',
               background: itemCount > 0 ? '#E53935' : '#111',
               borderRadius: '10px', color: 'white', textDecoration: 'none',
               fontWeight: 700, fontSize: '0.9rem', position: 'relative',
               transition: 'all 0.2s',
               fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em',
               boxShadow: itemCount > 0 ? '0 4px 15px rgba(229,57,53,0.3)' : 'none'
             }}
               onMouseEnter={e => { if (itemCount === 0) e.currentTarget.style.background = '#000'; }}
               onMouseLeave={e => { if (itemCount === 0) e.currentTarget.style.background = '#111'; }}>
               <ShoppingCart size={19} />
               MY CART
               {itemCount > 0 && (
                 <span style={{
                   background: 'white', color: '#E53935',
                   borderRadius: '999px', padding: '0 8px',
                   fontSize: '0.75rem', fontWeight: 900, marginLeft: '0.3rem'
                 }}>{itemCount}</span>
               )}
             </Link>
           </div>
 
           {/* ── Search Bar ── */}
           <div style={{ position: 'relative', marginTop: '2rem', maxWidth: 520 }}>
             <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
             <input
               type="text"
               placeholder={`Search ${activeCatLabel.toLowerCase()}...`}
               value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
               className="input-light"
               style={{
                 paddingLeft: '3rem',
                 height: '50px'
               }}
             />
             {search && (
               <button onClick={() => setSearch('')}
                 style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                 ×
               </button>
             )}
           </div>
         </div>
 
         {/* ── Category Tab Strip ── */}
         <div style={{ borderTop: '1px solid #EEE', background: '#FFF' }}>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}
               className="hide-scrollbar">
               <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
               {/* All Parts tab */}
               {[{ value: '', label: 'All Parts' }, ...categories.map(c => ({ value: c, label: formatCategoryLabel(c) }))].map((cat) => {
                 const isActive = category === cat.value;
                 return (
                   <button
                     key={cat.value}
                     onClick={() => { setCategory(cat.value); setPage(1); }}
                     style={{
                       flexShrink: 0,
                       padding: '1rem 1.2rem',
                       background: 'none', border: 'none',
                       borderBottom: `3px solid ${isActive ? '#E53935' : 'transparent'}`,
                       color: isActive ? '#E53935' : '#666',
                       cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 800 : 600,
                       transition: 'all 0.2s', whiteSpace: 'nowrap',
                     }}
                   >
                     {cat.label}
                   </button>
                 );
               })}
             </div>
           </div>
         </div>
       </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

         {/* Active filter indicator */}
         {(category || search) && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
             <SlidersHorizontal size={14} style={{ color: '#888' }} />
             <span style={{ color: '#888', fontSize: '0.82rem', fontWeight: 600 }}>Filtering by:</span>
             {category && (
               <span style={{ background: 'rgba(229,57,53,0.06)', color: '#E53935', border: '1px solid rgba(229,57,53,0.1)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: '999px' }}>
                 {activeCatLabel}
               </span>
             )}
             {search && (
               <span style={{ background: '#F5F5F5', color: '#666', border: '1px solid #EEE', fontSize: '0.75rem', fontWeight: 600, padding: '3px 12px', borderRadius: '999px' }}>
                 "{search}"
               </span>
             )}
             <button onClick={() => { setCategory(''); setSearch(''); setPage(1); }}
               style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.78rem', marginLeft: 'auto', fontWeight: 600 }}>
               Clear all ×
             </button>
           </div>
         )}
 
         {loading ? (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
             {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
           </div>
         ) : parts.length > 0 ? (
           <>
             <div className="parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
               {parts.map((part) => <PartCard key={part._id} part={part} />)}
             </div>
 
             {/* Pagination */}
             {pages > 1 && (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '4rem' }}>
                 <button
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   disabled={page === 1}
                   style={{ height: 40, padding: '0 1.2rem', borderRadius: '10px', border: '1px solid #EEE', background: '#FFF', color: page === 1 ? '#CCC' : '#666', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                   ← Prev
                 </button>
                 {[...Array(pages)].map((_, i) => (
                   <button key={i} onClick={() => setPage(i + 1)}
                     style={{
                       width: 40, height: 40, borderRadius: '10px', border: '1px solid',
                       borderColor: page === i + 1 ? '#E53935' : '#EEE',
                       background: page === i + 1 ? '#E53935' : '#FFF',
                       color: page === i + 1 ? 'white' : '#666',
                       cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                       transition: 'all 0.2s',
                     }}>
                     {i + 1}
                   </button>
                 ))}
                 <button
                   onClick={() => setPage(p => Math.min(pages, p + 1))}
                   disabled={page === pages}
                   style={{ height: 40, padding: '0 1.2rem', borderRadius: '10px', border: '1px solid #EEE', background: '#FFF', color: page === pages ? '#CCC' : '#666', cursor: page === pages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                   Next →
                 </button>
               </div>
             )}
           </>
         ) : (
           <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
             <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>⚙️</div>
             <h3 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
               NO PARTS FOUND
             </h3>
             <p style={{ color: '#666', fontSize: '0.95rem' }}>We couldn't find any parts matching your current filters.</p>
             {(category || search) && (
               <button onClick={() => { setCategory(''); setSearch(''); }}
                 style={{ marginTop: '1.5rem', background: '#E53935', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(229,57,53,0.3)' }}>
                 Clear All Filters
               </button>
             )}
           </div>
         )}
      </div>
    </div>
  );
}
