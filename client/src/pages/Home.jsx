import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Star, Zap, Wrench, ShoppingBag, TrendingUp } from 'lucide-react';
import { getFeaturedParts, getBestsellerParts } from '../api/storeApi';
import { getFeaturedBikes, getBestsellerBikes } from '../api/bikeApi';
import { getRentalCars } from '../api/rentalApi';
import BikeCard from '../components/bikes/BikeCard';
import PartCard from '../components/parts/PartCard';
import RentalCard from '../components/bikes/RentalCard';
import { getActiveServiceTypes } from '../api/serviceApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import heroBikeVideo from '../assets/bike-hero.mp4';
import heroBike from '../assets/hero-bike.png';
import heroBikeMobile from '../assets/hero-bike (2).png';
import instantQuote from '../assets/instant-quote.png';

const heroSlides = [
  { title: 'Buy & Sell Bikes', sub: 'Trusted Marketplace', desc: 'Find your perfect ride from thousands of new & used bikes across India.', cta: 'Explore Bikes', href: '/bikes', accent: '#E53935' },
  { title: 'Instant Service', sub: '1-Hour Repair Promise', desc: 'Professional mechanics at your doorstep. Pickup & drop available.', cta: 'Book Service', href: '/services', accent: '#FB8C00' },
  { title: 'Sell in 1 Hour', sub: 'Best Price Guaranteed', desc: 'Get instant valuation and sell your bike the same day.', cta: 'Sell Now', href: '/sell', accent: '#2E7D32' },
];

const stats = [
  { value: '50K+', label: 'Bikes Sold', icon: TrendingUp },
  { value: '1 Hr', label: 'Service Promise', icon: Clock },
  { value: '4.8★', label: 'Average Rating', icon: Star },
  { value: '100+', label: 'Cities Covered', icon: MapPin },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [featuredParts, setFeaturedParts] = useState([]);
  const [bestsellerParts, setBestsellerParts] = useState([]);
  const [bestsellerBikes, setBestsellerBikes] = useState([]);
  const [rentalCars, setRentalCars] = useState([]);
  const [rentalLoading, setRentalLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [partsLoading, setPartsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const reviewTimer = setInterval(() => setCurrentReviewIndex(i => (i + 1) % 3), 6000);
    return () => clearInterval(reviewTimer);
  }, []);

  useEffect(() => {
    Promise.all([
      getFeaturedBikes({ limit: 10 }).then(({ data }) => setFeatured(data.bikes || [])),
      getFeaturedParts().then(({ data }) => setFeaturedParts(data.parts || [])),
      getBestsellerParts({ limit: 8 }).then(({ data }) => setBestsellerParts(data.parts || [])),
      getBestsellerBikes({ limit: 8 }).then(({ data }) => setBestsellerBikes(data.bikes || [])),
      getActiveServiceTypes().then(({ data }) => setServiceTypes(data.serviceTypes || [])),
      getRentalCars({ limit: 8 }).then(({ data }) => setRentalCars(data.cars || []))
    ])
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setPartsLoading(false);
        setServicesLoading(false);
        setRentalLoading(false);
      });

    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div style={{ background: '#000' }}>
      <style>{`
        @media (max-width: 768px) {
          .hero-split { min-height: auto !important; }
          .hero-split > div:first-child > div { padding: 1rem !important; padding-top: 0.5rem !important; }
          .hero-split > div:first-child > div h1 { font-size: 1.5rem !important; }
          .hero-split > div:first-child > div p { font-size: 0.75rem !important; }
          .hero-split .hero-right { min-height: 180px !important; max-height: 220px !important; }
        }
        @media (max-width: 640px) {
          section { padding: 2rem 0 !important; }
          section h2 { font-size: 1.3rem !important; }
          section p { font-size: 0.8rem !important; }
          .hero-extra-desc { margin-bottom: 1rem !important; font-size: 0.75rem !important; }
          .home-hero-stats { gap: 0.6rem !important; font-size: 0.85rem !important; }
          .home-hero-stats > div > div:first-child { font-size: 0.9rem !important; }
          .home-hero-stats > div > div:last-child { font-size: 0.5rem !important; }
          .home-parts-grid, .home-bikes-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
        }
        @media (min-width: 1024px) {
          .home-parts-grid, .home-bikes-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 1rem !important; }
        }
      `}</style>
      {/* HERO — Split layout: left content / right bike image */}
      <section className="hero-split" style={{ minHeight: '92vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @media (max-width: 768px) {
            .hero-split { flex-direction: column !important; min-height: auto !important; }
            .hero-split > .hero-right { min-height: 200px !important; max-height: 240px !important; }
            .hero-split > .hero-right img { transform: translate(-5%, -30%) !important; max-height: 220px !important; }
          }
        `}</style>

        {/* ── LEFT: Black panel with content ── */}
        <div style={{ flex: '1 1 50%', background: '#000', display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
          {/* Red glow accent */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(229,57,53,0.07) 0%, transparent 55%)' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '0px clamp(2rem, 5vw, 5.5rem) clamp(2rem, 5vw, 5.5rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', maxWidth: 800, paddingTop: '1.5rem' }}>

            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
              <Zap size={13} style={{ color: '#E53935' }} />
              <span style={{ color: '#E53935', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{slide.sub}</span>
            </div>

            {/* Brand + Title */}
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Dugdug Wheels</p>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem' }}>
              <span style={{ color: '#E53935' }}>{slide.title.split(' ')[0]}</span>{' '}
              <span style={{ color: 'white' }}>{slide.title.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Description */}
            <p style={{ color: '#999', fontSize: '0.95rem', marginBottom: '0.8rem', lineHeight: 1.75, maxWidth: 440 }}>
              {slide.desc}
            </p>

            {/* Extra content paragraph */}
            <p className="hero-extra-desc" style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 420, marginBottom: '2rem' }}>
              Whether you're looking to upgrade your ride, sell your old bike at the best price, or need expert service — Dugdug Wheels has you covered with doorstep pickup, certified mechanics, and same-day payment.
            </p>

            {/* CTA Buttons — both restored */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
              <Link to={slide.href} style={{
                background: '#E53935', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(229,57,53,0.35)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C62828'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E53935'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {slide.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/services" style={{
                background: 'transparent', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E53935'; e.currentTarget.style.color = '#E53935'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}>
                Book Service
              </Link>
            </div>

            {/* Stats row */}
            <div className="home-hero-stats" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'nowrap', paddingTop: '0.8rem', borderTop: '1px solid #1A1A1A' }}>
              {stats.map(({ value, label }) => (
                <div key={label} style={{ flex: '1 1 0' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: '#E53935', lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#555', fontSize: '0.6rem', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.8rem' }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? '#E53935' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Dark gray panel with bike image ── */}
        <div className="hero-right" style={{ flex: '1 1 50%', background: '#000', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', paddingTop: '0px' }}>


          {/* Decorative background circle */}
          <div style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.05) 0%, transparent 70%)', zIndex: 0 }} />

          {/* Bike media wrapper with floating animation */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <style>{`
              @media (min-width: 769px) {
                .hero-video-laptop { display: block !important; }
                .hero-img-mobile { display: none !important; }
              }
              @media (max-width: 768px) {
                .hero-video-laptop { display: none !important; }
                .hero-img-mobile { display: block !important; }
              }
            `}</style>
            
            <video
              src={heroBikeVideo}
              autoPlay
              muted
              loop
              playsInline
              className="hero-video-laptop"
              style={{
                display: 'none',
                maxWidth: '115%',
                maxHeight: '95%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))',
                transform: 'translate(-5%, -80%)',
                objectPosition: 'top',
                animation: 'float 6s ease-in-out infinite'
              }}
            />

            <img
              src={heroBikeMobile}
              alt="Hero Bike"
              className="hero-img-mobile"
              style={{
                display: 'none',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
              }}
            />
            {/* Pulsing glow under media */}
            <div style={{ position: 'absolute', bottom: '20%', width: '60%', height: '20px', background: 'rgba(229,57,53,0.15)', borderRadius: '50%', filter: 'blur(20px)', animation: 'pulse 4s infinite' }} />
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.2); }
            }
          `}</style>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #000, transparent)', pointerEvents: 'none' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, #000, transparent)', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* BUY BIKES section — Hide if empty (after loading) */}
      {(loading || featured.length > 0) && (
        <section style={{ background: '#F5F5F5', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Buy <span className="gradient-text">Bikes</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>Handpicked deals you'll love</p>
              </div>
              <Link to="/bikes" className="btn-outline-dark" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" text="Loading..." />
            ) : (
              <div className="home-bikes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {featured.slice(0, 10).map((bike) => <BikeCard key={bike._id} bike={bike} />)}
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{ background: '#000', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Professional Care</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '3.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                Our Expert <span style={{ color: '#E53935' }}>Services</span>
              </h2>
            </div>
            <Link to="/services" style={{ 
              background: '#E53935', 
              color: 'white', 
              padding: '0.75rem 2rem', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              borderRadius: '8px', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(229,57,53,0.3)'
            }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C62828'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E53935'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Explore All <ArrowRight size={17} />
            </Link>
          </div>

          {servicesLoading ? (
            <LoadingSpinner size="lg" text="Loading..." />
          ) : (
          <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
            {serviceTypes.map((service, idx) => (
              <div key={service.value} style={{ 
                background: 'white', 
                border: '2px solid transparent',
                borderLeft: '4px solid #E53935',
                borderRadius: '10px', 
                padding: '0.8rem', 
                textAlign: 'left', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-5px)'; 
                  e.currentTarget.style.borderColor = '#E53935';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(229,57,53,0.15)'; 
                  e.currentTarget.style.background = '#FFF5F5'; 
                  e.currentTarget.querySelector('h3').style.color = '#E53935'; 
                  e.currentTarget.querySelector('p').style.color = '#000'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'translateY(0)'; 
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = '#fff'; 
                  e.currentTarget.querySelector('h3').style.color = '#111'; 
                  e.currentTarget.querySelector('p').style.color = '#666'; 
                }}>
                <div style={{ position: 'absolute', top: '0.4rem', right: '0.6rem', fontSize: '1.8rem', fontWeight: 900, color: 'rgba(0,0,0,0.04)', fontFamily: 'Rajdhani, sans-serif', pointerEvents: 'none' }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ color: '#E53935', marginBottom: '0.4rem', transition: 'all 0.3s' }}>
                    {service.label.toLowerCase().includes('engine') ? <Zap size={22} /> :
                     service.label.toLowerCase().includes('oil') ? <Wrench size={22} /> :
                     service.label.toLowerCase().includes('brake') ? <Shield size={22} /> :
                     service.label.toLowerCase().includes('tyre') || service.label.toLowerCase().includes('wheel') ? <TrendingUp size={22} /> :
                     service.label.toLowerCase().includes('clean') || service.label.toLowerCase().includes('wash') ? <Star size={22} /> :
                     service.label.toLowerCase().includes('express') ? <Clock size={22} /> :
                     service.label.toLowerCase().includes('battery') ? <Zap size={22} /> :
                     service.label.toLowerCase().includes('pick') || service.label.toLowerCase().includes('door') ? <MapPin size={22} /> :
                     <Wrench size={22} />}
                  </div>
                  <h3 style={{ color: '#111', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', transition: 'color 0.2s' }}>{service.label}</h3>
                  <p style={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }}>{service.desc}</p>
                </div>
                <Link to="/services" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#E53935', color: 'white', 
                  padding: '0.5rem 1rem', borderRadius: '4px', 
                  fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.2s', width: 'fit-content'
                }}>
                  Book Now <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
          )}
          <style>{`
            @media (min-width: 1024px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(6, 1fr) !important; gap: 0.8rem !important; }
            }
            @media (max-width: 768px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
            }
            @media (max-width: 480px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
            }
          `}</style>
        </div>
      </section>

      {/* RENT BIKES section — Hide if empty (after loading) */}
      {(rentalLoading || rentalCars.length > 0) && (
        <section style={{ background: '#F5F5F5', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Premium Rentals</p>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Rent <span className="gradient-text">Bikes</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>Choose your ride, pay by the day or hour</p>
              </div>
              <Link to="/rentals" className="btn-outline-dark" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {rentalLoading ? (
              <LoadingSpinner size="lg" text="Loading..." />
            ) : (
              <div className="home-bikes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {rentalCars.map((car) => <RentalCard key={car._id} car={car} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS section — Hide if empty (after loading) */}
      {(partsLoading || featuredParts.length > 0 || featured.length > 0) && (
        <section style={{ background: '#FFFFFF', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Premium Selection</p>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Featured <span className="gradient-text">Products</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>High-quality components for every ride</p>
              </div>
              <Link to="/featured" style={{
                background: '#000', color: 'white', padding: '0.6rem 1.4rem',
                fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none',
                fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
              }}>
                View All Featured <ArrowRight size={16} />
              </Link>
            </div>

            {partsLoading ? (
              <LoadingSpinner size="lg" text="Loading..." />
            ) : (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[
                  ...featured.map((bike) => ({ kind: 'bike', item: bike })),
                  ...featuredParts.map((part) => ({ kind: 'part', item: part })),
                ].slice(0, 8).map(({ kind, item }) => kind === 'bike'
                  ? <BikeCard key={`b-${item._id}`} bike={item} />
                  : <PartCard key={`p-${item._id}`} part={item} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BESTSELLER PRODUCTS section — Hide if empty */}
      {(loading || bestsellerBikes.length > 0 || bestsellerParts.length > 0) && (
      <section style={{ background: '#FFFFFF', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Most Popular</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                Bestseller <span className="gradient-text">Products</span>
              </h2>
              <p style={{ color: '#555', marginTop: '0.3rem' }}>Our most trusted items by riders</p>
            </div>
            <Link to="/bestseller" style={{
              background: '#000', color: 'white', padding: '0.6rem 1.4rem',
              fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none',
              fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              View All Bestsellers <ArrowRight size={16} />
            </Link>
          </div>

          {(loading || partsLoading) ? (
            <LoadingSpinner size="lg" text="Loading..." />
          ) : (
            <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                ...bestsellerBikes.map((bike) => ({ kind: 'bike', item: bike })),
                ...bestsellerParts.map((part) => ({ kind: 'part', item: part })),
              ].slice(0, 8).map(({ kind, item }) => kind === 'bike'
                ? <BikeCard key={`b-${item._id}`} bike={item} />
                : <PartCard key={`p-${item._id}`} part={item} />)}
            </div>
          )}
        </div>
      </section>
      )}

      {/* WHY CHOOSE US */}
      <section style={{ background: '#F5F5F5', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#111111' }}>Why <span className="gradient-text">Dugdug Wheels?</span></h2>
            <p style={{ color: '#555', marginTop: '0.5rem' }}>India's most trusted bike platform</p>
          </div>
          <div className="home-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Instant Quote', desc: 'Get a free, instant valuation for your bike in seconds with our AI engine.', image: instantQuote },
              { title: 'Schedule Inspection', desc: 'Choose a time and our expert mechanics will visit your doorstep for a full inspection.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop' },
              { title: 'Money Transfer', desc: 'Receive secure, instant payment directly to your bank account within 60 minutes.', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop' },
              { title: '1-Hour Service', desc: 'Expert mechanics arrive at your location within 60 minutes for doorstep service.', image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=400&auto=format&fit=crop' },
              { title: 'Verified Sellers', desc: 'All bikes go through a rigorous 150-point check by experts before listing.', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop' },
              { title: 'Doorstep Help', desc: 'Enjoy free pickup and drop for all your bike needs from the comfort of home.', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400&auto=format&fit=crop' },
            ].map(({ title, desc, image }) => (
              <div key={title} style={{ background: 'white', overflow: 'hidden', borderRadius: '12px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: 'all 0.4s' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(229,57,53,0.08)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}>
                <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                       onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1449491073997-d0ce9a901507?q=65&w=400&auto=format&fit=crop'; }} />
                </div>
                <div style={{ padding: '0.8rem 0.7rem', textAlign: 'left' }}>
                  <h3 style={{ color: '#111', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Rajdhani, sans-serif' }}>{title}</h3>
                  <p style={{ color: '#777', fontSize: '0.7rem', lineHeight: 1.4 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonial-section" style={{ background: '#F9F9F9', padding: '4rem 0', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>Testimonials</p>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '3.2rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
              What Our <span style={{ color: '#E53935' }}>Riders</span> Say
            </h2>
            <div style={{ width: 60, height: 4, background: '#E53935', margin: '1.5rem auto 0', borderRadius: '2px' }} />
          </div>

          <style>{`
            .testimonial-track {
              display: flex;
              gap: 4rem;
              width: max-content;
              animation: slide-testimonials 35s linear infinite;
              padding: 2.5rem 0;
            }
            .testimonial-track:hover {
              animation-play-state: paused;
            }
            @keyframes slide-testimonials {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-380px * 5 - 20rem)); }
            }
            .slide-dots {
              display: flex;
              justify-content: center;
              gap: 1rem;
              margin-top: 1rem;
            }
            .slide-dot {
              width: 10px;
              height: 10px;
              border-radius: 5px;
              background: #DDD;
              transition: all 0.3s ease;
            }
            .slide-dot.active {
              width: 30px;
              background: #E53935;
            }
            @media (max-width: 768px) {
              .testimonial-section { padding: 2.5rem 0 !important; }
              .testimonial-section h2 { font-size: 2.2rem !important; }
              .testimonial-track { gap: 2rem; padding: 1.5rem 0; }
            }
          `}</style>

          <div style={{ overflow: 'hidden' }}>
            <div className="testimonial-track">
              {[
                { name: "Rahul Sharma", role: "Royal Enfield Rider", review: "Selling my Classic 350 was incredibly smooth. Got the quote in seconds and the inspection was done within 45 minutes. Truly professional!", color: "#E53935", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
                { name: "Priya Patel", role: "Honda Activa Owner", review: "The doorstep service is a life saver. Dedicated mechanic, genuine parts, and zero hassle. My scooty feels brand new again.", color: "#111", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
                { name: "Aman Singh", role: "KTM RC 390 Rider", review: "Finally a platform that understands superbikes. Found rare spares easily and the performance tuning service is excellent.", color: "#E53935", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200" },
                { name: "Suresh Kumar", role: "Bajaj Dominar Rider", review: "Extensive parts collection! Found a rare silencer for my bike that wasn't available anywhere else in the city.", color: "#111", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
                { name: "Anjali Singh", role: "Adventure Rider", review: "Booked my 50k km service online. The pickup and drop were exactly on time. Very professional automotive service.", color: "#E53935", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" },
                // Loop copies
                { name: "Rahul Sharma", role: "Royal Enfield Rider", review: "Selling my Classic 350 was incredibly smooth. Got the quote in seconds and the inspection was done within 45 minutes. Truly professional!", color: "#E53935", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
                { name: "Priya Patel", role: "Honda Activa Owner", review: "The doorstep service is a life saver. Dedicated mechanic, genuine parts, and zero hassle. My scooty feels brand new again.", color: "#111", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
              ].map((item, i) => (
                <div key={i} style={{ position: 'relative', width: '380px', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute',
                    left: '-45px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    border: `4px solid ${item.color}`,
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 2
                  }}>
                    <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                  </div>
                  <div style={{
                    background: '#fff',
                    padding: '2.5rem 2rem 2.5rem 3.5rem',
                    borderRadius: '24px',
                    border: `1px solid ${item.color === '#111' ? '#111' : '#EEE'}`,
                    boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '15px', right: '25px', color: '#EEE', fontSize: '4rem', fontFamily: 'serif', lineHeight: 1, opacity: 0.5 }}>"</div>
                    <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: '0.2rem' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#E53935', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.2rem' }}>{item.role}</p>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '1.2rem' }}>
                      {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="#FFB400" color="#FFB400" />)}
                    </div>
                    <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{item.review}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="slide-dots">
              {[0, 1, 2].map((dot) => (
                <div key={dot} className={`slide-dot ${dot === 0 ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #C62828 0%, #E53935 50%, #FF5252 100%)',
        padding: '4rem 0', textAlign: 'center',
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Sell Your Bike in Just 1 Hour
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Get instant valuation, schedule pickup, and receive payment — all within 60 minutes.
          </p>
          <Link to="/sell" style={{
            background: 'white', color: '#E53935', padding: '0.9rem 2.5rem',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}>
            Sell My Bike Now <ArrowRight size={18} />
          </Link>
        </div>
      
      </section>
    </div>
  );
}

