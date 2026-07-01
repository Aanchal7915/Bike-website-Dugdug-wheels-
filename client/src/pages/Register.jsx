import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useState } from 'react';
import LogoIcon from '../components/common/LogoIcon';

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created! Welcome');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ height: '100vh', background: '#F9F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#111', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', border: '3px solid #E53935', boxShadow: '0 4px 15px rgba(229,57,53,0.2)' }}>
            <LogoIcon size={52} />
          </Link>
          <h1 style={{ color: '#111', fontSize: '1.4rem', fontWeight: 900, marginTop: '0.2rem', fontFamily: 'Rajdhani, sans-serif' }}>Create Account</h1>
          <p style={{ color: '#666', marginTop: '0.1rem', fontSize: '0.82rem' }}>Join India's fastest bike platform</p>
        </div>
 
        <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '16px', padding: '1.4rem', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {[
              { name: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe', type: 'text', rules: { required: 'Name is required' } },
              { name: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email', rules: { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } } },
              { name: 'phone', label: 'Mobile', icon: Phone, placeholder: '98765 43210', type: 'tel', rules: {} },
            ].map(({ name, label, icon: Icon, placeholder, type, rules }) => (
              <div key={name} style={{ marginBottom: '0.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type={type} className="input-light" style={{ paddingLeft: '2.5rem', height: '40px', fontSize: '0.85rem' }} placeholder={placeholder} {...register(name, rules)} />
                </div>
                {errors[name] && <p style={{ color: '#E53935', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors[name].message}</p>}
              </div>
            ))}
 
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#333', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                <input type={showPass ? 'text' : 'password'} className="input-light" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '40px', fontSize: '0.85rem' }}
                  placeholder="Min. 6 chars"
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#E53935', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.password.message}</p>}
            </div>
 
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem', lineHeight: 1.4 }}>
              By signing up, you agree to our{' '}
              <Link to="/terms" style={{ color: '#E53935', textDecoration: 'none', fontWeight: 700 }}>Terms</Link> & <Link to="/privacy" style={{ color: '#E53935', textDecoration: 'none', fontWeight: 700 }}>Privacy</Link>.
            </p>
 
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }} disabled={loading}>
              {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowRight size={18} /> CREATE ACCOUNT</>}
            </button>
          </form>
        </div>
 
        <p style={{ textAlign: 'center', color: '#666', marginTop: '0.8rem', fontSize: '0.82rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#E53935', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
