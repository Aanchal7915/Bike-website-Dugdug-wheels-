import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import * as adminApi from '../../api/adminApi';
import * as rentalApi from '../../api/rentalApi';
import toast from 'react-hot-toast';
import { Users, Bike, Wrench, TrendingUp, Package, Clock, Check, CheckCircle, AlertCircle, BarChart3, Settings, LogOut, Home, ShoppingBag, List, Loader, Plus, Edit2, Trash2, Menu, X, Car, Calendar, MapPin, Search } from 'lucide-react';
import { io } from 'socket.io-client';
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.2rem 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
      <span style={{ color: '#888', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 950, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
  </div>
);

const FilterBar = ({ 
  filterMode, setFilterMode, 
  filterDay, setFilterDay, 
  filterMonth, setFilterMonth, 
  filterYear, setFilterYear, 
  filterFrom, setFilterFrom, 
  filterTo, setFilterTo, 
  statusFilter, setStatusFilter,
  statusOptions = [] 
}) => {
  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '0.8rem 1rem', marginBottom: '1.2rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Filter:</span>
      {[['all', 'All'], ['day', 'Day'], ['month', 'Month'], ['year', 'Year'], ['custom', 'Custom']].map(([k, lbl]) => (
        <button key={k} type="button" onClick={() => setFilterMode(k)}
          style={{
            padding: '0.35rem 0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: filterMode === k ? '#E53935' : 'white',
            color: filterMode === k ? 'white' : '#475569',
            fontWeight: 800, fontSize: '0.75rem',
            boxShadow: filterMode === k ? '0 4px 10px rgba(229,57,53,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{lbl}</button>
      ))}
      {filterMode === 'day' && (
        <input type="date" value={filterDay} onChange={e => setFilterDay(e.target.value)}
          className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700 }} />
      )}
      {filterMode === 'month' && (
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700 }} />
      )}
      {filterMode === 'year' && (
        <input type="number" min="2020" max="2099" value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700, width: 100 }} />
      )}
      {filterMode === 'custom' && (
        <>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
            className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700 }} />
          <span style={{ color: '#94A3B8', fontWeight: 700 }}>→</span>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
            className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700 }} />
        </>
      )}
      <span style={{ width: 1, height: 24, background: '#E2E8F0', margin: '0 0.4rem' }} />
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        className="input-light" style={{ height: 36, padding: '0 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>
        <option value="all">All Statuses</option>
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

const UsersTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    adminApi.getUsers().then(({ data }) => setData(data.users || [])).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, isActive) => {
    try {
      await adminApi.updateUser(id, { isActive: !isActive });
      setData(data.map(d => d._id === id ? { ...d, isActive: !isActive } : d));
      toast.success(isActive ? 'User banned' : 'User unbanned!');
    } catch { toast.error('Error updating status'); }
  };

  const changeRole = async (id, role) => {
    try {
      await adminApi.updateUser(id, { role });
      setData(data.map(d => d._id === id ? { ...d, role } : d));
      toast.success('Role updated!');
    } catch { toast.error('Error updating role'); }
  };

  const filtered = data.filter(u => {
    if (statusFilter !== 'all' && u.role !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(u.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  if(loading) return <div style={{textAlign:'center', padding:'3rem', color:'#888'}}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  return (
    <div className="admin-table-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', textTransform: 'uppercase' }}>PLATFORM <span style={{ color: '#E53935' }}>USERS</span> ({filtered.length})</h3>
      
      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={[{ value: 'user', label: 'USER' }, { value: 'admin', label: 'ADMIN' }, { value: 'mechanic', label: 'MECHANIC' }]}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>User Details</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Registered On</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Role & Access Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u._id} style={{ borderBottom: '1px solid #F5F5F5' }}>
              <td style={{ padding: '1.2rem', color: '#111', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#F9F9F9', border: '1.5px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53935', fontWeight: 900, fontSize: '1.1rem' }}>{u.name?.charAt(0).toUpperCase()}</div>
                <span style={{ fontWeight: 800 }}>{u.name}</span>
              </td>
              <td style={{ padding: '1rem', color: '#888', fontWeight: 600 }}>{u.email}<br/>{u.phone || '-'}</td>
              <td style={{ padding: '1rem', color: '#888', fontWeight: 600 }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <select className="input-light" style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto', background: '#F9F9F9', width: '110px', fontWeight: 700 }} value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                    <option value="user">USER</option><option value="admin">ADMIN</option><option value="mechanic">MECHANIC</option>
                  </select>
                  <button onClick={() => toggleStatus(u._id, u.isActive)} style={{ background: u.isActive ? '#2E7D3215' : '#E5393515', color: u.isActive ? '#2E7D32' : '#E53935', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {u.isActive ? 'ACTIVE' : 'BANNED'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan={4} style={{ padding: '5rem 2rem', textAlign: 'center', color: '#AAA', fontWeight: 800, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '0 0 24px 24px' }}>No users found matching filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const ServicesTab = () => {
  const [data, setData] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [stLoading, setStLoading] = useState(true);
  const [showStForm, setShowStForm] = useState(false);
  const [editSt, setEditSt] = useState(null);
  const [stForm, setStForm] = useState({ value: '', label: '', price: '', desc: '', order: 0, isActive: true });
  const [showMechForm, setShowMechForm] = useState(false);
  const [mechForm, setMechForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [savingMech, setSavingMech] = useState(false);

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleAddMechanic = async (e) => {
    e.preventDefault();
    if (!mechForm.name || !mechForm.password || (!mechForm.email && !mechForm.phone)) {
      toast.error('Name, password, and email or phone are required');
      return;
    }
    setSavingMech(true);
    try {
      const { data } = await adminApi.createMechanic(mechForm);
      setMechanics(prev => [...prev, data.mechanic]);
      setMechForm({ name: '', email: '', phone: '', password: '' });
      setShowMechForm(false);
      toast.success('Mechanic added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add mechanic');
    } finally {
      setSavingMech(false);
    }
  };

  useEffect(() => {
    Promise.all([adminApi.getServices(), adminApi.getMechanics(), adminApi.getServiceTypes()])
      .then(([srvRes, mechRes, stRes]) => {
        setData(srvRes.data.bookings || []);
        setMechanics(mechRes.data.mechanics || []);
        setServiceTypes(stRes.data.serviceTypes || []);
      }).finally(() => { setLoading(false); setStLoading(false); });
  }, []);

  const handleStatus = async (id, status, mechanicId) => {
    try {
      const { data: res } = await adminApi.updateServiceStatus(id, { status, mechanic: mechanicId });
      const updated = res.booking || {};
      const mechObj = updated.mechanic || mechanics.find(m => m._id === mechanicId) || null;
      setData(prev => prev.map(d => d._id === id
        ? { ...d, status: updated.status || status, mechanic: mechanicId ? mechObj : null }
        : d));
      toast.success(mechanicId ? 'Mechanic assigned!' : 'Booking updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating service');
    }
  };

  const filtered = data.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(b.scheduledDate);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  const resetStForm = () => { setShowStForm(false); setEditSt(null); setStForm({ value: '', label: '', price: '', desc: '', order: 0, isActive: true }); };

  const handleStSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSt) {
        const { data } = await adminApi.updateServiceType(editSt, stForm);
        if (data.serviceType) {
          setServiceTypes(prev => prev.map(s => s._id === editSt ? data.serviceType : s));
          toast.success('Service type updated!');
          resetStForm();
        } else {
          toast.error('Update failed: Server did not return updated data');
        }
      } else {
        const { data } = await adminApi.createServiceType(stForm);
        if (data.serviceType) {
          setServiceTypes(prev => [...prev, data.serviceType]);
          toast.success('Service type added!');
          resetStForm();
        } else {
          toast.error('Add failed: Server did not return new data');
        }
      }
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to save service type'); 
    }
  };

  const handleStEdit = (st) => {
    setEditSt(st._id);
    setStForm({ value: st.value, label: st.label, price: st.price, desc: st.desc || '', order: st.order || 0, isActive: st.isActive });
    setShowStForm(true);
  };

  const handleStDelete = async (id) => {
    if (!window.confirm('Delete this service type?')) return;
    try {
      await adminApi.deleteServiceType(id);
      setServiceTypes(serviceTypes.filter(s => s._id !== id));
      toast.success('Service type deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if(loading) return <div style={{textAlign:'center', padding:'3rem', color:'#888'}}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  const statusOpts = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Service Types Management ── */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', margin: 0, textTransform: 'uppercase' }}>SERVICE <span style={{ color: '#E53935' }}>TYPES</span></h3>
          <button onClick={() => { resetStForm(); setShowStForm(!showStForm); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showStForm ? '#F5F5F5' : '#E53935', color: showStForm ? '#666' : 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}>
            {showStForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Service</>}
          </button>
        </div>

        {showStForm && (
          <form onSubmit={handleStSubmit} style={{ background: '#F9F9F9', border: '1px solid #EEE', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>VALUE (unique key) *</label>
                <input className="input-light" placeholder="e.g. engine_repair" value={stForm.value} onChange={e => setStForm({ ...stForm, value: e.target.value })} required style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>LABEL *</label>
                <input className="input-light" placeholder="e.g. Engine Repair" value={stForm.label} onChange={e => setStForm({ ...stForm, label: e.target.value })} required style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>PRICE TEXT *</label>
                <input className="input-light" placeholder="e.g. From ₹999" value={stForm.price} onChange={e => setStForm({ ...stForm, price: e.target.value })} required style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                <input className="input-light" placeholder="Short description" value={stForm.desc} onChange={e => setStForm({ ...stForm, desc: e.target.value })} style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>ORDER</label>
                <input type="number" className="input-light" value={stForm.order} onChange={e => setStForm({ ...stForm, order: Number(e.target.value) })} style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>
                  <input type="checkbox" checked={stForm.isActive} onChange={e => setStForm({ ...stForm, isActive: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#E53935' }} /> Active
                </label>
                <button type="submit" style={{ background: '#E53935', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                  {editSt ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
          {serviceTypes.map(st => (
            <div key={st._id} style={{ background: st.isActive ? '#FFF' : '#F9F9F9', border: '1px solid #EEE', borderRadius: '12px', padding: '1rem', opacity: st.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <h4 style={{ color: '#111', fontWeight: 800, fontSize: '0.95rem', margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                  {st.label.toUpperCase()}
                  <span style={{ fontSize: '0.65rem', color: '#AAA', marginLeft: '0.6rem', fontWeight: 600 }}>ID: {st.value}</span>
                </h4>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={() => handleStEdit(st)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleStDelete(st._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53935', padding: '2px' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p style={{ color: '#666', fontSize: '0.72rem', margin: '0.2rem 0 0.5rem' }}>{st.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#E53935', fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}>{st.price}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: st.isActive ? '#2E7D32' : '#888' }}>{st.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mechanics Management ── */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', margin: 0, textTransform: 'uppercase' }}>MECHANICS <span style={{ color: '#E53935' }}>({mechanics.length})</span></h3>
          <button onClick={() => setShowMechForm(!showMechForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showMechForm ? '#F5F5F5' : '#E53935', color: showMechForm ? '#666' : 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}>
            {showMechForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Mechanic</>}
          </button>
        </div>

        {showMechForm && (
          <form onSubmit={handleAddMechanic} style={{ background: '#F9F9F9', border: '1px solid #EEE', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>NAME *</label>
                <input className="input-light" placeholder="Mechanic name" value={mechForm.name} onChange={e => setMechForm({ ...mechForm, name: e.target.value })} required style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>EMAIL</label>
                <input type="email" className="input-light" placeholder="email@example.com" value={mechForm.email} onChange={e => setMechForm({ ...mechForm, email: e.target.value })} style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>PHONE</label>
                <input type="tel" className="input-light" placeholder="10-digit mobile" value={mechForm.phone} onChange={e => setMechForm({ ...mechForm, phone: e.target.value })} style={{ height: 42, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ color: '#666', fontSize: '0.72rem', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>PASSWORD *</label>
                <input type="password" className="input-light" placeholder="Min 6 characters" value={mechForm.password} onChange={e => setMechForm({ ...mechForm, password: e.target.value })} required minLength={6} style={{ height: 42, fontWeight: 600 }} />
              </div>
            </div>
            <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={savingMech} style={{ background: '#E53935', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', cursor: savingMech ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
                {savingMech ? 'Saving...' : 'Add Mechanic'}
              </button>
            </div>
            <p style={{ color: '#888', fontSize: '0.7rem', marginTop: '0.6rem', fontWeight: 600 }}>Provide email or phone (at least one). Mechanic can use these credentials to log in.</p>
          </form>
        )}

        {mechanics.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
            {mechanics.map(m => (
              <div key={m._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#FEE2E2', color: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>{m.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: '#111', fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.phone || m.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem', background: '#F9F9F9', borderRadius: '12px', fontWeight: 600 }}>
            No mechanics yet. Click "Add Mechanic" to add one — they'll appear in the assignment dropdown below.
          </p>
        )}
      </div>

      {/* ── Service Bookings Table ── */}
      <div className="admin-table-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', marginBottom: '1rem', textTransform: 'uppercase' }}>SERVICE <span style={{ color: '#E53935' }}>BOOKINGS</span> ({filtered.length})</h3>
        
        <FilterBar 
          filterMode={filterMode} setFilterMode={setFilterMode}
          filterDay={filterDay} setFilterDay={setFilterDay}
          filterMonth={filterMonth} setFilterMonth={setFilterMonth}
          filterYear={filterYear} setFilterYear={setFilterYear}
          filterFrom={filterFrom} setFilterFrom={setFilterFrom}
          filterTo={filterTo} setFilterTo={setFilterTo}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          statusOptions={statusOpts.map(o => ({ value: o, label: o.replace('_', ' ').toUpperCase() }))}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Bike & Service</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date & Type</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #EEE', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status & Mechanic Assign</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                <td style={{ padding: '1.2rem', color: '#111', fontWeight: 700 }}>{item.user?.name}<br/><span style={{color:'#888',fontSize:'0.82rem',fontWeight:600}}>{item.user?.phone}</span></td>
                <td style={{ padding: '1.2rem', color: '#111', fontWeight: 700 }}>{item.bikeBrand} {item.bikeModel}<br/><span style={{color:'#888',fontSize:'0.82rem',fontWeight:600}}>{item.serviceLabel}</span></td>
                <td style={{ padding: '1.2rem', color: '#111', fontWeight: 700 }}>{new Date(item.scheduledDate).toLocaleDateString('en-IN')}<br/><span style={{color:'#888',fontSize:'0.82rem',fontWeight:600}}>{item.serviceType.replace('_',' ').toUpperCase()}</span></td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', flexDirection: 'column', maxWidth: '220px' }}>
                    <select className="input-light" style={{ padding: '0.5rem', fontSize: '0.85rem', height: 'auto', background: '#F9F9F9', fontWeight: 700 }} value={item.status} onChange={(e) => handleStatus(item._id, e.target.value, item.mechanic?._id)}>
                      <option value="requested">Requested</option><option value="accepted">Accepted</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                    </select>
                    <select className="input-light" style={{ padding: '0.5rem', fontSize: '0.85rem', height: 'auto', background: '#F9F9F9', fontWeight: 700 }} value={item.mechanic?._id || ''} onChange={(e) => handleStatus(item._id, item.status, e.target.value)}>
                      <option value="">Assign Mechanic...</option>
                      {mechanics.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#AAA', fontWeight: 800, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '0 0 24px 24px' }}>No bookings found matching filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PartsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCatImage, setNewCatImage] = useState(null);
  const [newCatImagePreview, setNewCatImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '', description: '', brand: '', category: '',
    featured: false, bestSeller: false, comingSoon: false,
    itemType: '', subCategory: '',
    farmerName: '', farmerPhone: '', farmerLocation: '', farmerEmail: '',
    videoUrl: '', price: '', discountedPrice: ''
  });
  const [pincodePricingRows, setPincodePricingRows] = useState([
    { pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }
  ]);
  const [pincodeLocationMap, setPincodeLocationMap] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  const extractPincodes = (value = '') =>
    value.split(',').map(p => p.trim()).filter(p => /^\d{6}$/.test(p));

  const resolvePincodeLocation = async (pincode) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const json = await res.json();
      const po = json?.[0]?.PostOffice?.[0];
      return po ? `${po.District}, ${po.State}` : '';
    } catch { return ''; }
  };

  // Auto-resolve pincode locations
  useEffect(() => {
    const allPins = [...new Set(pincodePricingRows.flatMap(r => extractPincodes(r.pincodes)))];
    if (!allPins.length) return;
    let alive = true;
    (async () => {
      for (const pin of allPins) {
        if (pincodeLocationMap[pin]) continue;
        const loc = await resolvePincodeLocation(pin);
        if (!alive || !loc) continue;
        setPincodeLocationMap(prev => prev[pin] ? prev : { ...prev, [pin]: loc });
      }
    })();
    return () => { alive = false; };
  }, [pincodePricingRows]);

  // Auto-fill farmerLocation from resolved pincode locations
  useEffect(() => {
    const allPins = [...new Set(pincodePricingRows.flatMap(r => extractPincodes(r.pincodes)))];
    const locs = [...new Set(allPins.map(p => pincodeLocationMap[p]).filter(Boolean))];
    if (!locs.length) return;
    const merged = locs.join(', ');
    setFormData(prev => prev.farmerLocation === merged ? prev : { ...prev, farmerLocation: merged });
  }, [pincodePricingRows, pincodeLocationMap]);

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    adminApi.getParts().then(({ data }) => setData(data.parts || [])).finally(() => setLoading(false));
    adminApi.getAdminCategories().then(({ data }) => setCategories(data.categories || []));
  }, []);

  const filtered = data.filter(item => {
    if (statusFilter !== 'all' && item.category !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(item.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const fd = new FormData();
      fd.append('name', newCatName.trim());
      if (newCatImage) fd.append('image', newCatImage);
      const { data } = await adminApi.createCategory(fd);
      setCategories([...categories, data.category]);
      setFormData({ ...formData, category: data.category.name });
      setShowAddCategory(false); setNewCatName(''); setNewCatImage(null); setNewCatImagePreview('');
      toast.success('Category added');
    } catch { toast.error('Error adding category'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch { toast.error('Error deleting category'); }
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null); setImages([]); setImagePreviews([]); setExistingImages([]); setVideoFile(null); setExistingVideoUrl('');
    setFormData({ name: '', description: '', brand: '', category: '', featured: false, bestSeller: false, comingSoon: false, itemType: '', subCategory: '', farmerName: '', farmerPhone: '', farmerLocation: '', farmerEmail: '', videoUrl: '' });
    setPincodePricingRows([{ pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }]);
    setPincodeLocationMap({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await adminApi.deletePart(id);
      setData(data.filter(d => d._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Error deleting product'); }
  };

  const handleEdit = (part) => {
    setEditId(part._id);
    setFormData({
      name: part.name || '', description: part.description || '', brand: part.brand || '', category: part.category || '',
      featured: part.isFeatured || false, bestSeller: part.bestSeller || false, comingSoon: part.comingSoon || false,
      itemType: part.itemType || '', subCategory: part.subCategory || '',
      farmerName: part.farmerDetails?.name || '',
      farmerPhone: part.farmerDetails?.phone || '',
      farmerLocation: part.farmerDetails?.location || '',
      farmerEmail: part.farmerDetails?.email || '',
      videoUrl: part.videoUrl || '',
      price: part.price || '',
      discountedPrice: part.discountedPrice || ''
    });
    if (Array.isArray(part.pincodePricing) && part.pincodePricing.length > 0) {
      const rowMap = {};
      const newLocMap = { ...pincodeLocationMap };
      part.pincodePricing.forEach(p => {
        if (p.pincode && p.location) newLocMap[p.pincode] = p.location;
        const key = `${p.size || ''}|${p.price || 0}|${p.originalPrice || 0}|${p.discount || 0}|${p.inventory || 0}`;
        if (!rowMap[key]) {
          rowMap[key] = {
            pincodes: p.pincode,
            size: p.size || '',
            originalPrice: p.originalPrice !== undefined && p.originalPrice !== null ? String(p.originalPrice) : '',
            discount: p.discount !== undefined && p.discount !== null ? String(p.discount) : '',
            price: p.price !== undefined && p.price !== null ? String(p.price) : '',
            inventory: p.inventory !== undefined && p.inventory !== null ? String(p.inventory) : ''
          };
        } else {
          rowMap[key].pincodes += ', ' + p.pincode;
        }
      });
      setPincodeLocationMap(newLocMap);
      setPincodePricingRows(Object.values(rowMap));
    } else {
      setPincodePricingRows([{ pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }]);
    }
    const allMedia = [...(part.images || [])];
    if (part.videoUrl && !allMedia.includes(part.videoUrl)) allMedia.push(part.videoUrl);
    setImages([]); setImagePreviews([]); setExistingImages(allMedia); setVideoFile(null); setExistingVideoUrl(''); setShowForm(true);
  };

  const handlePincodeRowChange = (idx, e) => {
    const { name, value } = e.target;
    const rows = pincodePricingRows.map((r, i) => i === idx ? { ...r, [name]: value } : r);
    const r = rows[idx];
    const orig = parseFloat(r.originalPrice), disc = parseFloat(r.discount), price = parseFloat(r.price);
    if (name === 'originalPrice' && !isNaN(orig) && orig > 0) {
      if (!isNaN(price)) rows[idx].discount = String(Math.max(0, ((orig - price) / orig * 100)).toFixed(2));
      else if (!isNaN(disc)) rows[idx].price = String(Math.round(orig - orig * disc / 100));
    } else if (name === 'discount' && !isNaN(disc)) {
      if (!isNaN(price) && disc < 100) rows[idx].originalPrice = String(Math.round(price / (1 - disc / 100)));
      else if (!isNaN(orig)) rows[idx].price = String(Math.round(orig - orig * disc / 100));
    } else if (name === 'price' && !isNaN(price)) {
      if (!isNaN(orig) && orig > 0) rows[idx].discount = String(Math.max(0, ((orig - price) / orig * 100)).toFixed(2));
      else if (!isNaN(disc) && disc < 100) rows[idx].originalPrice = String(Math.round(price / (1 - disc / 100)));
    }
    setPincodePricingRows(rows);
  };

  const buildPricingPayload = () => {
    const result = [];
    pincodePricingRows.forEach(row => {
      if (!row.pincodes || row.price === '') return;
      extractPincodes(row.pincodes).forEach(pin => result.push({
        pincode: pin, location: pincodeLocationMap[pin] || '', size: row.size,
        originalPrice: row.originalPrice !== '' ? Number(row.originalPrice) : null,
        discount: row.discount !== '' ? Number(row.discount) : null,
        price: Number(row.price), inventory: Number(row.inventory || 0)
      }));
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pricing = buildPricingPayload();
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('brand', formData.brand);
      fd.append('category', formData.category || 'other');
      fd.append('isFeatured', formData.featured);
      fd.append('bestSeller', formData.bestSeller);
      fd.append('comingSoon', formData.comingSoon);
      fd.append('itemType', formData.itemType);
      fd.append('subCategory', formData.subCategory);
      fd.append('farmerDetails', JSON.stringify({ name: formData.farmerName, phone: formData.farmerPhone, location: formData.farmerLocation, email: formData.farmerEmail }));
      fd.append('pincodePricing', JSON.stringify(pricing));
      fd.append('price', String(pricing[0]?.originalPrice || formData.price || 0));
      fd.append('discountedPrice', String(pricing[0]?.price || formData.discountedPrice || 0));
      fd.append('stock', String(pricing.reduce((s, p) => s + (p.inventory || 0), 0)));
      for (const img of images) fd.append('images', img);
      for (const url of existingImages) fd.append('existingImages', url);

      if (editId) {
        const { data: res } = await adminApi.updatePartMultipart(editId, fd);
        setData(data.map(d => d._id === editId ? res.part : d));
        toast.success('Product updated');
      } else {
        const { data: res } = await adminApi.createPart(fd);
        setData([res.part, ...data]);
        toast.success('Product created');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  if (showForm) {
    return (
      <div className="admin-form-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontSize: '2rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{editId ? 'UPDATE' : 'ADD NEW'} <span style={{ color: '#E53935' }}>PRODUCT</span></h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>

          {/* Core Details */}
          <div style={{ background: '#F9F9F9', padding: '2rem', borderRadius: '20px', border: '1.5px solid #EEE' }}>
            <h4 style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>CORE DETAILS</h4>
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>PRODUCT NAME *</label><input required className="input-light" style={{ height: '54px', fontWeight: 600 }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>DESCRIPTION</label><textarea className="input-light" style={{ minHeight: '120px', fontWeight: 600, padding: '1rem' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>BRAND</label><input className="input-light" style={{ height: '54px', fontWeight: 600 }} value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} /></div>
                <div>
                  <label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>CATEGORY</label>
                  <select className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.category} onChange={e => {
                    if (e.target.value === 'CREATE_NEW') { setShowAddCategory(true); setFormData({ ...formData, category: '' }); }
                    else { setShowAddCategory(false); setFormData({ ...formData, category: e.target.value }); }
                  }}>
                    <option value="">SELECT CATEGORY</option>
                    {categories.map(c => (
                      <option key={c._id || c.name} value={c.name}>{c.name.replace(/_/g, ' ').toUpperCase()}</option>
                    ))}
                    <option value="CREATE_NEW" style={{ color: '#E53935', fontWeight: 'bold' }}>+ CREATE NEW CATEGORY</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {showAddCategory && (
            <div style={{ background: '#FFF1F0', padding: '2rem', borderRadius: '20px', border: '1.5px dashed #E53935', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#E53935', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>NEW CATEGORY</h4>
                <button type="button" onClick={() => setShowAddCategory(false)} style={{ background: '#FFFFFF', border: '1.5px solid #EEE', color: '#111', width: 32, height: 32, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gap: '1.2rem', marginBottom: '0.5rem' }}>
                <input className="input-light" style={{ height: '54px', fontWeight: 600 }} placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>CATEGORY IMAGE / ICON</label>
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files[0];
                      if (file) { setNewCatImage(file); setNewCatImagePreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  {newCatImagePreview && <img src={newCatImagePreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '14px', objectFit: 'cover', border: '1.5px solid #EEE' }} />}
                  <button type="button" onClick={handleSaveCategory} style={{ background: '#111', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', alignSelf: 'flex-end', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}>SAVE CATEGORY</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #EEE' }}>
            <h4 style={{ color: '#888', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '0.1em' }}>EXISTING CATEGORIES</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#FFFFFF', border: '1.5px solid #EEE', padding: '0.5rem 0.6rem 0.5rem 1rem', borderRadius: '30px', color: '#111', fontSize: '0.8rem', fontWeight: 800 }}>
                  {cat.image && <img src={cat.image} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #EEE' }} />}
                  <span style={{ textTransform: 'uppercase' }}>{cat.name}</span>
                  <button type="button" onClick={() => handleDeleteCategory(cat._id)} style={{ background: '#F9F9F9', border: 'none', color: '#E53935', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', marginLeft: '4px' }}>✕</button>
                </div>
              )) : (
                <p style={{ color: '#AAA', fontSize: '0.85rem', fontWeight: 600, fontStyle: 'italic' }}>No custom categories added yet</p>
              )}
            </div>
          </div>

          {/* Sub-category flags only */}

          {/* Sub-Categories */}
          <div className="admin-form-2col" style={{ background: '#F9F9F9', padding: '2rem', borderRadius: '20px', border: '1.5px solid #EEE', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>ITEM TYPE</label><input className="input-light" style={{ height: '54px', fontWeight: 600 }} placeholder="e.g. Disc Brake" value={formData.itemType} onChange={e => setFormData({ ...formData, itemType: e.target.value })} /></div>
            <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>SUB CATEGORY</label><input className="input-light" style={{ height: '54px', fontWeight: 600 }} placeholder="e.g. Front Brake" value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })} /></div>
          </div>



          {/* Multi-Row Pincode & Inventory */}
          <div style={{ background: 'rgba(33,150,243,0.03)', padding: '2rem', borderRadius: '24px', border: '1.5px solid rgba(33,150,243,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#2196F3', fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>PINCODE PRICE & INVENTORY</h4>
              <button type="button" onClick={() => setPincodePricingRows([...pincodePricingRows, { pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }])} style={{ background: '#111', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Rajdhani, sans-serif' }}>+ ADD ROW</button>
            </div>
            {pincodePricingRows.map((row, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', border: '1.5px solid #EEE', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                {pincodePricingRows.length > 1 && (
                  <button type="button" onClick={() => setPincodePricingRows(pincodePricingRows.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -10, right: -10, background: '#FFF1F0', color: '#E53935', border: '1.5px solid rgba(229,57,53,0.1)', width: 32, height: 32, borderRadius: '10px', cursor: 'pointer', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                )}
                <div className="admin-pincode-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
                  <div>
                    <label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>PINCODES (COMMA-SEPARATED) *</label>
                    <input className="input-light" name="pincodes" style={{ height: '50px', fontWeight: 600 }} placeholder="e.g. 110001, 132001" value={row.pincodes} onChange={e => handlePincodeRowChange(idx, e)} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
                      {extractPincodes(row.pincodes).map(pin => pincodeLocationMap[pin] && (
                        <span key={pin} style={{ background: '#F0F7FF', color: '#0052CC', border: '1.5px solid rgba(0,82,204,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>📍 {pin}: {pincodeLocationMap[pin]}</span>
                      ))}
                    </div>
                  </div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>SIZE / VARIANT</label><input className="input-light" name="size" style={{ height: '50px', fontWeight: 600 }} placeholder="e.g. XL, 500ml" value={row.size} onChange={e => handlePincodeRowChange(idx, e)} /></div>
                </div>
                <div className="admin-form-4col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>ORIGINAL (₹)</label><input type="number" className="input-light" name="originalPrice" style={{ height: '50px', fontWeight: 700 }} value={row.originalPrice} onChange={e => handlePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>OFF (%)</label><input type="number" className="input-light" name="discount" style={{ height: '50px', fontWeight: 700 }} value={row.discount} onChange={e => handlePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>FINAL (₹)</label><input type="number" className="input-light" name="price" style={{ height: '50px', fontWeight: 900, color: '#E53935' }} value={row.price} onChange={e => handlePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>STOCK</label><input type="number" className="input-light" name="inventory" style={{ height: '50px', fontWeight: 700 }} value={row.inventory} onChange={e => handlePincodeRowChange(idx, e)} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Media */}
          <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EEE' }}>
            <h4 style={{ color: '#111', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Media (Images & Videos)</h4>
            <p style={{ color: '#888', fontSize: '0.72rem', marginBottom: '0.6rem' }}>Upload images and videos in the order you want them to appear on the product page.</p>
            <div className="input-light" style={{ borderStyle: 'dashed' }}>
              <input type="file" multiple accept="image/*,video/*" style={{ color: '#aaa' }} onChange={e => {
                const files = Array.from(e.target.files);
                setImages(prev => [...prev, ...files]);
                setImagePreviews(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), isVideo: f.type.startsWith('video/'), name: f.name }))]);
              }} />
            </div>
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {existingImages.map((src, i) => {
                  const isVid = /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(src) || src.includes('/video/upload/');
                  return (
                    <div key={`ex-${i}`} style={{ position: 'relative', width: 70, height: 70, borderRadius: '6px', overflow: 'hidden', border: '2px solid #2E7D32' }}>
                      {isVid ? (
                        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>▶</div>
                      ) : (
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(229,57,53,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  );
                })}
                {imagePreviews.map((preview, i) => {
                  const p = typeof preview === 'string' ? { url: preview, isVideo: false } : preview;
                  return (
                    <div key={`new-${i}`} style={{ position: 'relative', width: 70, height: 70, borderRadius: '6px', overflow: 'hidden', border: '1px solid #EEE' }}>
                      {p.isVideo ? (
                        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', gap: '2px' }}>
                          <span>▶</span>
                          <span style={{ fontSize: '0.5rem', color: '#888', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                        </div>
                      ) : (
                        <img src={p.url || p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button type="button" onClick={() => { setImages(prev => prev.filter((_, j) => j !== i)); setImagePreviews(prev => prev.filter((_, j) => j !== i)); }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(229,57,53,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={resetForm} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', fontWeight: 900, color: '#E53935', border: '1.5px solid #E53935', background: 'transparent' }}>CANCEL</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '1.1rem', borderRadius: '16px', fontWeight: 900, justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.12em' }}>SAVE PRODUCT</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2rem', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#111', fontWeight: 950, margin: 0, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>ACTIVE <span style={{ color: '#E53935' }}>INVENTORY</span> ({filtered.length})</h3>
        <button className="btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: '14px', gap: '0.6rem', fontWeight: 900 }} onClick={() => setShowForm(true)}><Plus size={20} /> ADD PRODUCT</button>
      </div>

      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={categories.map(c => ({ value: c.name, label: c.name.toUpperCase() }))}
      />

      <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {filtered.map((item) => (
          <div key={item._id} className="card-light" style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s' }}>
            <div style={{ padding: '1.8rem', flex: 1 }}>
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: 90, height: 90, borderRadius: '16px', objectFit: 'cover', background: '#F9F9F9', border: '1.5px solid #EEE' }} />
                <div>
                  <h4 style={{ color: '#111', fontWeight: 900, margin: '0 0 0.4rem 0', fontSize: '1.2rem', lineHeight: 1.2, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{item.name || 'Untitled'}</h4>
                  <p style={{ color: '#888', margin: '0 0 0.8rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.brand ? `${item.brand} • ` : ''}{(item.category || '').replace('_', ' ')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span style={{ color: '#E53935', fontWeight: 950, fontSize: '1.4rem', fontFamily: 'Rajdhani, sans-serif' }}>₹{item.price || 0}</span>
                    {item.discountedPrice && item.discountedPrice < item.price && (
                      <span style={{ color: '#2E7D32', fontWeight: 900, fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif' }}>→ ₹{item.discountedPrice}</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>STOCK: <strong style={{ color: '#111', fontWeight: 900 }}>{item.stock || 0} UNITS</strong></span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                </div>
              </div>
              <div style={{ borderTop: '1.5px dashed #EEE', marginTop: '1.2rem', paddingTop: '1.2rem' }}>
                {Array.isArray(item.pincodePricing) && item.pincodePricing.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1rem' }}>📍</span> {[...new Set(item.pincodePricing.map(p => p.pincode))].slice(0, 3).join(', ')}{item.pincodePricing.length > 3 ? ` +${item.pincodePricing.length - 3} MORE` : ''}
                  </div>
                )}
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid #EEE', display: 'flex', alignItems: 'stretch', background: '#F9F9F9' }}>
              <button onClick={() => handleEdit(item)} style={{ flex: 1, background: 'none', border: 'none', borderRight: '1.5px solid #EEE', padding: '1rem', color: '#111', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s', fontFamily: 'Rajdhani, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <Edit2 size={16} /> EDIT
              </button>
              <button onClick={() => handleDelete(item._id)} style={{ flex: 1, background: 'none', border: 'none', padding: '1rem', color: '#E53935', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s', fontFamily: 'Rajdhani, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF1F0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <Trash2 size={16} /> DELETE
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center', color: '#AAA', fontWeight: 700, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>No products found matching filters.</div>}
      </div>
    </div>
  );
};

// ── BIKES TAB (Full CRUD — same layout as PartsTab) ──
const BIKE_BRANDS = ['Honda', 'Bajaj', 'TVS', 'Hero', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Kawasaki', 'Other'];
const BikesTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', brand: '', model: '', year: '', type: 'used', condition: 'good',
    price: '', discountedPrice: '', kmDriven: '', engineCC: '', fuelType: 'petrol', description: '',
    city: '', state: '', pincode: '', isFeatured: false, bestSeller: false,
    power: '', torque: '', transmission: '', brakes: '', tyres: '', weight: '', fuelTank: '', mileage: '',
    sellerName: '', sellerPhone: '', sellerLocation: '', sellerEmail: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState('');
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [brands, setBrands] = useState([]);
  const [newBrandImage, setNewBrandImage] = useState(null);
  const [newBrandImagePreview, setNewBrandImagePreview] = useState('');
  const [bikePincodeRows, setBikePincodeRows] = useState([{ pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }]);
  const [bikePincodeMap, setBikePincodeMap] = useState({});

  const bExtractPins = (v = '') => v.split(',').map(p => p.trim()).filter(p => /^\d{6}$/.test(p));
  const bResolvePin = async (pin) => { try { const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`); const j = await r.json(); const po = j?.[0]?.PostOffice?.[0]; return po ? `${po.District}, ${po.State}` : ''; } catch { return ''; } };

  useEffect(() => {
    const pins = [...new Set(bikePincodeRows.flatMap(r => bExtractPins(r.pincodes)))];
    if (!pins.length) return;
    let alive = true;
    (async () => { for (const p of pins) { if (bikePincodeMap[p]) continue; const loc = await bResolvePin(p); if (!alive || !loc) continue; setBikePincodeMap(prev => prev[p] ? prev : { ...prev, [p]: loc }); } })();
    return () => { alive = false; };
  }, [bikePincodeRows]);

  useEffect(() => {
    const pins = [...new Set(bikePincodeRows.flatMap(r => bExtractPins(r.pincodes)))];
    const locs = [...new Set(pins.map(p => bikePincodeMap[p]).filter(Boolean))];
    if (locs.length) { const m = locs.join(', '); setFormData(prev => prev.sellerLocation === m ? prev : { ...prev, sellerLocation: m }); }
  }, [bikePincodeRows, bikePincodeMap]);

  useEffect(() => {
    adminApi.getBikes().then(({ data: d }) => setData(d.bikes || [])).finally(() => setLoading(false));
    adminApi.getAdminBrands().then(({ data }) => setBrands(data.brands || []));
  }, []);

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = data.filter(item => {
    if (statusFilter !== 'all' && item.brand !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(item.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  const handleSaveBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const fd = new FormData();
      fd.append('name', newBrandName.trim());
      if (newBrandImage) fd.append('image', newBrandImage);
      const { data } = await adminApi.createBrand(fd);
      setBrands([...brands, data.brand]);
      setFormData({ ...formData, brand: data.brand.name });
      setShowAddBrand(false); setNewBrandName(''); setNewBrandImage(null); setNewBrandImagePreview('');
      toast.success('Brand added');
    } catch { toast.error('Error adding brand'); }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Delete brand?')) return;
    try {
      await adminApi.deleteBrand(id);
      setBrands(brands.filter(b => b._id !== id));
      toast.success('Brand deleted');
    } catch { toast.error('Error deleting brand'); }
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null); setImages([]); setImagePreviews([]); setExistingImages([]);
    setVideoFile(null); setExistingVideoUrl('');
    setFormData({ title: '', brand: '', model: '', year: '', type: 'used', condition: 'good', price: '', kmDriven: '', engineCC: '', fuelType: 'petrol', description: '', city: '', state: '', pincode: '', isFeatured: false, bestSeller: false, power: '', torque: '', transmission: '', brakes: '', tyres: '', weight: '', fuelTank: '', mileage: '', sellerName: '', sellerPhone: '', sellerLocation: '', sellerEmail: '' });
    setBikePincodeRows([{ pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }]);
    setBikePincodeMap({});
  };

  const handleEdit = (bike) => {
    setEditId(bike._id);
    setFormData({
      title: bike.title || '', brand: bike.brand || '', model: bike.model || '', year: bike.year || '',
      type: bike.type || 'used', condition: bike.condition || 'good', price: bike.price || '',
      discountedPrice: bike.discountedPrice || '',
      kmDriven: bike.kmDriven || '', engineCC: bike.engineCC || '', fuelType: bike.fuelType || 'petrol',
      description: bike.description || '', city: bike.location?.city || '', state: bike.location?.state || '',
      pincode: bike.location?.pincode || '', isFeatured: bike.isFeatured || false, bestSeller: bike.bestSeller || false,
      power: bike.specifications?.power || '', torque: bike.specifications?.torque || '',
      transmission: bike.specifications?.transmission || '', brakes: bike.specifications?.brakes || '',
      tyres: bike.specifications?.tyres || '', weight: bike.specifications?.weight || '',
      fuelTank: bike.specifications?.fuelTank || '', mileage: bike.specifications?.mileage || '',
      sellerName: bike.sellerDetails?.name || '', sellerPhone: bike.sellerDetails?.phone || '',
      sellerLocation: bike.sellerDetails?.location || '', sellerEmail: bike.sellerDetails?.email || '',
    });
    if (Array.isArray(bike.pincodePricing) && bike.pincodePricing.length > 0) {
      const rowMap = {};
      const newLocMap = { ...bikePincodeMap };
      bike.pincodePricing.forEach(p => {
        if (p.pincode && p.location) newLocMap[p.pincode] = p.location;
        const key = `${p.size || ''}|${p.price || 0}|${p.originalPrice || 0}|${p.discount || 0}|${p.inventory || 0}`;
        if (!rowMap[key]) {
          rowMap[key] = {
            pincodes: p.pincode,
            size: p.size || '',
            originalPrice: p.originalPrice !== undefined && p.originalPrice !== null ? String(p.originalPrice) : '',
            discount: p.discount !== undefined && p.discount !== null ? String(p.discount) : '',
            price: p.price !== undefined && p.price !== null ? String(p.price) : '',
            inventory: p.inventory !== undefined && p.inventory !== null ? String(p.inventory) : ''
          };
        } else {
          rowMap[key].pincodes += ', ' + p.pincode;
        }
      });
      setBikePincodeMap(newLocMap);
      setBikePincodeRows(Object.values(rowMap));
    } else { setBikePincodeRows([{ pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }]); }
    const allMedia = [...(bike.images || []), ...(bike.videos || [])];
    setImages([]); setImagePreviews([]); setExistingImages(allMedia);
    setExistingVideoUrl('');
    setVideoFile(null);
    setShowForm(true);
  };

  const handleBikePincodeRowChange = (idx, e) => {
    const { name, value } = e.target;
    const rows = bikePincodeRows.map((r, i) => i === idx ? { ...r, [name]: value } : r);
    const r = rows[idx]; const orig = parseFloat(r.originalPrice), disc = parseFloat(r.discount), pr = parseFloat(r.price);
    if (name === 'originalPrice' && !isNaN(orig) && orig > 0) { if (!isNaN(pr)) rows[idx].discount = String(Math.max(0, ((orig - pr) / orig * 100)).toFixed(2)); else if (!isNaN(disc)) rows[idx].price = String(Math.round(orig - orig * disc / 100)); }
    else if (name === 'discount' && !isNaN(disc)) { if (!isNaN(pr) && disc < 100) rows[idx].originalPrice = String(Math.round(pr / (1 - disc / 100))); else if (!isNaN(orig)) rows[idx].price = String(Math.round(orig - orig * disc / 100)); }
    else if (name === 'price' && !isNaN(pr)) { if (!isNaN(orig) && orig > 0) rows[idx].discount = String(Math.max(0, ((orig - pr) / orig * 100)).toFixed(2)); else if (!isNaN(disc) && disc < 100) rows[idx].originalPrice = String(Math.round(pr / (1 - disc / 100))); }
    setBikePincodeRows(rows);
  };

  const buildBikePricingPayload = () => {
    const result = [];
    bikePincodeRows.forEach(row => { if (!row.pincodes || row.price === '') return; bExtractPins(row.pincodes).forEach(pin => result.push({ pincode: pin, location: bikePincodeMap[pin] || '', size: row.size, originalPrice: row.originalPrice !== '' ? Number(row.originalPrice) : null, discount: row.discount !== '' ? Number(row.discount) : null, price: Number(row.price), inventory: Number(row.inventory || 0) })); });
    return result;
  };

  const handleDelete = async (id) => { if (!confirm('Delete this bike?')) return; try { await adminApi.deleteBike(id); setData(data.filter(d => d._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); } };
  const handleApprove = async (id) => { try { await adminApi.approveBike(id); setData(data.map(b => b._id === id ? { ...b, isApproved: !b.isApproved } : b)); toast.success('Updated'); } catch { toast.error('Failed'); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pricing = buildBikePricingPayload();
      const fd = new FormData();
      fd.append('title', formData.title || `${formData.brand} ${formData.model} ${formData.year}`);
      fd.append('brand', formData.brand); fd.append('model', formData.model); fd.append('year', formData.year);
      fd.append('type', formData.type); fd.append('condition', formData.condition);
      fd.append('price', pricing[0]?.originalPrice || formData.price); fd.append('discountedPrice', pricing[0]?.price || formData.discountedPrice || '');
      fd.append('kmDriven', formData.kmDriven); fd.append('engineCC', formData.engineCC); fd.append('fuelType', formData.fuelType);
      fd.append('description', formData.description); fd.append('isFeatured', formData.isFeatured); fd.append('bestSeller', formData.bestSeller);
      fd.append('stock', String(pricing.reduce((s, p) => s + (p.inventory || 0), 0)));
      fd.append('location', JSON.stringify({ city: formData.city, state: formData.state, pincode: formData.pincode }));
      fd.append('specifications', JSON.stringify({ power: formData.power, torque: formData.torque, transmission: formData.transmission, brakes: formData.brakes, tyres: formData.tyres, weight: formData.weight, fuelTank: formData.fuelTank, mileage: formData.mileage }));
      fd.append('pincodePricing', JSON.stringify(pricing));
      fd.append('sellerDetails', JSON.stringify({ name: formData.sellerName, phone: formData.sellerPhone, location: formData.sellerLocation, email: formData.sellerEmail }));
      for (const img of images) fd.append('images', img);
      for (const url of existingImages) fd.append('existingImages', url);

      if (editId) {
        const { data: res } = await adminApi.updateBikeMultipart(editId, fd);
        setData(data.map(d => d._id === editId ? res.bike : d));
        toast.success('Bike updated');
      } else {
        const { data: res } = await adminApi.createBike(fd);
        setData([res.bike, ...data]);
        toast.success('Bike created');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  if (showForm) {
    return (
      <div className="admin-form-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontSize: '2rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{editId ? 'UPDATE' : 'ADD NEW'} <span style={{ color: '#E53935' }}>BIKE</span></h3>
        <form onSubmit={handleSubmit}>
          {/* Core Details */}
          <div style={{ background: '#F9F9F9', padding: '2rem', borderRadius: '20px', border: '1.5px solid #EEE', marginBottom: '1.8rem' }}>
            <h4 style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>BIKE DETAILS</h4>
            <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>TITLE</label><input className="input-light" style={{ height: '54px', fontWeight: 600 }} placeholder="Auto-generated if empty" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>BRAND *</label>
                <select className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.brand} onChange={e => {
                  if (e.target.value === 'CREATE_NEW') { setShowAddBrand(true); setFormData({ ...formData, brand: '' }); }
                  else { setShowAddBrand(false); setFormData({ ...formData, brand: e.target.value }); }
                }} required>
                  <option value="">SELECT BRAND</option>
                  {brands.map(b => (
                    <option key={b._id || b.name} value={b.name}>{b.name}</option>
                  ))}
                  <option value="CREATE_NEW" style={{ color: '#E53935', fontWeight: 'bold' }}>+ CREATE NEW BRAND</option>
                </select></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>MODEL *</label><input className="input-light" style={{ height: '54px', fontWeight: 600 }} required placeholder="e.g. Splendor Plus" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} /></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>YEAR *</label><input type="number" className="input-light" style={{ height: '54px', fontWeight: 700 }} required min={1990} max={new Date().getFullYear()} value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} /></div>

              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>KM DRIVEN</label><input type="number" className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.kmDriven} onChange={e => setFormData({ ...formData, kmDriven: e.target.value })} /></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>ENGINE CC</label><input type="number" className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.engineCC} onChange={e => setFormData({ ...formData, engineCC: e.target.value })} /></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>TYPE</label>
                <select className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="new">NEW</option><option value="used">USED</option>
                </select></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>CONDITION</label>
                <select className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })}>
                  <option value="excellent">EXCELLENT</option><option value="good">GOOD</option><option value="fair">FAIR</option><option value="poor">POOR</option>
                </select></div>
              <div><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>FUEL TYPE</label>
                <select className="input-light" style={{ height: '54px', fontWeight: 700 }} value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                  <option value="petrol">PETROL</option><option value="electric">ELECTRIC</option><option value="hybrid">HYBRID</option>
                </select></div>
            </div>
            <div style={{ marginTop: '1.25rem' }}><label style={{ color: '#666', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>DESCRIPTION</label><textarea className="input-light" rows={3} style={{ resize: 'vertical', fontWeight: 600, padding: '1rem' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>

            {showAddBrand && (
              <div style={{ background: '#FFF1F0', padding: '2rem', borderRadius: '20px', border: '1.5px dashed #E53935', marginBottom: '1.8rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#E53935', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>NEW BRAND</h4>
                  <button type="button" onClick={() => setShowAddBrand(false)} style={{ background: '#FFFFFF', border: '1.5px solid #EEE', color: '#111', width: 32, height: 32, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                </div>
                <div style={{ display: 'grid', gap: '1.2rem', marginBottom: '0.5rem' }}>
                  <input className="input-light" style={{ height: '54px', fontWeight: 600 }} placeholder="Brand Name" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>BRAND IMAGE / LOGO</label>
                      <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files[0];
                        if (file) { setNewBrandImage(file); setNewBrandImagePreview(URL.createObjectURL(file)); }
                      }} />
                    </div>
                    {newBrandImagePreview && <img src={newBrandImagePreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '14px', objectFit: 'cover', border: '1.5px solid #EEE' }} />}
                    <button type="button" onClick={handleSaveBrand} style={{ background: '#111', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', alignSelf: 'flex-end', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}>SAVE BRAND</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #EEE', marginBottom: '1.8rem' }}>
              <h4 style={{ color: '#888', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '0.1em' }}>EXISTING BRANDS</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {brands.length > 0 ? brands.map(b => (
                  <div key={b._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#FFFFFF', border: '1.5px solid #EEE', padding: '0.5rem 0.6rem 0.5rem 1rem', borderRadius: '30px', color: '#111', fontSize: '0.8rem', fontWeight: 800 }}>
                    {b.image && <img src={b.image} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #EEE' }} />}
                    <span style={{ textTransform: 'uppercase' }}>{b.name}</span>
                    <button type="button" onClick={() => handleDeleteBrand(b._id)} style={{ background: '#F9F9F9', border: 'none', color: '#E53935', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', marginLeft: '4px' }}>✕</button>
                  </div>
                )) : (
                  <p style={{ color: '#AAA', fontSize: '0.85rem', fontWeight: 600, fontStyle: 'italic' }}>No dynamic brands found</p>
                )}
              </div>
            </div>

          {/* Specifications */}
          <div style={{ background: '#F9F9F9', padding: '2rem', borderRadius: '20px', border: '1.5px solid #EEE', marginBottom: '1.8rem' }}>
            <h4 style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>ENGINE & SPECIFICATIONS</h4>
            <div className="admin-form-4col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { key: 'power', label: 'POWER', ph: 'e.g. 11 BHP' },
                { key: 'torque', label: 'TORQUE', ph: 'e.g. 10.6 Nm' },
                { key: 'transmission', label: 'TRANSMISSION', ph: 'e.g. 4-speed' },
                { key: 'brakes', label: 'BRAKES', ph: 'e.g. Disc/Drum' },
                { key: 'tyres', label: 'TYRES', ph: 'e.g. Tubeless' },
                { key: 'weight', label: 'WEIGHT', ph: 'e.g. 112 kg' },
                { key: 'fuelTank', label: 'FUEL TANK', ph: 'e.g. 10L' },
                { key: 'mileage', label: 'MILEAGE', ph: 'e.g. 60 kmpl' },
              ].map(({ key, label, ph }) => (
                <div key={key}><label style={{ color: '#666', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>{label}</label><input className="input-light" placeholder={ph} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={{ height: '48px', fontWeight: 600, fontSize: '0.85rem' }} /></div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div style={{ background: '#FFFFFF', padding: '1.5rem 2rem', borderRadius: '20px', border: '1.5px solid #EEE', marginBottom: '1.8rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#111', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} style={{ width: 20, height: 20, accentColor: '#E53935' }} /> FEATURED LISTING</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#111', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}><input type="checkbox" checked={formData.bestSeller} onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })} style={{ width: 20, height: 20, accentColor: '#E53935' }} /> BEST SELLER</label>
          </div>



          {/* Pincode Price & Inventory */}
          <div style={{ background: 'rgba(251,140,0,0.03)', padding: '2rem', borderRadius: '24px', border: '1.5px solid rgba(251,140,0,0.15)', marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#FB8C00', fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>PINCODE PRICE & STOCK</h4>
              <button type="button" onClick={() => setBikePincodeRows([...bikePincodeRows, { pincodes: '', size: '', originalPrice: '', discount: '', price: '', inventory: '' }])} style={{ background: '#111', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Rajdhani, sans-serif' }}>+ ADD ROW</button>
            </div>
            {bikePincodeRows.map((row, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', border: '1.5px solid #EEE', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                {bikePincodeRows.length > 1 && (
                  <button type="button" onClick={() => setBikePincodeRows(bikePincodeRows.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -10, right: -10, background: '#FFF1F0', color: '#E53935', border: '1.5px solid rgba(229,57,53,0.1)', width: 32, height: 32, borderRadius: '10px', cursor: 'pointer', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                )}
                <div className="admin-pincode-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
                  <div>
                    <label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>PINCODES (COMMA-SEPARATED) *</label>
                    <input className="input-light" name="pincodes" style={{ height: '50px', fontWeight: 600 }} placeholder="e.g. 110001, 132001" value={row.pincodes} onChange={e => handleBikePincodeRowChange(idx, e)} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
                      {bExtractPins(row.pincodes).map(pin => bikePincodeMap[pin] && (
                        <span key={pin} style={{ background: '#FFF7E6', color: '#D46B08', border: '1.5px solid rgba(212,107,8,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>📍 {pin}: {bikePincodeMap[pin]}</span>
                      ))}
                    </div>
                  </div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>VARIANT / COLOR</label><input className="input-light" name="size" style={{ height: '50px', fontWeight: 600 }} placeholder="e.g. Red, Matte Black" value={row.size} onChange={e => handleBikePincodeRowChange(idx, e)} /></div>
                </div>
                <div className="admin-form-4col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>ORIGINAL (₹)</label><input type="number" className="input-light" name="originalPrice" style={{ height: '50px', fontWeight: 700 }} value={row.originalPrice} onChange={e => handleBikePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>OFF (%)</label><input type="number" className="input-light" name="discount" style={{ height: '50px', fontWeight: 700 }} value={row.discount} onChange={e => handleBikePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>FINAL (₹)</label><input type="number" className="input-light" name="price" style={{ height: '50px', fontWeight: 900, color: '#E53935' }} value={row.price} onChange={e => handleBikePincodeRowChange(idx, e)} /></div>
                  <div><label style={{ color: '#666', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', display: 'block' }}>STOCK</label><input type="number" className="input-light" name="inventory" style={{ height: '50px', fontWeight: 700 }} value={row.inventory} onChange={e => handleBikePincodeRowChange(idx, e)} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Media */}
          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1.5px solid #EEE', marginBottom: '1.8rem' }}>
            <h4 style={{ color: '#111', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>MEDIA (IMAGES & VIDEOS)</h4>
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>Upload images and videos in the order you want them to appear on the listing page.</p>
            <div className="input-light" style={{ borderStyle: 'dashed', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input type="file" multiple accept="image/*,video/*" style={{ color: '#888', fontWeight: 600 }} onChange={e => {
                const files = Array.from(e.target.files);
                setImages(prev => [...prev, ...files]);
                setImagePreviews(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), isVideo: f.type.startsWith('video/'), name: f.name }))]);
              }} />
            </div>
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {existingImages.map((src, i) => {
                  const isVid = /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(src) || src.includes('/video/upload/');
                  return (
                    <div key={`ex-${i}`} style={{ position: 'relative', width: 80, height: 80, borderRadius: '16px', overflow: 'hidden', border: '2px solid #2E7D32', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {isVid ? (
                        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>▶</div>
                      ) : (
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, background: '#E53935', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                    </div>
                  );
                })}
                {imagePreviews.map((preview, i) => {
                  const p = typeof preview === 'string' ? { url: preview, isVideo: false } : preview;
                  return (
                    <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80, borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #EEE', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {p.isVideo ? (
                        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '2px' }}>
                          <span style={{ fontSize: '1.2rem' }}>▶</span>
                          <span style={{ fontSize: '0.5rem', color: '#888', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                        </div>
                      ) : (
                        <img src={p.url || p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button type="button" onClick={() => { setImages(prev => prev.filter((_, j) => j !== i)); setImagePreviews(prev => prev.filter((_, j) => j !== i)); }} style={{ position: 'absolute', top: 4, right: 4, background: '#E53935', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <button type="button" onClick={resetForm} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', fontWeight: 900, color: '#E53935', border: '1.5px solid #E53935', background: 'transparent' }}>CANCEL</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '1.1rem', borderRadius: '16px', fontWeight: 900, justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.12em' }}>SAVE BIKE LISTING</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2rem', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#111', fontWeight: 950, margin: 0, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>BIKE <span style={{ color: '#E53935' }}>LISTINGS</span> ({filtered.length})</h3>
        <button className="btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: '14px', gap: '0.6rem', fontWeight: 900 }} onClick={() => setShowForm(true)}><Plus size={20} /> ADD NEW BIKE</button>
      </div>

      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={brands.map(b => ({ value: b.name, label: b.name.toUpperCase() }))}
      />

      <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {filtered.map((item) => (
          <div key={item._id} className="card-light" style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s' }}>
            <div style={{ padding: '1.8rem', flex: 1 }}>
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.title} style={{ width: 100, height: 100, borderRadius: '20px', objectFit: 'cover', background: '#F9F9F9', border: '1.5px solid #EEE' }} />
                <div>
                  <h4 style={{ color: '#111', fontWeight: 950, margin: '0 0 0.4rem 0', fontSize: '1.2rem', lineHeight: 1.2, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{item.title || `${item.brand} ${item.model}`}</h4>
                  <p style={{ color: '#888', margin: '0 0 0.8rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.brand} • {item.year} • {item.kmDriven?.toLocaleString()} KM
                  </p>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span style={{ color: '#E53935', fontWeight: 950, fontSize: '1.4rem', fontFamily: 'Rajdhani, sans-serif' }}>₹{item.price?.toLocaleString('en-IN')}</span>
                    {item.discountedPrice && item.discountedPrice < item.price && (
                      <span style={{ color: '#2E7D32', fontWeight: 900, fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif' }}>→ ₹{item.discountedPrice?.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 700 }}>STOCK: <strong style={{ color: '#111', fontWeight: 900 }}>{item.stock || 0} UNITS</strong></span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${item.type === 'new' ? 'badge-green' : 'badge-blue'}`} style={{ borderRadius: '8px', fontWeight: 900 }}>{item.type.toUpperCase()}</span>
                  <span className={`badge ${item.condition === 'excellent' ? 'badge-green' : item.condition === 'good' ? 'badge-blue' : 'badge-orange'}`} style={{ borderRadius: '8px', fontWeight: 900 }}>{item.condition.toUpperCase()}</span>
                  {item.isFeatured && <span className="badge badge-orange" style={{ borderRadius: '8px', fontWeight: 900 }}>FEATURED</span>}
                  <span className={`badge ${item.isApproved ? 'badge-green' : 'badge-red'}`} style={{ borderRadius: '8px', fontWeight: 900 }}>{item.isApproved ? 'APPROVED' : 'PENDING'}</span>
                </div>
              </div>
              <div style={{ borderTop: '1.5px dashed #EEE', marginTop: '1.2rem', paddingTop: '1.2rem' }}>
                {item.location?.city && <p style={{ color: '#111', fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>📍 {item.location.city.toUpperCase()}{item.location.state ? `, ${item.location.state.toUpperCase()}` : ''}</p>}
                {Array.isArray(item.pincodePricing) && item.pincodePricing.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>
                    PINCODES: {[...new Set(item.pincodePricing.map(p => p.pincode))].slice(0, 3).join(', ')}{item.pincodePricing.length > 3 ? ` +${item.pincodePricing.length - 3} MORE` : ''}
                  </div>
                )}
                <p style={{ color: '#AAA', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 700 }}>{item.engineCC}CC • {item.fuelType.toUpperCase()} • 👁 {item.views || 0} VIEWS • {item.enquiries?.length || 0} LEADS</p>
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid #EEE', display: 'flex', alignItems: 'stretch', background: '#F9F9F9' }}>
              <button onClick={() => handleApprove(item._id)} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderRight: '1.5px solid #EEE', color: item.isApproved ? '#2E7D32' : '#FB8C00', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF'}>
                {item.isApproved ? '✓ APPROVED' : '⏳ APPROVE'}
              </button>
              <button onClick={() => handleEdit(item)} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderRight: '1.5px solid #EEE', color: '#111', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'Rajdhani, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF'}>
                <Edit2 size={14} /> EDIT
              </button>
              <button onClick={() => handleDelete(item._id)} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', color: '#E53935', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'Rajdhani, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF1F0'}>
                <Trash2 size={14} /> DELETE
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center', color: '#AAA', fontWeight: 700, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>No bike listings found matching filters.</div>}
      </div>
    </div>
  );
};

// ── SELL REQUESTS TAB ──
const SellsTab = () => {
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({}); // { 'id-field': true }

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleEdit = (id, field) => {
    setEditMode(prev => ({ ...prev, [`${id}-${field}`]: !prev[`${id}-${field}`] }));
  };

  useEffect(() => {
    setLoading(true);
    adminApi.getSells()
      .then(({ data }) => setSells(data.requests || []))
      .catch((err) => {
        console.error('SELLS FETCH ERROR:', err);
        toast.error('Failed to load sell requests');
        setSells([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, status, offeredPrice, adminNote) => {
    try {
      const body = { status };
      if (offeredPrice) body.offeredPrice = Number(offeredPrice);
      if (adminNote) body.adminNote = adminNote;
      const { data } = await adminApi.updateSellStatus(id, body);
      setSells(sells.map(s => s._id === id ? data.sellRequest : s));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = sells.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(s.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  const statusOpts = ['pending', 'under_review', 'approved', 'rejected', 'pickup_scheduled', 'sold', 'cancelled'];
  const statusColors = { pending: 'badge-orange', under_review: 'badge-blue', approved: 'badge-green', rejected: 'badge-red', pickup_scheduled: 'badge-blue', sold: 'badge-green', cancelled: 'badge-red' };

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>SELL <span style={{ color: '#E53935' }}>REQUESTS</span> ({filtered.length})</h3>
      
      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={statusOpts.map(o => ({ value: o, label: o.replace(/_/g, ' ').toUpperCase() }))}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filtered.map(s => (
          <div key={s._id} style={{ background: '#F9F9F9', border: '1.5px solid #EEE', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                {s.images && s.images.length > 0 && (
                  <img src={s.images[0]} alt="" style={{ width: 120, height: 90, borderRadius: '12px', objectFit: 'cover', border: '1.5px solid #EEE' }} />
                )}
                <div>
                  <h4 style={{ color: '#111', fontWeight: 900, fontSize: '1.2rem', margin: 0, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{(s.brand || '').toUpperCase()} {(s.model || '').toUpperCase()} ({s.year || 'N/A'})</h4>
                  <p style={{ color: '#666', fontSize: '0.85rem', fontWeight: 700, margin: '0.4rem 0' }}>{(s.condition || 'good').toUpperCase()} • {s.kmDriven?.toLocaleString() || 0} KM • {s.engineCC || 0}CC</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5393510', color: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>{s.user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <p style={{ color: '#111', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>{s.user?.name || 'N/A'} <span style={{ color: '#888', fontWeight: 600 }}>• {s.user?.phone || ''}</span></p>
                  </div>
                  {s.pickupAddress?.city && <p style={{ color: '#0052CC', fontSize: '0.8rem', fontWeight: 800, marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📍 {[(s.pickupAddress.street || ''), (s.pickupAddress.city || '')].filter(Boolean).join(', ').toUpperCase()}</p>}
                  {s.isOneHourSell && <span style={{ display: 'inline-block', marginTop: '0.8rem', background: '#FFF7E6', color: '#D46B08', border: '1.5px solid rgba(212,107,8,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>⚡ EXPRESS SALE</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {s.estimatedPrice && <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>est. value</div>}
                {s.estimatedPrice && <div style={{ color: '#111', fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>₹{s.estimatedPrice?.toLocaleString('en-IN')}</div>}
                {s.offeredPrice && <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0.8rem 0 0.2rem 0' }}>admin offer</div>}
                {s.offeredPrice && <div style={{ color: '#2E7D32', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem' }}>₹{s.offeredPrice?.toLocaleString('en-IN')}</div>}
              </div>
            </div>
            <div className="admin-sell-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={s.status} onChange={e => handleUpdate(s._id, e.target.value)} className="input-light" style={{ width: 'auto', fontSize: '0.85rem', fontWeight: 800, padding: '0.6rem 1rem', height: '48px', borderRadius: '12px' }}>
                {statusOpts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ').toUpperCase()}</option>)}
              </select>

              {/* Offer Field */}
              <div style={{ position: 'relative', flex: '0 0 160px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 900, fontSize: '0.85rem' }}>₹</span>
                <input type="number" placeholder="OFFER ₹" defaultValue={s.offeredPrice || ''}
                  id={`price-${s._id}`}
                  readOnly={!editMode[`${s._id}-price`]}
                  className="input-light" 
                  style={{ 
                    width: '100%', fontSize: '0.85rem', padding: '0.6rem 2.2rem 0.6rem 24px', height: '48px', fontWeight: 700,
                    borderColor: editMode[`${s._id}-price`] ? '#E53935' : '#EEE',
                    background: editMode[`${s._id}-price`] ? '#FFF' : '#FAFAFA'
                  }} />
                <button type="button" 
                  onClick={() => {
                    if (editMode[`${s._id}-price`]) {
                      const val = document.getElementById(`price-${s._id}`).value;
                      handleUpdate(s._id, s.status, val);
                    }
                    toggleEdit(s._id, 'price');
                  }}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53935' }}>
                  {editMode[`${s._id}-price`] ? <Check size={18} /> : <Edit2 size={16} />}
                </button>
              </div>

              {/* Note Field */}
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <input placeholder="ADMIN NOTE..." defaultValue={s.adminNote || ''}
                  id={`note-${s._id}`}
                  readOnly={!editMode[`${s._id}-note`]}
                  className="input-light" 
                  style={{ 
                    width: '100%', fontSize: '0.85rem', padding: '0.6rem 2.2rem 0.6rem 1rem', height: '48px', fontWeight: 600,
                    borderColor: editMode[`${s._id}-note`] ? '#E53935' : '#EEE',
                    background: editMode[`${s._id}-note`] ? '#FFF' : '#FAFAFA'
                  }} />
                <button type="button" 
                  onClick={() => {
                    if (editMode[`${s._id}-note`]) {
                      const val = document.getElementById(`note-${s._id}`).value;
                      handleUpdate(s._id, s.status, null, val);
                    }
                    toggleEdit(s._id, 'note');
                  }}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53935' }}>
                  {editMode[`${s._id}-note`] ? <Check size={18} /> : <Edit2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {!sells.length && <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#AAA', fontWeight: 800, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>No sell requests received yet.</div>}
      </div>
    </div>
  );
};

// ── ORDERS TAB ──
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    adminApi.getOrders().then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(o.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  const statusOpts = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const statusColors = { placed: 'badge-blue', confirmed: 'badge-blue', shipped: 'badge-orange', delivered: 'badge-green', cancelled: 'badge-red' };

  return (
    <div className="admin-table-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2rem', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>CUSTOMER <span style={{ color: '#E53935' }}>ORDERS</span> ({filtered.length})</h3>
      
      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={statusOpts.map(o => ({ value: o, label: o.toUpperCase() }))}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead><tr>
          {['ORDER ID', 'CUSTOMER', 'ITEMS', 'TOTAL', 'PAYMENT', 'STATUS', 'ACTION'].map(h => (
            <th key={h} style={{ padding: '1rem 1.2rem', textAlign: 'left', color: '#888', borderBottom: '1.5px solid #EEE', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filtered.map(o => (
            <tr key={o._id} style={{ borderBottom: '1px solid #F5F5F5' }}>
              <td style={{ padding: '1.2rem', color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>#{o._id.slice(-8).toUpperCase()}</td>
              <td style={{ padding: '1.2rem' }}>
                <div style={{ color: '#111', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif' }}>{o.user?.name || 'N/A'}</div>
                <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600 }}>{o.user?.phone || ''}</div>
              </td>
              <td style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>{o.items?.map(i => `${i.name}×${i.quantity}`).join(', ') || '-'}</td>
              <td style={{ padding: '1.2rem', color: '#E53935', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem' }}>₹{o.total?.toLocaleString('en-IN')}</td>
              <td style={{ padding: '1.2rem' }}><span className={`badge ${o.payment?.status === 'paid' ? 'badge-green' : 'badge-orange'}`} style={{ borderRadius: '8px', fontWeight: 900 }}>{o.payment?.method?.toUpperCase()} - {o.payment?.status?.toUpperCase()}</span></td>
              <td style={{ padding: '1.2rem' }}><span className={`badge ${statusColors[o.status] || 'badge-gray'}`} style={{ borderRadius: '8px', fontWeight: 900 }}>{o.status.toUpperCase()}</span></td>
              <td style={{ padding: '1.2rem' }}>
                <select value={o.status} onChange={e => handleStatus(o._id, e.target.value)} className="input-light" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.6rem', height: '36px', fontWeight: 700 }}>
                  {statusOpts.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {!orders.length && <tr><td colSpan={7} style={{ padding: '5rem 2rem', textAlign: 'center', color: '#AAA', fontWeight: 800, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '0 0 24px 24px' }}>No orders found yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

// ── BUY BIKE REQUESTS TAB ──
const LeadsTab = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    adminApi.getAllEnquiries().then(({ data }) => {
      setEnquiries(data.enquiries || []);
    }).catch(() => toast.error('Failed to load requests')).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await adminApi.updateEnquiry(id, { status });
      setEnquiries(enquiries.map(e => e._id === id ? data.enquiry : e));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const statusColor = { pending: '#FB8C00', contacted: '#1976D2', sold: '#2E7D32', rejected: '#E53935' };
  
  const filtered = enquiries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(e.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>BUY BIKE <span style={{ color: '#E53935' }}>REQUESTS</span> ({filtered.length})</h3>
      </div>

      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={[
          { value: 'pending', label: 'PENDING' },
          { value: 'contacted', label: 'CONTACTED' },
          { value: 'sold', label: 'SOLD' },
          { value: 'rejected', label: 'REJECTED' }
        ]}
      />

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(enq => (
            <div key={enq._id} style={{ background: '#F9F9F9', border: '1.5px solid #EEE', borderRadius: '16px', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="admin-leads-grid" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                {/* Bike Image */}
                <img src={enq.bike?.images?.[0] || 'https://via.placeholder.com/80'} alt="" style={{ width: 80, height: 60, borderRadius: '10px', objectFit: 'cover', border: '1px solid #EEE' }} />

                {/* Bike Info */}
                <div>
                  <h4 style={{ color: '#111', fontWeight: 900, fontSize: '1rem', margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                    {enq.bike?.brand} {enq.bike?.model} ({enq.bike?.year})
                  </h4>
                  <p style={{ color: '#E53935', fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, margin: '0.15rem 0', fontSize: '1rem' }}>₹{enq.bike?.price?.toLocaleString('en-IN')}</p>
                  {enq.bike?.location?.city && <p style={{ color: '#888', fontSize: '0.72rem', fontWeight: 600, margin: 0 }}>📍 {enq.bike.location.city}</p>}
                </div>

                {/* Customer Info */}
                <div>
                  <p style={{ color: '#111', fontWeight: 800, fontSize: '0.9rem', margin: 0 }}>{enq.user?.name || 'Unknown'}</p>
                  <p style={{ color: '#666', fontSize: '0.78rem', margin: '0.15rem 0', fontWeight: 600 }}>{enq.user?.email}</p>
                  <p style={{ color: '#E53935', fontSize: '0.82rem', fontWeight: 800, margin: 0 }}>{enq.phone || enq.user?.phone || '-'}</p>
                  {enq.message && <p style={{ color: '#888', fontSize: '0.72rem', fontStyle: 'italic', margin: '0.3rem 0 0', fontWeight: 500 }}>"{enq.message}"</p>}
                </div>

                {/* Status & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: 130 }}>
                  <span style={{ background: `${statusColor[enq.status]}15`, color: statusColor[enq.status], border: `1px solid ${statusColor[enq.status]}30`, padding: '0.25rem 0.8rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {enq.status}
                  </span>
                  <select
                    value={enq.status}
                    onChange={e => handleStatusUpdate(enq._id, e.target.value)}
                    className="input-light"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', height: 'auto', fontWeight: 700, width: 130, borderRadius: '8px' }}>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="sold">Sold</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <span style={{ color: '#AAA', fontSize: '0.65rem', fontWeight: 600 }}>{new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#AAA', fontWeight: 800, fontSize: '1.1rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>No buy bike requests found.</div>
      )}
    </div>
  );
};

// ── RENTAL CARS TAB (Admin CRUD) ──
const RentalsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    title: '', brand: '', model: '', year: '', pricePerDay: '', pricePerHour: '',
    securityDeposit: '', securityDepositRefundable: true, securityDepositCompulsory: true,
    fuelType: 'petrol', transmission: 'manual', seats: 5,
    mileage: '', description: '',
    city: '', state: '', pincode: '', address: '',
    dropCity: '', dropState: '', dropPincode: '', dropAddress: '',
    minRentalDays: 1, maxRentalDays: 30,
    minRentalHours: 1, maxRentalHours: 24,
    isFeatured: false, status: 'available',
    features: '',
    registrationNumber: '', bikeNumber: '', rcNumber: '', chassisNumber: '', engineNumber: '',
    insuranceValidTill: '', pucValidTill: '',
  });

  useEffect(() => {
    rentalApi.getRentalCars({ isAdmin: true, limit: 50 })
      .then(({ data }) => setData(data.cars || []))
      .catch(() => toast.error('Failed to load rentals'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const date = new Date(item.createdAt);
    if (filterMode === 'day') return date.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return date.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(date.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    }
    return true;
  });

  const resetForm = () => {
    setShowForm(false); setEditId(null); setImages([]); setExistingImages([]); setImagePreviews([]);
    setForm({
      title: '', brand: '', model: '', year: '', pricePerDay: '', pricePerHour: '',
      securityDeposit: '', securityDepositRefundable: true, securityDepositCompulsory: true,
      fuelType: 'petrol', transmission: 'manual', seats: 5,
      mileage: '', description: '',
      city: '', state: '', pincode: '', address: '',
      dropCity: '', dropState: '', dropPincode: '', dropAddress: '',
      minRentalDays: 1, maxRentalDays: 30,
      minRentalHours: 1, maxRentalHours: 24,
      isFeatured: false, status: 'available',
      features: '',
      registrationNumber: '', bikeNumber: '', rcNumber: '', chassisNumber: '', engineNumber: '',
      insuranceValidTill: '', pucValidTill: '',
    });
  };

  const handleEdit = (car) => {
    setEditId(car._id);
    setForm({
      title: car.title || '', brand: car.brand || '', model: car.model || '', year: car.year || '',
      pricePerDay: car.pricePerDay || '', pricePerHour: car.pricePerHour || '',
      securityDeposit: car.securityDeposit || '',
      securityDepositRefundable: car.securityDepositRefundable !== false,
      securityDepositCompulsory: car.securityDepositCompulsory !== false,
      fuelType: car.fuelType || 'petrol',
      transmission: car.transmission || 'manual', seats: car.seats || 5,
      mileage: car.mileage || '', description: car.description || '',
      city: car.location?.city || '', state: car.location?.state || '', pincode: car.location?.pincode || '', address: car.location?.address || '',
      dropCity: car.dropLocation?.city || '', dropState: car.dropLocation?.state || '', dropPincode: car.dropLocation?.pincode || '', dropAddress: car.dropLocation?.address || '',
      minRentalDays: car.minRentalDays || 1, maxRentalDays: car.maxRentalDays || 30,
      minRentalHours: car.minRentalHours || 1, maxRentalHours: car.maxRentalHours || 24,
      isFeatured: car.isFeatured || false, status: car.status || 'available',
      features: (car.features || []).join(', '),
      registrationNumber: car.registrationNumber || '', bikeNumber: car.bikeNumber || '',
      rcNumber: car.rcNumber || '', chassisNumber: car.chassisNumber || '', engineNumber: car.engineNumber || '',
      insuranceValidTill: car.insuranceValidTill ? car.insuranceValidTill.split('T')[0] : '',
      pucValidTill: car.pucValidTill ? car.pucValidTill.split('T')[0] : '',
    });
    setExistingImages(car.images || []);
    setImages([]); setImagePreviews([]);
    setShowForm(true);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
      return toast.error('Price per day is required');
    }
    try {
      // Allowed rental units are derived from which prices the admin set.
      const units = ['day'];
      if (Number(form.pricePerHour) > 0) units.push('hour');

      const fd = new FormData();
      fd.append('title', form.title || `${form.brand} ${form.model} ${form.year}`);
      fd.append('brand', form.brand); fd.append('model', form.model); fd.append('year', form.year);
      fd.append('pricePerDay', form.pricePerDay); fd.append('pricePerHour', form.pricePerHour || 0);
      fd.append('securityDeposit', form.securityDeposit || 0);
      fd.append('securityDepositRefundable', form.securityDepositRefundable);
      fd.append('securityDepositCompulsory', form.securityDepositCompulsory);
      fd.append('fuelType', form.fuelType); fd.append('transmission', form.transmission);
      fd.append('seats', form.seats); fd.append('mileage', form.mileage);
      fd.append('description', form.description); fd.append('isFeatured', form.isFeatured);
      fd.append('status', form.status);
      fd.append('minRentalDays', form.minRentalDays); fd.append('maxRentalDays', form.maxRentalDays);
      fd.append('minRentalHours', form.minRentalHours || 1); fd.append('maxRentalHours', form.maxRentalHours || 24);
      units.forEach(u => fd.append('rentalUnits[]', u));
      fd.append('registrationNumber', form.registrationNumber || '');
      fd.append('bikeNumber', form.bikeNumber || '');
      fd.append('rcNumber', form.rcNumber || '');
      fd.append('chassisNumber', form.chassisNumber || '');
      fd.append('engineNumber', form.engineNumber || '');
      if (form.insuranceValidTill) fd.append('insuranceValidTill', form.insuranceValidTill);
      if (form.pucValidTill) fd.append('pucValidTill', form.pucValidTill);
      fd.append('location', JSON.stringify({ city: form.city, state: form.state, pincode: form.pincode, address: form.address }));
      fd.append('dropLocation', JSON.stringify({ city: form.dropCity, state: form.dropState, pincode: form.dropPincode, address: form.dropAddress }));
      fd.append('features', JSON.stringify(form.features.split(',').map(f => f.trim()).filter(Boolean)));
      for (const img of images) fd.append('images', img);
      for (const url of existingImages) fd.append('existingImages', url);

      if (editId) {
        const { data: res } = await rentalApi.updateRentalCar(editId, fd);
        setData(data.map(d => d._id === editId ? res.car : d));
        toast.success('Rental bike updated');
      } else {
        const { data: res } = await rentalApi.createRentalCar(fd);
        setData([res.car, ...data]);
        toast.success('Rental bike added');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rental bike?')) return;
    try {
      await rentalApi.deleteRentalCar(id);
      setData(data.filter(d => d._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  if (showForm) {
    return (
      <div className="admin-form-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontSize: '2rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>{editId ? 'UPDATE' : 'ADD'} <span style={{ color: '#E53935' }}>RENTAL BIKE</span></h3>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.2rem', border: '1px solid #EEE' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '1rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BASIC DETAILS</h4>
            <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>TITLE</label><input className="input-light" placeholder="Auto-generated" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>BRAND *</label><input className="input-light" required placeholder="e.g. Honda" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MODEL *</label><input className="input-light" required placeholder="e.g. Activa" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>YEAR *</label><input type="number" className="input-light" required min={2000} max={new Date().getFullYear() + 1} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PRICE / DAY (₹) *</label><input type="number" className="input-light" required value={form.pricePerDay} onChange={e => setForm({ ...form, pricePerDay: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PRICE / HOUR (₹)</label><input type="number" className="input-light" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: e.target.value })} style={{ height: 46 }} /></div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>SECURITY DEPOSIT (₹)</label>
                <input type="number" className="input-light" value={form.securityDeposit} onChange={e => setForm({ ...form, securityDeposit: e.target.value })} style={{ height: 46 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>COMPULSORY DEPOSIT?</label>
                <div style={{ height: 46, display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <button type="button"
                    onClick={() => setForm({ ...form, securityDepositCompulsory: !form.securityDepositCompulsory })}
                    aria-pressed={form.securityDepositCompulsory}
                    style={{
                      position: 'relative',
                      width: 54, height: 28, borderRadius: 999,
                      border: 'none', cursor: 'pointer', padding: 0,
                      background: form.securityDepositCompulsory ? '#E53935' : '#CBD5E1',
                      transition: 'background 0.2s',
                      boxShadow: form.securityDepositCompulsory ? '0 4px 10px rgba(229,57,53,0.25)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, left: form.securityDepositCompulsory ? 29 : 3,
                      width: 22, height: 22, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.05em', color: form.securityDepositCompulsory ? '#E53935' : '#94A3B8', textTransform: 'uppercase' }}>
                    {form.securityDepositCompulsory ? 'Compulsory' : 'Optional'}
                  </span>
                </div>
              </div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>SEATS</label><input type="number" className="input-light" min={1} max={3} value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>FUEL TYPE</label>
                <select className="input-light" value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })} style={{ height: 46 }}>
                  {['petrol', 'diesel', 'electric', 'hybrid', 'cng'].map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>TRANSMISSION</label>
                <select className="input-light" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })} style={{ height: 46 }}>
                  <option value="manual">MANUAL</option><option value="automatic">AUTOMATIC</option>
                </select>
              </div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MILEAGE</label><input className="input-light" placeholder="e.g. 50 kmpl" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>STATUS</label>
                <select className="input-light" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ height: 46 }}>
                  <option value="available">AVAILABLE</option>
                  <option value="rented">RENTED</option>
                  <option value="maintenance">MAINTENANCE</option>
                  <option value="inactive">INACTIVE</option>
                </select>
              </div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MIN RENTAL DAYS</label><input type="number" min={1} className="input-light" value={form.minRentalDays} onChange={e => setForm({ ...form, minRentalDays: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MAX RENTAL DAYS</label><input type="number" min={1} className="input-light" value={form.maxRentalDays} onChange={e => setForm({ ...form, maxRentalDays: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MIN RENTAL HOURS</label><input type="number" min={1} className="input-light" value={form.minRentalHours} onChange={e => setForm({ ...form, minRentalHours: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>MAX RENTAL HOURS</label><input type="number" min={1} className="input-light" value={form.maxRentalHours} onChange={e => setForm({ ...form, maxRentalHours: e.target.value })} style={{ height: 46 }} /></div>
            </div>
          </div>

          <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.2rem', border: '1px solid #EEE' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '1rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PICKUP LOCATION</h4>
            <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
              <input className="input-light" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={{ height: 46 }} />
              <input className="input-light" placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={{ height: 46 }} />
              <input className="input-light" placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} style={{ height: 46 }} />
            </div>
            <input className="input-light" placeholder="Pickup address (optional)" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ height: 46, marginBottom: '1.4rem' }} />

            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '1rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DROP LOCATION</h4>
            <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
              <input className="input-light" placeholder="Drop City" value={form.dropCity} onChange={e => setForm({ ...form, dropCity: e.target.value })} style={{ height: 46 }} />
              <input className="input-light" placeholder="Drop State" value={form.dropState} onChange={e => setForm({ ...form, dropState: e.target.value })} style={{ height: 46 }} />
              <input className="input-light" placeholder="Drop Pincode" value={form.dropPincode} onChange={e => setForm({ ...form, dropPincode: e.target.value })} style={{ height: 46 }} />
            </div>
            <input className="input-light" placeholder="Drop address (optional)" value={form.dropAddress} onChange={e => setForm({ ...form, dropAddress: e.target.value })} style={{ height: 46, marginBottom: '1.4rem' }} />

            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '1rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>EXTRAS</h4>
            <input className="input-light" placeholder="Extra features (comma separated, e.g. ABS, Digital Meter, Bluetooth)" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} style={{ height: 46, marginBottom: '0.9rem' }} />
            <textarea className="input-light" placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80, padding: '0.8rem', resize: 'vertical' }} />
          </div>

          <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.2rem', border: '1px solid #EEE' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '1rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BIKE DOCUMENTS & IDENTITY</h4>
            <div className="admin-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>REGISTRATION NO.</label><input className="input-light" placeholder="e.g. MH12AB1234" maxLength={12} value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>BIKE NUMBER</label><input className="input-light" placeholder="Display number" maxLength={12} value={form.bikeNumber} onChange={e => setForm({ ...form, bikeNumber: e.target.value.toUpperCase() })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>RC NUMBER</label><input className="input-light" maxLength={20} value={form.rcNumber} onChange={e => setForm({ ...form, rcNumber: e.target.value.toUpperCase() })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>CHASSIS NUMBER</label><input className="input-light" maxLength={17} value={form.chassisNumber} onChange={e => setForm({ ...form, chassisNumber: e.target.value.toUpperCase() })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>ENGINE NUMBER</label><input className="input-light" maxLength={17} value={form.engineNumber} onChange={e => setForm({ ...form, engineNumber: e.target.value.toUpperCase() })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>INSURANCE VALID TILL</label><input type="date" className="input-light" value={form.insuranceValidTill} onChange={e => setForm({ ...form, insuranceValidTill: e.target.value })} style={{ height: 46 }} /></div>
              <div><label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PUC VALID TILL</label><input type="date" className="input-light" value={form.pucValidTill} onChange={e => setForm({ ...form, pucValidTill: e.target.value })} style={{ height: 46 }} /></div>
            </div>
          </div>

          <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.2rem', border: '1px solid #EEE' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 900, marginBottom: '0.4rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>IMAGES</h4>
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>Upload multiple images in the order you want them to appear on the listing page.</p>
            <div className="input-light" style={{ borderStyle: 'dashed', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <input type="file" multiple accept="image/*" onChange={handleImagesChange} style={{ color: '#888', fontWeight: 600 }} />
            </div>
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {existingImages.map((url, i) => (
                  <div key={`ex-${i}`} style={{ position: 'relative', width: 80, height: 80, borderRadius: '16px', overflow: 'hidden', border: '2px solid #2E7D32', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, background: '#E53935', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                  </div>
                ))}
                {imagePreviews.map((url, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80, borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #EEE', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => { setImages(prev => prev.filter((_, j) => j !== i)); setImagePreviews(prev => prev.filter((_, j) => j !== i)); }} style={{ position: 'absolute', top: 4, right: 4, background: '#E53935', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="submit" style={{ background: '#E53935', color: 'white', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 800, cursor: 'pointer' }}>{editId ? 'UPDATE' : 'CREATE'}</button>
            <button type="button" onClick={resetForm} style={{ background: '#F5F5F5', color: '#666', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', margin: 0, textTransform: 'uppercase' }}>RENTAL <span style={{ color: '#E53935' }}>BIKES</span> ({filtered.length})</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#E53935', color: 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}>
          <Plus size={14} /> ADD BIKE
        </button>
      </div>

      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={[
          { value: 'available', label: 'AVAILABLE' },
          { value: 'rented', label: 'RENTED' },
          { value: 'maintenance', label: 'MAINTENANCE' },
          { value: 'inactive', label: 'INACTIVE' }
        ]}
      />

      <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(car => (
          <div key={car._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '16px', padding: '1rem' }}>
            <div style={{ height: 140, background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.8rem' }}>
              {car.images?.[0] ? <img src={car.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#CBD5E1' }}><Bike size={36} /></div>}
            </div>
            <h4 style={{ fontWeight: 900, color: '#111', margin: 0, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>{car.brand} {car.model}</h4>
            <p style={{ color: '#888', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.2rem' }}>{car.year} • {car.transmission?.toUpperCase()} • {car.fuelType?.toUpperCase()}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: '#E53935', fontSize: '1.2rem' }}>₹{car.pricePerDay?.toLocaleString('en-IN')}/d</span>
                {car.pricePerHour > 0 && (
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: '#64748B', fontSize: '0.78rem' }}>or ₹{car.pricePerHour?.toLocaleString('en-IN')}/hr</span>
                )}
              </div>
              <span style={{ background: car.status === 'available' ? '#DCFCE7' : car.status === 'rented' ? '#FEF3C7' : '#FEE2E2', color: car.status === 'available' ? '#16A34A' : car.status === 'rented' ? '#CA8A04' : '#DC2626', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>{car.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem' }}>
              <button onClick={() => handleEdit(car)} style={{ flex: 1, background: '#F1F5F9', color: '#E53935', border: 'none', borderRadius: '8px', padding: '0.4rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.78rem' }}><Edit2 size={12} /> EDIT</button>
              <button onClick={() => handleDelete(car._id)} style={{ flex: 1, background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', padding: '0.4rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.78rem' }}><Trash2 size={12} /> DEL</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#AAA', padding: '3rem', fontWeight: 600 }}>No rental cars yet</p>}
      </div>
    </div>
  );
};

// ── RENTAL BOOKINGS TAB (Admin view + status update) ──
const rentalStatusColorMap = {
  requested: { bg: '#FEF3C7', fg: '#CA8A04' },
  confirmed: { bg: '#DBEAFE', fg: '#1D4ED8' },
  active: { bg: '#DCFCE7', fg: '#16A34A' },
  completed: { bg: '#E0E7FF', fg: '#4338CA' },
  cancelled: { bg: '#FEE2E2', fg: '#DC2626' },
};

const RentalBookingsTab = ({ setActiveTab, setTrackingBookingId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    rentalApi.getAllRentalBookings({ limit: 200 })
      .then(({ data }) => setData(data.bookings || []))
      .catch(() => toast.error('Failed to load rental bookings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (filterMode === 'all') return true;
    const created = new Date(b.createdAt);
    if (filterMode === 'day') return created.toISOString().split('T')[0] === filterDay;
    if (filterMode === 'month') return created.toISOString().slice(0, 7) === filterMonth;
    if (filterMode === 'year') return String(created.getFullYear()) === filterYear;
    if (filterMode === 'custom') {
      if (filterFrom && created < new Date(filterFrom)) return false;
      if (filterTo) {
        const end = new Date(filterTo); end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    }
    return true;
  });

  const handleStatus = async (id, status) => {
    try {
      const { data: res } = await rentalApi.updateRentalBookingStatus(id, { status });
      setData(prev => prev.map(b => b._id === id ? (res.booking || { ...b, status }) : b));
      if (selected && selected._id === id) setSelected(res.booking || { ...selected, status });
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCollectBalance = async (id, due) => {
    const method = window.prompt(`Collect balance ₹${due.toLocaleString('en-IN')} via (cash/online/upi/card)?`, 'cash');
    if (!method) return;
    try {
      const { data: res } = await rentalApi.collectRentalBalance(id, { method });
      setData(prev => prev.map(b => b._id === id ? (res.booking || { ...b, payment: res.booking?.payment }) : b));
      if (selected && selected._id === id) setSelected(res.booking || selected);
      toast.success('Balance collected');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to collect balance'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', margin: 0, textTransform: 'uppercase' }}>
          RENTAL <span style={{ color: '#E53935' }}>BOOKINGS</span>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '0.5rem', fontWeight: 700 }}>
            ({filtered.length}{filtered.length !== data.length ? ` of ${data.length}` : ''})
          </span>
        </h3>
      </div>

      <FilterBar 
        filterMode={filterMode} setFilterMode={setFilterMode}
        filterDay={filterDay} setFilterDay={setFilterDay}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        filterYear={filterYear} setFilterYear={setFilterYear}
        filterFrom={filterFrom} setFilterFrom={setFilterFrom}
        filterTo={filterTo} setFilterTo={setFilterTo}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        statusOptions={Object.keys(rentalStatusColorMap).map(k => ({ value: k, label: k.toUpperCase() }))}
      />

      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#AAA', fontWeight: 600 }}>{data.length === 0 ? 'No rental bookings yet' : 'No bookings match the current filter'}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {filtered.map(b => {
            const sc = rentalStatusColorMap[b.status] || { bg: '#F1F5F9', fg: '#475569' };
            const isHour = b.rentalUnit === 'hour';
            const car = b.rentalCar || {};
            const img = b.carSnapshot?.image || car.images?.[0];
            return (
              <div key={b._id} onClick={() => setSelected(b)}
                style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '16px', padding: '1rem', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E53935'; e.currentTarget.style.boxShadow = '0 14px 35px rgba(229,57,53,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EEE'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ background: '#0F172A', color: 'white', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em' }}>#{b._id.slice(-8).toUpperCase()}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {['active', 'confirmed'].includes(b.status) && setActiveTab && setTrackingBookingId && (
                      <button onClick={(e) => { e.stopPropagation(); setTrackingBookingId(b._id); setActiveTab('live-tracking'); }}
                        style={{ background: 'rgba(229,57,53,0.1)', color: '#E53935', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={10} /> TRACK
                      </button>
                    )}
                    <span style={{ background: sc.bg, color: sc.fg, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.status}</span>
                  </div>
                </div>
                <div style={{ height: 110, background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                  {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#CBD5E1' }}><Bike size={32} /></div>}
                </div>
                <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '1rem', color: '#0F172A', margin: 0, lineHeight: 1.1 }}>
                  {b.carSnapshot?.brand || car.brand} {b.carSnapshot?.model || car.model}
                </h4>
                <p style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600, marginTop: '0.2rem' }}>
                  {b.fullName || b.user?.name || 'Customer'} • {b.contactPhone || b.user?.phone || '-'}
                </p>
                <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>
                    {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} → {new Date(b.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    <span style={{ color: '#94A3B8', marginLeft: '0.3rem' }}>({isHour ? `${b.totalHours}h` : `${b.totalDays}d`})</span>
                  </span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, color: '#E53935', fontSize: '1rem' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', fontWeight: 800, color: b.payment?.status === 'paid' ? '#16A34A' : '#CA8A04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {(b.payment?.method || 'cod').toUpperCase()} • {b.payment?.status === 'paid' ? '✓ PAID' : (b.payment?.status === 'advance_paid' ? 'ADVANCE PAID' : 'PAYMENT PENDING')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <RentalBookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={(s) => handleStatus(selected._id, s)}
          onCollectBalance={(due) => handleCollectBalance(selected._id, due)}
          onTrack={setActiveTab && setTrackingBookingId ? () => { setTrackingBookingId(selected._id); setActiveTab('live-tracking'); setSelected(null); } : null} />
      )}
    </div>
  );
};

const RentalBookingDetailModal = ({ booking, onClose, onUpdateStatus, onCollectBalance, onTrack }) => {
  const sc = rentalStatusColorMap[booking.status] || { bg: '#F1F5F9', fg: '#475569' };
  const isHour = booking.rentalUnit === 'hour';
  const car = booking.rentalCar || {};
  const img = booking.carSnapshot?.image || car.images?.[0];
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const fmtDateTime = (d, t) => `${fmtDate(d)} • ${t || '—'}`;
  const reg = car.registrationNumber || booking.carSnapshot?.registrationNumber;

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '20px', maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.8rem', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#0F172A', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 900, fontFamily: 'monospace' }}>#{booking._id.slice(-8).toUpperCase()}</span>
              <span style={{ background: sc.bg, color: sc.fg, padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{booking.status}</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 600 }}>Booked on {new Date(booking.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onTrack && ['active', 'confirmed'].includes(booking.status) && (
              <button onClick={onTrack} style={{ background: '#E53935', border: 'none', borderRadius: '10px', padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: 'white', fontSize: '0.8rem' }}>
                <MapPin size={14} /> LIVE TRACK
              </button>
            )}
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.5rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: '#475569' }}>
              <X size={16} /> CLOSE
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.8rem' }}>
          {/* Status update */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <label style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Current Status:</label>
            <select value={booking.status} onChange={e => onUpdateStatus(e.target.value)}
              className="input-light" style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem', height: 'auto', background: 'white', fontWeight: 800, minWidth: 160, border: '1px solid #CBD5E1' }}>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Bike summary */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.2rem' }}>
            {img ? <img src={img} alt="" style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: '12px', border: '1px solid #EEE' }} /> : <div style={{ width: 110, height: 80, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bike size={32} color="#CBD5E1" /></div>}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#0F172A', margin: 0, lineHeight: 1.1 }}>
                {booking.carSnapshot?.brand || car.brand} {booking.carSnapshot?.model || car.model}
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>
                {booking.carSnapshot?.year || car.year}
                {car.fuelType && ` • ${car.fuelType.toUpperCase()}`}
                {car.transmission && ` • ${car.transmission.toUpperCase()}`}
              </p>
              {reg && (
                <span style={{ display: 'inline-block', marginTop: '0.4rem', background: '#0F172A', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>{reg}</span>
              )}
            </div>
          </div>

          {/* Vehicle Identity */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Vehicle Identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Reg No:</strong> <span style={{ fontFamily: 'monospace' }}>{reg || '-'}</span></div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Bike No:</strong> {car.bikeNumber || booking.carSnapshot?.bikeNumber || '-'}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>RC No:</strong> {car.rcNumber || '-'}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Chassis:</strong> {car.chassisNumber || '-'}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Engine:</strong> {car.engineNumber || '-'}</div>
            </div>
          </div>

          {/* Customer */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Customer</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Name:</strong> {booking.fullName || booking.user?.name || '-'}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Phone:</strong> {booking.contactPhone || booking.user?.phone || '-'}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Email:</strong> {booking.user?.email || '-'}</div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Pickup:</strong> {fmtDateTime(booking.pickupDate, booking.pickupTime)}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Return:</strong> {fmtDateTime(booking.returnDate, booking.returnTime)}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Duration:</strong> {isHour ? `${booking.totalHours} hour(s)` : `${booking.totalDays} day(s)`}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Mode:</strong> {(booking.rentalUnit || 'day').toUpperCase()}</div>
            </div>
            {booking.pickupAddress && (booking.pickupAddress.street || booking.pickupAddress.city) && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <strong>Pickup Address:</strong> {[booking.pickupAddress.street, booking.pickupAddress.city, booking.pickupAddress.state, booking.pickupAddress.pincode].filter(Boolean).join(', ')}
              </div>
            )}
            {car.location?.city && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <strong style={{ color: '#E53935' }}>📍 Pickup (bike):</strong> {[car.location.city, car.location.state, car.location.pincode].filter(Boolean).join(', ')}
              </div>
            )}
            {car.dropLocation?.city && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <strong style={{ color: '#16A34A' }}>📍 Drop (bike):</strong> {[car.dropLocation.city, car.dropLocation.state, car.dropLocation.pincode].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div style={{ background: '#FEF2F2', border: '1px solid rgba(229,57,53,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#E53935', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Pricing</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', fontWeight: 700, marginBottom: '0.3rem' }}>
              <span>{isHour ? `₹${booking.pricePerHour?.toLocaleString('en-IN')} × ${booking.totalHours} hour(s)` : `₹${booking.pricePerDay?.toLocaleString('en-IN')} × ${booking.totalDays} day(s)`}</span>
              <span>₹{booking.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {booking.securityDeposit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', fontWeight: 700, marginBottom: '0.3rem' }}>
                <span>Security Deposit (refundable)</span><span>₹{booking.securityDeposit?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(229,57,53,0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 900, color: '#0F172A' }}>TOTAL</span>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, fontSize: '1.3rem', color: '#E53935' }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Payment</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Method:</strong> {(booking.payment?.method || 'cod').toUpperCase()}</div>
              <div><strong style={{ color: '#475569', fontWeight: 600 }}>Status:</strong> <span style={{ color: booking.payment?.status === 'paid' ? '#16A34A' : '#CA8A04' }}>{(booking.payment?.status || 'pending').toUpperCase()}</span></div>
              {booking.payment?.plan && <div><strong style={{ color: '#475569', fontWeight: 600 }}>Plan:</strong> {booking.payment.plan.toUpperCase()}</div>}
              {booking.payment?.razorpayOrderId && <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}><strong style={{ color: '#475569', fontWeight: 600 }}>Order ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{booking.payment.razorpayOrderId}</span></div>}
              {booking.payment?.razorpayPaymentId && <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}><strong style={{ color: '#475569', fontWeight: 600 }}>Payment ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{booking.payment.razorpayPaymentId}</span></div>}
              {booking.payment?.paidAt && <div><strong style={{ color: '#475569', fontWeight: 600 }}>Paid At:</strong> {new Date(booking.payment.paidAt).toLocaleString('en-IN')}</div>}
            </div>
            {booking.payment?.balanceDue > 0 && (
              <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', background: '#FEE2E2', borderRadius: 8 }}>
                <span style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 800 }}>Balance due: ₹{booking.payment.balanceDue.toLocaleString('en-IN')}</span>
                <button onClick={() => onCollectBalance(booking.payment.balanceDue)}
                  style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}>
                  Collect
                </button>
              </div>
            )}
          </div>

          {/* KYC Documents */}
          {(booking.kyc?.aadharNumber || booking.kyc?.panNumber || booking.kyc?.aadharImage || booking.kyc?.panImage || booking.kyc?.licenseImage) && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#92400E', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>KYC Documents</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700, marginBottom: '0.7rem' }}>
                {booking.kyc?.aadharNumber && (
                  <div><strong style={{ color: '#475569', fontWeight: 600 }}>Aadhar:</strong> <span style={{ fontFamily: 'monospace' }}>{booking.kyc.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span></div>
                )}
                {booking.kyc?.panNumber && (
                  <div><strong style={{ color: '#475569', fontWeight: 600 }}>PAN:</strong> <span style={{ fontFamily: 'monospace' }}>{booking.kyc.panNumber}</span></div>
                )}
                {booking.driverLicense && (
                  <div><strong style={{ color: '#475569', fontWeight: 600 }}>License:</strong> <span style={{ fontFamily: 'monospace' }}>{booking.driverLicense}</span></div>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {[
                  ['Aadhar', booking.kyc?.aadharImage],
                  ['PAN', booking.kyc?.panImage],
                  ['License', booking.kyc?.licenseImage],
                ].filter(([, url]) => url).map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                    <div style={{ width: 110, height: 80, borderRadius: '10px', overflow: 'hidden', border: '2px solid #FDE68A', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/\.pdf$/i.test(url) ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B45309' }}>📄 PDF</span>
                      ) : (
                        <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {booking.notes && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.7rem 1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#92400E', fontWeight: 600, marginBottom: '1rem' }}>
              <strong>Customer Note:</strong> {booking.notes}
            </div>
          )}

          {/* Status timeline */}
          {booking.statusHistory?.length > 0 && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status History</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {booking.statusHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderBottom: i < booking.statusHistory.length - 1 ? '1px dashed #E2E8F0' : 'none', paddingBottom: '0.3rem' }}>
                    <div>
                      <strong style={{ color: '#0F172A', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>{h.status}</strong>
                      {h.note && <span style={{ color: '#64748B', marginLeft: '0.5rem' }}>— {h.note}</span>}
                    </div>
                    <span style={{ color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{new Date(h.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ── LIVE TRACKING TAB ──────────────────────────────────────────
const LiveTrackingTab = ({ targetId, onClearTarget }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(targetId || null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [expandedCard, setExpandedCard] = useState(targetId || null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (targetId) {
      setSelectedBooking(targetId);
      setExpandedCard(targetId);
    }
  }, [targetId]);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Fetch active bookings
    rentalApi.getActiveLocations()
      .then(({ data }) => {
        setBookings(data.bookings || []);
      })
      .catch(() => toast.error('Failed to load active rentals'))
      .finally(() => setLoading(false));

    // Connect socket
    const serverUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5003';
    const socket = io(serverUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('admin_watch_all');
    });
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('location_update', (data) => {
      setBookings(prev => prev.map(b =>
        b._id === data.bookingId
          ? { ...b, currentLocation: { lat: data.lat, lng: data.lng, heading: data.heading, speed: data.speed, updatedAt: data.updatedAt } }
          : b
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync markers when bookings change
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    bookings.forEach(b => {
      if (b.currentLocation?.lat && b.currentLocation?.lng) {
        if (markersRef.current[b._id]) {
          // Update existing marker
          markersRef.current[b._id].setLatLng([b.currentLocation.lat, b.currentLocation.lng]);
        } else {
          // Create new marker
          const carIcon = L.divIcon({
            className: 'custom-car-marker',
            html: `<div style="background:#E53935;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 4px 15px rgba(229,57,53,0.4);">🏍️</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const marker = L.marker([b.currentLocation.lat, b.currentLocation.lng], { icon: carIcon })
            .bindPopup(`<strong>${b.carSnapshot?.brand || ''} ${b.carSnapshot?.model || ''}</strong><br/>Renter: ${b.user?.name || 'N/A'}<br/>Phone: ${b.user?.phone || 'N/A'}`)
            .addTo(map);

          markersRef.current[b._id] = marker;
        }
      }
    });
  }, [bookings]);

  // Initialize map after loading
  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      const L = window.L;
      if (!L) {
        setTimeout(initMap, 200);
        return;
      }

      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for bookings with locations
      bookings.forEach(b => {
        if (b.currentLocation?.lat && b.currentLocation?.lng) {
          const carIcon = L.divIcon({
            className: 'custom-car-marker',
            html: `<div style="background:#E53935;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 4px 15px rgba(229,57,53,0.4);">🏍️</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const marker = L.marker([b.currentLocation.lat, b.currentLocation.lng], { icon: carIcon })
            .bindPopup(`<strong>${b.carSnapshot?.brand} ${b.carSnapshot?.model}</strong><br/>Renter: ${b.user?.name || 'N/A'}<br/>Phone: ${b.user?.phone || 'N/A'}`)
            .addTo(map);

          markersRef.current[b._id] = marker;
        }
      });

      // Fit bounds if markers exist
      const markersWithLoc = bookings.filter(b => b.currentLocation?.lat);
      if (markersWithLoc.length > 0) {
        const bounds = L.latLngBounds(markersWithLoc.map(b => [b.currentLocation.lat, b.currentLocation.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    };

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [loading, bookings]);

  const focusBooking = (booking) => {
    setSelectedBooking(booking._id);
    if (onClearTarget) onClearTarget();
    if (mapInstanceRef.current && booking.currentLocation?.lat) {
      mapInstanceRef.current.setView([booking.currentLocation.lat, booking.currentLocation.lng], 15, { animate: true });
      if (markersRef.current[booking._id]) {
        markersRef.current[booking._id].openPopup();
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    const s = filterText.toLowerCase();
    const renterName = (b.user?.name || '').toLowerCase();
    const brand = (b.carSnapshot?.brand || b.rentalCar?.brand || '').toLowerCase();
    const model = (b.carSnapshot?.model || b.rentalCar?.model || '').toLowerCase();
    return renterName.includes(s) || brand.includes(s) || model.includes(s);
  });

  if (loading) return <div style={{textAlign:'center', padding:'3rem', color:'#888'}}><Loader style={{ animation: 'spin 1s linear infinite' }} size={24} /></div>;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar - Active Bookings List */}
      <div style={{ width: 340, flexShrink: 0, background: '#FFF', border: '1.5px solid #EEE', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: '#111', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', margin: 0 }}>
              ACTIVE <span style={{ color: '#E53935' }}>RENTALS</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: socketConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: socketConnected ? '#10B981' : '#EF4444', animation: socketConnected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: socketConnected ? '#10B981' : '#EF4444' }}>
                {socketConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Filter by renter or bike..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '0.6rem 0.8rem 0.6rem 2rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#E53935'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.2rem' }}>
          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#AAA' }}>
              <MapPin size={40} style={{ marginBottom: '1rem', color: '#DDD' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{bookings.length === 0 ? 'No active rentals at the moment' : 'No matching rentals'}</p>
            </div>
          ) : filteredBookings.map(b => {
            const car = {
              ...(b.carSnapshot || {}),
              ...(typeof b.rentalCar === 'object' ? b.rentalCar : {})
            };
            const isExpanded = expandedCard === b._id;
            return (
              <div key={b._id} onClick={() => focusBooking(b)}
                style={{
                  background: selectedBooking === b._id ? '#FEF2F2' : '#F9F9F9',
                  border: `1.5px solid ${selectedBooking === b._id ? '#E53935' : '#EEE'}`,
                  borderRadius: '16px', padding: '1rem', marginBottom: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#111', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', margin: 0 }}>
                      {car.brand} {car.model}
                    </h4>
                    <p style={{ color: '#666', fontSize: '0.8rem', fontWeight: 600, margin: '0.3rem 0' }}>
                      Renter: {b.fullName || b.user?.name || 'N/A'}
                    </p>
                    <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>
                      {b.contactPhone || b.user?.phone || 'No phone'}
                    </p>

                    {isExpanded && (
                      <div style={{ marginTop: '0.8rem', padding: '0.55rem 0.7rem', background: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.05em' }}>Vehicle Identity</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', rowGap: '0.35rem', columnGap: '0.4rem' }}>
                          {[
                            ['REG', car.registrationNumber],
                            ['BIKE NO', car.bikeNumber],
                            ['CHASSIS', car.chassisNumber],
                            ['ENGINE', car.engineNumber],
                            ['RC NO', car.rcNumber],
                          ].flatMap(([label, value]) => [
                            <span key={`${label}-l`} style={{ fontSize: '0.58rem', color: '#475569', fontWeight: 700 }}>{label}:</span>,
                            <span key={`${label}-v`} style={{ fontSize: '0.58rem', color: '#475569', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value || '-'}</span>,
                          ])}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {b.currentLocation?.lat ? (
                      <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981' }}>TRACKING</span>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#F59E0B' }}>WAITING</span>
                      </div>
                    )}
                    <div onClick={(e) => { e.stopPropagation(); setExpandedCard(isExpanded ? null : b._id); }}
                      style={{ padding: '0.4rem', color: '#94A3B8', transition: 'color 0.2s', cursor: 'pointer' }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {b.currentLocation?.updatedAt && (
                  <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700, margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={11} /> Last update: {new Date(b.currentLocation.updatedAt).toLocaleTimeString('en-IN')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, background: '#FFF', border: '1.5px solid #EEE', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .custom-car-marker { background: none !important; border: none !important; }
        `}</style>
      </div>
    </div>
  );
};

export default function AdminDashboard() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentServices, setRecentServices] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackingBookingId, setTrackingBookingId] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    API.get('/admin/stats').then(({ data }) => setStats(data.stats));
    API.get('/services?limit=5').then(({ data }) => setRecentServices(data.bookings || []));
  }, []);




  const sidebarLinks = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
     { id: 'live-tracking', icon: MapPin, label: 'Live Tracking' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'bikes', icon: Bike, label: 'Bikes' },
    { id: 'rentals', icon: Bike, label: 'Rental Bikes' },
    { id: 'rental-bookings', icon: Calendar, label: 'Rental Bookings' },
    { id: 'services', icon: Wrench, label: 'Services' },
    { id: 'sells', icon: TrendingUp, label: 'Sell Requests' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'parts', icon: Package, label: 'Parts' },
    { id: 'leads', icon: List, label: 'Buy Requests' },
  ];


  const statusBadge = (status) => {
    const map = { requested: 'badge-orange', accepted: 'badge-blue', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F5F5' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-main > div { padding: 0.75rem !important; }
          .admin-page-title { font-size: 1.4rem !important; }
          .admin-main h3 { font-size: 1.2rem !important; }
          .admin-main table { min-width: 600px; }
          .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .admin-form-2col { grid-template-columns: 1fr !important; }
          .admin-form-4col { grid-template-columns: 1fr 1fr !important; }
          .admin-card-grid { grid-template-columns: 1fr !important; }
          .admin-media-grid { grid-template-columns: 1fr !important; }
          .admin-pincode-2col { grid-template-columns: 1fr !important; }
          .admin-form-wrap { padding: 1rem !important; }
          .admin-form-wrap h3 { font-size: 1.4rem !important; }
          .admin-sell-actions { flex-direction: column !important; }
          .admin-sell-actions > * { width: 100% !important; flex: unset !important; min-width: unset !important; }
          .admin-sell-actions select, .admin-sell-actions input { width: 100% !important; }
          .admin-leads-grid { grid-template-columns: 1fr !important; gap: 0.6rem !important; }
        }
        @media (max-width: 480px) {
          .admin-form-4col { grid-template-columns: 1fr !important; }
          .admin-main table { min-width: 500px; font-size: 0.72rem; }
          .admin-main table th, .admin-main table td { padding: 0.5rem 0.35rem !important; }
          .admin-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .admin-main p { font-size: 0.85rem !important; }
        }
        @media (max-width: 640px) {
          .admin-main table { font-size: 0.78rem; }
          .admin-main table th, .admin-main table td { padding: 0.5rem 0.4rem !important; }
        }
      `}</style>
      {/* Mobile top bar */}
      <div className="admin-mobile-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: '#111', borderBottom: '1px solid #2A2A2A', padding: '0.7rem 1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo height={30} />
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.3rem' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 69 }} />}
      {/* Sidebar */}
      <div className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: 280, background: '#111', borderRight: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #2A2A2A' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={38} />
          </div>
          <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ADMIN PORTAL</div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0.75rem' }}>
          {sidebarLinks.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.9rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeTab === id ? 'rgba(229,57,53,0.1)' : 'transparent',
                color: activeTab === id ? '#E53935' : '#888',
                fontSize: '0.9rem', fontWeight: 600,
                marginBottom: '0.25rem', textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '0.04em'
              }}
              onMouseEnter={e => { if(activeTab !== id) e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if(activeTab !== id) e.currentTarget.style.color = '#888'; }}>
              <Icon size={18} /> {label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #2A2A2A' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', color: '#888', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600 }}>
            <Home size={18} /> View Site
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', background: 'none', border: 'none', color: '#E53935', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '3rem' }}>
          <h2 className="admin-page-title" style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 950, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {sidebarLinks.find(l => l.id === activeTab)?.label || 'DASHBOARD'}
          </h2>
          <p style={{ color: '#888', marginBottom: '3rem', fontSize: '1.1rem', fontWeight: 500 }}>Welcome back, <span style={{ color: '#111', fontWeight: 800 }}>{user?.name}</span></p>

          {activeTab === 'dashboard' && stats && (
            <>
              {/* Stats Grid */}
              <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                <StatCard icon={Users} label="Total Users" value={stats.users?.toLocaleString()} color="#2196F3" />
                <StatCard icon={Bike} label="Bike Listings" value={stats.bikes?.toLocaleString()} color="#E53935" />
                <StatCard icon={Wrench} label="Services" value={stats.services?.toLocaleString()} color="#FB8C00" />
                <StatCard icon={TrendingUp} label="Revenue" value={`₹${(stats.revenue / 1000).toFixed(1)}K`} color="#2E7D32" />
                <StatCard icon={Clock} label="Pending Services" value={stats.pendingServices} color="#FB8C00" />
                <StatCard icon={AlertCircle} label="Pending Sells" value={stats.pendingSells} color="#E53935" />
                <StatCard icon={Car} label="Rental Bikes" value={stats.rentalCars?.toLocaleString() || 0} color="#E53935" />
                <StatCard icon={Calendar} label="Rental Bookings" value={stats.rentalBookings?.toLocaleString() || 0} color="#0F172A" />
              </div>

              {/* Recent Service Bookings */}
              <div className="admin-table-wrap" style={{ background: '#FFFFFF', border: '1.5px solid #EEE', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ color: '#111', fontWeight: 950, marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', textTransform: 'uppercase' }}>RECENT <span style={{ color: '#E53935' }}>BOOKINGS</span></h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        {['CUSTOMER', 'BIKE', 'SERVICE', 'DATE', 'STATUS'].map(h => (
                          <th key={h} style={{ padding: '1.2rem', textAlign: 'left', color: '#888', borderBottom: '1.5px solid #EEE', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentServices.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                          <td style={{ padding: '1.2rem', color: '#111', fontWeight: 800 }}>{booking.user?.name || 'N/A'}</td>
                          <td style={{ padding: '1.2rem', color: '#666', fontWeight: 600 }}>{booking.bikeBrand} {booking.bikeModel}</td>
                          <td style={{ padding: '1.2rem', color: '#666', fontWeight: 600 }}>{booking.serviceLabel}</td>
                          <td style={{ padding: '1.2rem', color: '#666', fontWeight: 600 }}>{new Date(booking.scheduledDate).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '1.2rem' }}>{statusBadge(booking.status)}</td>
                        </tr>
                      ))}
                      {!recentServices.length && (
                        <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No bookings yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'parts' && <PartsTab />}
          {activeTab === 'bikes' && <BikesTab />}
          {activeTab === 'rentals' && <RentalsTab />}
          {activeTab === 'rental-bookings' && <RentalBookingsTab setActiveTab={setActiveTab} setTrackingBookingId={setTrackingBookingId} />}
          {activeTab === 'sells' && <SellsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'live-tracking' && <LiveTrackingTab targetId={trackingBookingId} onClearTarget={() => setTrackingBookingId(null)} />}

        </div>
      </div>
    </div>
  );
}
