import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose, services }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    serviceId: '',
    rating: 5,
    title: '',
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (!formData.comment) {
      toast.error('Please write a review message');
      return;
    }
    if (!user && (!formData.guestName || !formData.guestEmail)) {
      toast.error('Please provide your name and email');
      return;
    }

    setLoading(true);
    try {
      await API.post('/reviews', formData);
      toast.success('Thank you! Your review has been submitted for approval.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-serif text-white mb-2">Share Your Experience</h2>
            <p className="text-white/50 mb-8">Your feedback helps us perfect our craft.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      placeholder="Jane Doe"
                      value={formData.guestName}
                      onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      placeholder="jane@example.com"
                      value={formData.guestEmail}
                      onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Service Experience</label>
                <select
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
                  value={formData.serviceId}
                  onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Select a service...</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`transition-colors ${star <= formData.rating ? 'text-gold' : 'text-white/20'}`}
                    >
                      <Star size={32} fill={star <= formData.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Review Title</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  placeholder="e.g. Absolutely stunning!"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Your Message</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors resize-none h-32"
                  placeholder="Tell us about your experience..."
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-300 to-amber-200 text-black font-semibold py-4 rounded-lg hover:from-pink-400 hover:to-amber-300 transition-all disabled:opacity-50 text-lg"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
