import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getActiveServiceTypes, createBooking, createServicePayment, verifyServicePayment } from '../api/serviceApi';
import toast from 'react-hot-toast';
import { Wrench, Clock, MapPin, Calendar, ChevronRight, Loader, CreditCard } from 'lucide-react';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Services() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    getActiveServiceTypes()
      .then(({ data }) => setServiceTypes(data.serviceTypes || []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));
  }, []);

  const handleAdvancePayment = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); setPaying(false); return; }

      const { data } = await createServicePayment(bookingId, { amount: 200 });
      const rzpOrder = data.order;
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || data.key || data.keyId;

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: rzpKey, amount: rzpOrder.amount, currency: rzpOrder.currency || 'INR',
          name: 'Dugdug Wheels', description: `Service: ${selectedService.label}`,
          order_id: rzpOrder.id,
          prefill: { name: user.name, email: user.email, contact: user.phone || '' },
          theme: { color: '#E53935' },
          handler: async (response) => {
            try {
              await verifyServicePayment(bookingId, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: 200
              });
              resolve();
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.open();
      });

      setPaid(true);
      toast.success('Advance payment successful!');
    } catch (err) {
      if (err.message === 'Payment cancelled') toast.error('Payment cancelled');
      else toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await createBooking({
        ...data,
        serviceType: selectedService.value,
        serviceLabel: selectedService.label,
        isPickupDrop: !!data.isPickupDrop,
        isOneHourRepair: !!data.isOneHourRepair,
      });
      setBookingId(res.data.booking?._id || res.data._id);
      setStep(3);
      toast.success('Service booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        @media (max-width: 640px) {
          .svc-form-grid { grid-template-columns: 1fr !important; }
          .svc-addr-grid { grid-template-columns: 1fr !important; }
          .svc-step-label { display: none !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ background: '#F9F9F9', borderBottom: '1px solid #EEE', padding: '1rem 0' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#111', margin: 0 }}>
            Book <span style={{ color: '#E53935' }}>Service</span>
          </h1>
          <p style={{ color: '#666', marginTop: '0.3rem', fontWeight: 500 }}>Professional bike service at your doorstep</p>
 
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '0.8rem' }}>
            {['Select Service', 'Fill Details', 'Confirmed'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > i + 1 ? '#2E7D32' : step === i + 1 ? '#E53935' : '#EEE',
                    color: i + 1 <= step ? 'white' : '#999', fontSize: '0.9rem', fontWeight: 800,
                    boxShadow: step === i + 1 ? '0 4px 10px rgba(229,57,53,0.2)' : 'none'
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="svc-step-label" style={{ color: step === i + 1 ? '#111' : '#888', fontSize: '0.9rem', fontWeight: step === i + 1 ? 700 : 500 }}>{s}</span>
                </div>
                {i < 2 && <div style={{ width: 40, height: 2, background: '#EEE', margin: '0 0.8rem' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.2rem', padding: '0.6rem 1rem', background: 'rgba(251,140,0,0.05)', border: '1px solid rgba(251,140,0,0.15)', borderRadius: '8px' }}>
              <span style={{ color: '#FB8C00', fontSize: '0.8rem', fontWeight: 700 }}>1-Hour Service Available — Mechanic at your doorstep!</span>
            </div>
 
            {typesLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: '12px' }} />)}
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
              {serviceTypes.map((service) => (
                <button key={service.value} onClick={() => handleServiceSelect(service)}
                  style={{ textAlign: 'left', background: '#FFF', border: '1px solid #EEE', borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.3s', width: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EEE'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <h3 style={{ color: '#111', fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'Rajdhani, sans-serif' }}>{service.label.toUpperCase()}</h3>
                  <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.8rem', lineHeight: 1.4 }}>{service.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#E53935', fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>{service.price}</span>
                    <ChevronRight size={16} style={{ color: '#E53935' }} />
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
        )}
 
        {/* Step 2: Booking Form */}
        {step === 2 && selectedService && (
          <div className="animate-fadeInUp">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9F9F9', borderRadius: '12px', marginBottom: '1.2rem', border: '1px solid #EEE' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#111', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif' }}>{selectedService.label}</h3>
                <span style={{ color: '#E53935', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>{selectedService.price}</span>
              </div>
              <button onClick={() => setStep(1)} style={{ background: '#FFF', border: '1.5px solid #EEE', borderRadius: '8px', color: '#666', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                Change
              </button>
            </div>
 
            <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '16px', padding: '1.2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <div className="svc-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ color: '#333', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Bike Brand *</label>
                  <input className="input-light" placeholder="Brand" {...register('bikeBrand', { required: 'Required' })} style={{ height: '42px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ color: '#333', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Bike Model *</label>
                  <input className="input-light" placeholder="Model" {...register('bikeModel', { required: 'Required' })} style={{ height: '42px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ color: '#333', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Date *</label>
                  <input type="date" className="input-light" {...register('scheduledDate', { required: 'Required' })} min={new Date().toISOString().split('T')[0]} style={{ height: '42px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ color: '#333', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Time *</label>
                  <select className="input-light" {...register('scheduledTime', { required: 'Required' })} style={{ height: '42px', fontSize: '0.85rem', background: '#FFF' }}>
                    <option value="">Time slot</option>
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div style={{ marginTop: '0.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Description</label>
                <textarea className="input-light" rows={2} placeholder="Description..."
                  style={{ resize: 'vertical', padding: '0.6rem', fontSize: '0.85rem' }} {...register('problemDescription')} />
              </div>
 
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#F9F9F9', borderRadius: '10px', border: '1px solid #EEE' }}>
                <div style={{ color: '#111', fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', marginBottom: '0.6rem' }}>PICKUP & DROP ADDRESS</div>
                <div className="svc-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <input className="input-light" placeholder="Street" {...register('address.street')} style={{ height: '38px', fontSize: '0.8rem' }} />
                  <input className="input-light" placeholder="City" {...register('address.city')} style={{ height: '38px', fontSize: '0.8rem' }} />
                  <input className="input-light" placeholder="State" {...register('address.state')} style={{ height: '38px', fontSize: '0.8rem' }} />
                  <input className="input-light" placeholder="Pin" {...register('address.pincode')} style={{ height: '38px', fontSize: '0.8rem' }} />
                </div>
              </div>
 
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('isPickupDrop')} style={{ accentColor: '#E53935', width: 16, height: 16 }} />
                  <span style={{ color: '#444', fontSize: '0.85rem', fontWeight: 600 }}>Pickup & Drop</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('isOneHourRepair')} style={{ accentColor: '#E53935', width: 16, height: 16 }} />
                  <span style={{ color: '#444', fontSize: '0.85rem', fontWeight: 600 }}>1-Hour Repair</span>
                </label>
              </div>
 
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-outline-dark" style={{ height: '46px', flex: 1, justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ height: '46px', flex: 2, justifyContent: 'center', fontWeight: 700, borderRadius: '10px', fontSize: '0.9rem' }} disabled={submitting}>
                  {submitting ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'CONFIRM BOOKING'}
                </button>
              </div>
            </form>
          </div>
        )}
 
        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="animate-fadeInUp" style={{ textAlign: 'center', padding: '1.5rem 1.2rem', background: '#FFF', borderRadius: '24px', border: '1px solid #EEE', boxShadow: '0 15px 50px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '0.8rem' }}>✓</div>
            <h2 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem' }}>
              BOOKING <span style={{ color: '#E53935' }}>SUCCESSFUL!</span>
            </h2>
            <p style={{ color: '#666', marginBottom: '1.2rem', fontSize: '0.95rem', fontWeight: 500 }}>Our specialist mechanic will arrive at your location as per schedule.</p>
 
            {/* Advance Payment Option */}
            {bookingId && !paid && (
              <div style={{ margin: '0 auto 1.2rem', maxWidth: 420, background: '#F9F9F9', border: '1px solid #EEE', borderRadius: '16px', padding: '1.2rem' }}>
                <h4 style={{ color: '#111', fontWeight: 800, marginBottom: '0.3rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>PRIORITIZE YOUR BOOKING</h4>
                <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 500 }}>
                  Pay ₹200 advance to get your bike serviced on top priority.
                </p>
                <button onClick={handleAdvancePayment} disabled={paying}
                  style={{ width: '100%', padding: '0.8rem', background: paying ? '#EEE' : 'linear-gradient(135deg, #E53935, #C62828)', color: paying ? '#AAA' : 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em', fontSize: '0.9rem', boxShadow: paying ? 'none' : '0 8px 20px rgba(229,57,53,0.2)' }}>
                  <CreditCard size={18} /> {paying ? 'PROCESSING...' : 'PAY ADVANCE NOW →'}
                </button>
              </div>
            )}
            {paid && (
              <div style={{ margin: '0 auto 1.2rem', maxWidth: 420, background: 'rgba(46,125,50,0.05)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '16px', padding: '1rem' }}>
                <p style={{ color: '#2E7D32', fontSize: '0.9rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏆</span> PRIORITY ADVANCE RECEIVED
                </p>
              </div>
            )}
 
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/my-bookings')} className="btn-primary" style={{ padding: '0.8rem 2.5rem', fontWeight: 700, background: '#111', border: 'none' }}>Track Booking Status</button>
              <button onClick={() => { setStep(1); setSelectedService(null); setBookingId(null); setPaid(false); }} className="btn-outline-dark" style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}>Book Another Bike</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
