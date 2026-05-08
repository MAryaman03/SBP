import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../../context/AuthContext';
import { Users, CalendarCheck, Scissors, DollarSign, Search, Check, X, Clock, Image as ImageIcon, Trash2, Edit3, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const tabs = ['Overview', 'Appointments', 'Services', 'Reviews', 'Gallery'];
const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [searchRef, setSearchRef] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [uploading, setUploading] = useState(false);
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ title: '', category: 'Hair', image: null });
  const [newService, setNewService] = useState({ name: '', category: 'Hair', price: '', duration: '', description: '', isFeatured: false });
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    API.get('/admin/stats')
      .then((r) => setStats(r.data.stats || r.data.data))
      .catch((err) => {
        console.error('Stats fetch failed:', err?.response?.status);
        // Build stats from local mock bookings as fallback
        try {
          const mockBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
          setStats({
            totalAppointments: mockBookings.length,
            pendingAppointments: mockBookings.filter(b => (b.status || b.bookingStatus) === 'pending').length,
            cancelledBookings: mockBookings.filter(b => (b.status || b.bookingStatus) === 'cancelled').length,
            totalRevenue: mockBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
            totalUsers: 0,
            totalServices: 0,
          });
        } catch(e) {}
      });
  };

  useEffect(() => {
    if (activeTab === 'Appointments') {
      setLoading(true);
      API.get(`/admin/appointments${searchRef ? `?bookingRef=${searchRef}` : ''}`)
        .then((r) => {
          let backendBookings = r.data.appointments || r.data.data?.bookings || [];
          try {
            const mockBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
            backendBookings = [...mockBookings, ...backendBookings];
          } catch(e) {}
          setAppointments(backendBookings);
        })
        .catch((err) => {
          console.error('Appointments fetch failed:', err?.response?.status);
          // Fall back to local mock bookings
          try {
            const mockBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
            if (searchRef) {
              setAppointments(mockBookings.filter(b => (b.bookingReference || '').includes(searchRef)));
            } else {
              setAppointments(mockBookings);
            }
          } catch(e) {
            setAppointments([]);
          }
        })
        .finally(() => setLoading(false));
    }
    if (activeTab === 'Services') {
      API.get('/services').then((r) => setServices(r.data.services || [])).catch(console.error);
    }
    if (activeTab === 'Reviews') {
      API.get('/admin/reviews').then((r) => setReviews(r.data.reviews || [])).catch(console.error);
    }
    if (activeTab === 'Gallery') {
      API.get('/gallery').then((r) => setGallery(r.data.items || [])).catch(console.error);
    }
  }, [activeTab, searchRef]);

  // Appointment Actions
  const updateStatus = async (id, status) => {
    try {
      // Client-side validation for confirmation
      if (status === 'confirmed') {
        const appt = appointments.find(a => a._id === id);
        if (appt) {
          const missing = [];
          if (!appt.bookingDate && !appt.appointmentDate) missing.push('date');
          if (!appt.bookingTime && !appt.startTime) missing.push('time');
          if (!appt.service && !appt.serviceId) missing.push('service');
          if (missing.length > 0) {
            toast.error(`Cannot confirm — missing: ${missing.join(', ')}`);
            return;
          }
        }
      }

      if (id.startsWith('mock_id_')) {
        const stored = JSON.parse(localStorage.getItem('mockBookings') || '[]');
        const updated = stored.map((b) => b._id === id ? { ...b, status, bookingStatus: status } : b);
        localStorage.setItem('mockBookings', JSON.stringify(updated));
        setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status, bookingStatus: status } : a)));
        toast.success(`Booking marked as ${status}`);
        return;
      }
      const res = await API.put(`/admin/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? (res.data.appointment || res.data.data || a) : a)));
      toast.success(`Booking marked as ${status}`);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      if (id.startsWith('mock_id_')) {
        const stored = JSON.parse(localStorage.getItem('mockBookings') || '[]');
        const updated = stored.filter((b) => b._id !== id);
        localStorage.setItem('mockBookings', JSON.stringify(updated));
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success('Booking deleted');
        return;
      }
      await API.delete(`/admin/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Booking deleted');
      fetchStats();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Review Actions
  const updateReview = async (id, updates) => {
    try {
      await API.put(`/admin/reviews/${id}`, updates);
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, ...updates } : r)));
      toast.success('Review updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Service Actions
  const handleServiceSubmit = async () => {
    try {
      setUploading(true);
      const res = await API.post('/services', newService);
      setServices([res.data.service, ...services]);
      setShowServiceForm(false);
      setNewService({ name: '', category: 'Hair', price: '', duration: '', description: '', isFeatured: false });
      toast.success('Service added successfully');
      fetchStats();
    } catch (err) {
      toast.error('Failed to add service');
    } finally {
      setUploading(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      await API.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success('Service deleted');
      fetchStats();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <main className="admin" style={{ paddingTop: '100px' }}>
      <div className="admin__header">
        <h1 className="admin__title">Executive Panel</h1>
        <p className="admin__sub">Snigdha Beauty Parlour Management</p>
      </div>

      <div className="admin__body">
        {/* Luxury Glass Tabs */}
        <div className="admin__tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={`admin__tab ${activeTab === t ? 'admin__tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeTab === 'Overview' && stats && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin__stats">
                {[
                  { icon: <CalendarCheck size={26} />, label: 'Total Bookings', value: stats.totalAppointments || stats.totalBookings || 0, color: '#eeadca' },
                  { icon: <Check size={26} />, label: 'Confirmed', value: stats.bookingsByStatus?.confirmed || 0, color: '#2ecc71' },
                  { icon: <Clock size={26} />, label: 'Pending', value: stats.pendingAppointments || stats.bookingsByStatus?.pending || 0, color: '#f1c40f' },
                  { icon: <X size={26} />, label: 'Cancelled', value: stats.cancelledBookings || stats.bookingsByStatus?.cancelled || 0, color: '#e74c3c' },
                  { icon: <DollarSign size={26} />, label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#9b59b6' },
                  { icon: <Users size={26} />, label: 'Active Clients', value: stats.totalUsers || 0, color: '#3498db' },
                  { icon: <Scissors size={26} />, label: 'Services', value: stats.totalServices || 0, color: '#1abc9c' },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className="admin__stat-card">
                    <div className="admin__stat-icon" style={{ color, background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.15)` }}>{icon}</div>
                    <p className="admin__stat-value">{value}</p>
                    <p className="admin__stat-label">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'Appointments' && (
            <motion.div key="appointments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin__toolbar">
                <div className="admin__search">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by Reference (e.g. SBP-2026...)"
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64 text-white/50">Loading Bookings...</div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="admin__table-wrapper desktop-table">
                    <table className="admin__table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Client</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a._id} style={{ background: (a.status || a.bookingStatus) === 'cancelled' ? 'rgba(231,76,60,0.05)' : (a.status || a.bookingStatus) === 'confirmed' ? 'rgba(46,204,113,0.05)' : 'transparent' }}>
                            <td className="admin__ref">{a.bookingReference}</td>
                            <td>
                              <p style={{ fontWeight: 600, color: '#fff' }}>{a.userId?.name || a.guestName || '—'}</p>
                              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{a.userId?.email || a.guestEmail || ''}</p>
                            </td>
                            <td>{a.serviceId?.serviceName || a.service?.name || '—'}</td>
                            <td>
                              <p style={{ color: '#fff' }}>{(a.appointmentDate || a.bookingDate) ? new Date(a.appointmentDate || a.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{a.startTime || a.bookingTime || ''}</p>
                            </td>
                            <td style={{ color: '#eeadca', fontWeight: 600 }}>₹{a.amount?.toLocaleString('en-IN') || '0'}</td>
                            <td>
                              <select className="admin__status-select" value={a.bookingStatus || a.status || 'pending'} onChange={(e) => updateStatus(a._id, e.target.value)}>
                                {statusOptions.map((s) => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                {(a.status || a.bookingStatus) !== 'confirmed' && (a.status || a.bookingStatus) !== 'cancelled' && (
                                  <button className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" onClick={() => updateStatus(a._id, 'confirmed')} title="Confirm">
                                    <Check size={16} />
                                  </button>
                                )}
                                {(a.status || a.bookingStatus) !== 'cancelled' && (
                                  <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" onClick={() => updateStatus(a._id, 'cancelled')} title="Cancel">
                                    <X size={16} />
                                  </button>
                                )}
                                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => deleteAppointment(a._id)} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {appointments.length === 0 && (
                          <tr><td colSpan="7" className="text-center py-12 text-white/50">No bookings found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="admin__mobile-cards">
                    {appointments.length === 0 && (
                      <div className="text-center py-12 text-white/50" style={{ background: 'rgba(20,20,20,0.6)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>No bookings found</div>
                    )}
                    {appointments.map((a) => (
                      <div key={a._id} className="admin__mobile-card">
                        <div className="admin__mobile-card-row">
                          <div>
                            <div className="admin__mobile-card-label">Reference</div>
                            <div className="admin__mobile-card-value" style={{ color: '#eeadca', fontFamily: 'monospace' }}>{a.bookingReference}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`status-badge ${a.bookingStatus || a.status}`}>{a.bookingStatus || a.status}</span>
                          </div>
                        </div>
                        <div className="admin__mobile-card-row">
                          <div>
                            <div className="admin__mobile-card-label">Client</div>
                            <div className="admin__mobile-card-value">{a.userId?.name || a.guestName || '—'}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a.userId?.email || a.guestEmail || ''}</div>
                          </div>
                        </div>
                        <div className="admin__mobile-card-row">
                          <div>
                            <div className="admin__mobile-card-label">Service</div>
                            <div className="admin__mobile-card-value">{a.serviceId?.serviceName || a.service?.name || '—'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="admin__mobile-card-label">Amount</div>
                            <div className="admin__mobile-card-value" style={{ color: '#eeadca' }}>₹{a.amount?.toLocaleString('en-IN') || '0'}</div>
                          </div>
                        </div>
                        <div className="admin__mobile-card-row">
                          <div>
                            <div className="admin__mobile-card-label">Date & Time</div>
                            <div className="admin__mobile-card-value">
                              {(a.appointmentDate || a.bookingDate) ? new Date(a.appointmentDate || a.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} • {a.startTime || a.bookingTime || ''}
                            </div>
                          </div>
                        </div>
                        <div className="admin__mobile-card-actions">
                          <select className="admin__status-select" style={{ flex: 1 }} value={a.bookingStatus || a.status || 'pending'} onChange={(e) => updateStatus(a._id, e.target.value)}>
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          {(a.status || a.bookingStatus) !== 'confirmed' && (a.status || a.bookingStatus) !== 'cancelled' && (
                            <button className="p-2 rounded-lg bg-green-500/10 text-green-500" onClick={() => updateStatus(a._id, 'confirmed')}><Check size={16} /></button>
                          )}
                          {(a.status || a.bookingStatus) !== 'cancelled' && (
                            <button className="p-2 rounded-lg bg-red-500/10 text-red-500" onClick={() => updateStatus(a._id, 'cancelled')}><X size={16} /></button>
                          )}
                          <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-red-500" onClick={() => deleteAppointment(a._id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Services Tab */}
          {activeTab === 'Services' && (
            <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin__toolbar">
                <button className="btn btn-primary bg-gold text-black px-6 py-2 rounded-lg font-semibold flex items-center gap-2" onClick={() => setShowServiceForm(!showServiceForm)}>
                  {showServiceForm ? <X size={16} /> : <Plus size={16} />} {showServiceForm ? 'Cancel' : 'Add New Service'}
                </button>
              </div>

              {showServiceForm && (
                <div className="admin__table-wrapper mb-8 p-6">
                  <h3 className="text-lg font-serif text-white mb-6">Create Service</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label>Service Name</label>
                      <input type="text" className="form-input" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. Keratin Spa" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-select" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                        <option>Hair</option>
                        <option>Skincare</option>
                        <option>Bridal</option>
                        <option>Massage</option>
                        <option>Nails</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input type="number" className="form-input" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Duration (mins)</label>
                      <input type="number" className="form-input" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label>Description</label>
                      <input type="text" className="form-input" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                    </div>
                  </div>
                  <button className="mt-6 px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-pink-100 transition-colors" onClick={handleServiceSubmit} disabled={uploading || !newService.name}>
                    {uploading ? 'Saving...' : 'Save Service'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(s => (
                  <div key={s._id} className="admin__stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div className="flex justify-between w-full">
                      <span className="status-badge confirmed">{s.category}</span>
                      <div className="flex gap-2">
                        <button className="text-white/30 hover:text-red-500 transition-colors" onClick={() => deleteService(s._id)}><Trash2 size={16}/></button>
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <h4 className="text-lg font-bold text-white mb-1">{s.name}</h4>
                      <p className="text-white/50 text-sm mb-4 line-clamp-2">{s.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70"><Clock size={14} className="inline mr-1" />{s.duration}m</span>
                        <span className="text-gold font-bold text-lg">₹{s.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'Reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin__table-wrapper">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Status</th>
                      <th>Feature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <p style={{ fontWeight: 600, color: '#fff' }}>{r.user?.name || r.guestName}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{r.user?.email || r.guestEmail}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Service: <span style={{ color: '#eeadca' }}>{r.service?.name || 'N/A'}</span></p>
                        </td>
                        <td style={{ color: '#f1c40f' }}>{'★'.repeat(r.rating)}</td>
                        <td style={{ maxWidth: 300, fontSize: 13, lineHeight: 1.5 }}>{r.comment}</td>
                        <td>
                          <button
                            className={`status-badge ${r.isApproved ? 'confirmed' : 'pending'}`}
                            onClick={() => updateReview(r._id, { isApproved: !r.isApproved })}
                          >
                            {r.isApproved ? 'Approved' : 'Pending Approval'}
                          </button>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className={`p-2 rounded-full ${r.isFeatured ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-white/30 hover:bg-amber-500/10 hover:text-amber-500'}`}
                              onClick={() => updateReview(r._id, { isFeatured: !r.isFeatured })}
                              title={r.isFeatured ? "Unfeature" : "Feature on Home Page"}
                            >
                              <Star size={16} fill={r.isFeatured ? "currentColor" : "none"} />
                            </button>
                            <button
                              className="p-2 rounded-full bg-white/5 text-white/30 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              onClick={() => deleteReview(r._id)}
                              title="Delete Review"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-12 text-white/50">No customer reviews yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'Gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="admin__table-wrapper mb-8" style={{ padding: 32 }}>
                <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2"><ImageIcon size={20}/> Upload to Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-input" value={newGalleryPhoto.title} onChange={e => setNewGalleryPhoto({...newGalleryPhoto, title: e.target.value})} placeholder="E.g. Bridal Glam" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-select" value={newGalleryPhoto.category} onChange={e => setNewGalleryPhoto({...newGalleryPhoto, category: e.target.value})}>
                      <option>Hair</option>
                      <option>Bridal</option>
                      <option>Skincare</option>
                      <option>Nails</option>
                      <option>Makeup</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>High-Res Photo</label>
                    <input type="file" className="form-input" style={{ padding: '9px 16px' }} accept="image/*" onChange={e => setNewGalleryPhoto({...newGalleryPhoto, image: e.target.files[0]})} />
                  </div>
                  <button 
                    className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-pink-100 transition-colors w-full"
                    disabled={uploading || !newGalleryPhoto.title || !newGalleryPhoto.image}
                    onClick={async () => {
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('title', newGalleryPhoto.title);
                      formData.append('category', newGalleryPhoto.category);
                      formData.append('image', newGalleryPhoto.image);
                      try {
                        const res = await API.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
                        setGallery([res.data.item, ...gallery]);
                        setNewGalleryPhoto({ title: '', category: 'Hair', image: null });
                        toast.success('Photo added to gallery!');
                        fetchStats();
                      } catch(err) {
                        toast.error('Failed to upload photo');
                      }
                      setUploading(false);
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Now'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.map(item => (
                  <div key={item._id} className="relative group rounded-xl overflow-hidden aspect-square bg-white/5 border border-white/10">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white font-bold truncate">{item.title}</p>
                      <p className="text-pink-200 text-xs uppercase tracking-wider">{item.category}</p>
                      <button 
                        className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        onClick={async () => {
                          if (window.confirm('Delete this photo?')) {
                            try {
                              await API.delete(`/gallery/${item._id}`);
                              setGallery(gallery.filter(g => g._id !== item._id));
                              toast.success('Deleted photo');
                            } catch(err) {
                              toast.error('Delete failed');
                            }
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
