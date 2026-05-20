import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { sendOTP } from '../api/authApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Phone, ArrowRight, Loader } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
  const { login, loginWithOTP, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const contactValue = watch('email') || watch('phone');

  const onSubmit = async (data) => {
    try {
      if (mode === 'password') {
        await login(data);
        toast.success('Welcome back!');
        navigate('/');
      } else if (mode === 'otp' && !otpSent) {
        await sendOTP({ email: data.email, phone: data.phone });
        setOtpSent(true);
        toast.success('OTP sent!');
      } else if (mode === 'otp' && otpSent) {
        await loginWithOTP({ email: data.email, phone: data.phone, otp: data.otp });
        toast.success('Welcome!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ height: '100vh', background: '#F9F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#111', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid #E53935', boxShadow: '0 4px 15px rgba(229,57,53,0.2)' }}>
            <img src={logo} alt="MotoExpress Logo" style={{ width: '66px', height: 'auto' }} />
          </Link>
          <h1 style={{ color: '#111', fontSize: '1.4rem', fontWeight: 900, marginTop: '0.2rem', fontFamily: 'Rajdhani, sans-serif' }}>Welcome Back</h1>
          <p style={{ color: '#666', marginTop: '0.1rem', fontSize: '0.82rem' }}>Login to your account</p>
        </div>
 
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: '#F0F0F0', borderRadius: '10px', padding: '4px', marginBottom: '1rem', border: '1px solid #EEE' }}>
          {['password', 'otp'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setOtpSent(false); }}
              style={{
                flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: mode === m ? '#FFF' : 'transparent',
                color: mode === m ? '#E53935' : '#888',
                fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.25s',
              }}>
              {m === 'password' ? 'Password' : 'OTP'}
            </button>
          ))}
        </div>
 
        {/* Form card */}
        <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '16px', padding: '1.4rem', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#888', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                <input type="email" className="input-light" style={{ paddingLeft: '2.8rem', height: '52px' }}
                  placeholder="you@example.com"
                  {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p style={{ color: '#E53935', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.email.message}</p>}
            </div>
 
            {/* For OTP - phone option */}
            {mode === 'otp' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  Or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type="tel" className="input-light" style={{ paddingLeft: '2.8rem', height: '52px' }}
                    placeholder="+91 98765 43210"
                    {...register('phone')} />
                </div>
              </div>
            )}
 
            {/* Password */}
            {mode === 'password' && (
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type={showPass ? 'text' : 'password'} className="input-light" style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem', height: '52px' }}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#E53935', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.password.message}</p>}
              </div>
            )}
 
            {/* OTP Input */}
            {mode === 'otp' && otpSent && (
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Enter OTP</label>
                <input type="text" className="input-light" placeholder="6-digit OTP"
                  maxLength={6} style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.6rem', height: '60px' }}
                  {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'Enter 6 digits' } })} />
                {errors.otp && <p style={{ color: '#E53935', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.otp.message}</p>}
              </div>
            )}
 
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '12px' }} disabled={loading}>
              {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <>
                  {mode === 'password' ? 'LOGIN' : otpSent ? 'VERIFY OTP' : 'SEND OTP'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
 
        <p style={{ textAlign: 'center', color: '#666', marginTop: '0.8rem', fontSize: '0.82rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#E53935', textDecoration: 'none', fontWeight: 700 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
