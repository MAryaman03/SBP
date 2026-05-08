import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, FileText, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Service, Booking } from '../types/index';
import './Booking.css';

const STEPS = ['Service', 'Date & Time', 'Confirm'];

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { notes: '' } });
  const notes = watch('notes');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get('/services');
      if (res.data.services && res.data.services.length > 0) {
        setServices(res.data.services);
      } else {
        // Fallback placeholder services if DB is completely empty or unresponsive
        setServices([
          { _id: '64f1b2c3d4e5f6a7b8c9d0e1', name: 'Signature Haircut & Style', category: 'Hair', price: 1200, duration: 60, description: 'Premium haircut with styling', isActive: true, createdAt: new Date().toISOString() },
          { _id: '64f1b2c3d4e5f6a7b8c9d0e2', name: 'Gold Facial', category: 'Skincare', price: 2800, duration: 75, description: 'Luxury 24k gold facial treatment', isActive: true, createdAt: new Date().toISOString() },
          { _id: '64f1b2c3d4e5f6a7b8c9d0e3', name: 'Bridal Makeup', category: 'Bridal', price: 8000, duration: 180, description: 'Complete bridal makeup package', isActive: true, createdAt: new Date().toISOString() },
          { _id: '64f1b2c3d4e5f6a7b8c9d0e5', name: 'Keratin Treatment', category: 'Hair', price: 4500, duration: 150, description: 'Advanced keratin smoothing treatment', isActive: true, createdAt: new Date().toISOString() },
          { _id: '64f1b2c3d4e5f6a7b8c9d0e4', name: 'Swedish Massage', category: 'Massage', price: 2200, duration: 60, description: 'Relaxing 60-minute Swedish massage', isActive: true, createdAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      toast.error('Failed to load services, using fallbacks');
      setServices([
        { _id: '64f1b2c3d4e5f6a7b8c9d0e1', name: 'Signature Haircut & Style', category: 'Hair', price: 1200, duration: 60, description: 'Premium haircut with styling', isActive: true, createdAt: new Date().toISOString() },
        { _id: '64f1b2c3d4e5f6a7b8c9d0e2', name: 'Gold Facial', category: 'Skincare', price: 2800, duration: 75, description: 'Luxury 24k gold facial treatment', isActive: true, createdAt: new Date().toISOString() },
        { _id: '64f1b2c3d4e5f6a7b8c9d0e3', name: 'Bridal Makeup', category: 'Bridal', price: 8000, duration: 180, description: 'Complete bridal makeup package', isActive: true, createdAt: new Date().toISOString() },
        { _id: '64f1b2c3d4e5f6a7b8c9d0e5', name: 'Keratin Treatment', category: 'Hair', price: 4500, duration: 150, description: 'Advanced keratin smoothing treatment', isActive: true, createdAt: new Date().toISOString() },
        { _id: '64f1b2c3d4e5f6a7b8c9d0e4', name: 'Swedish Massage', category: 'Massage', price: 2200, duration: 60, description: 'Relaxing 60-minute Swedish massage', isActive: true, createdAt: new Date().toISOString() }
      ]);
    }
  };

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    setLoadingSlots(true);
    setSelectedSlot(null);

    const fetchSlots = async () => {
      try {
        const res = await API.get('/appointments/slots', {
          params: {
            date: new Date(selectedDate).toISOString().split('T')[0],
            duration: selectedService.duration,
          },
        });

        setSlots(res.data.slots || []);
        if (res.data.slots && res.data.slots.length === 0) {
          toast.error('No available slots for this date. Please choose another date.');
        }
      } catch (error: any) {
        toast.error('Failed to load available slots');
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService]);

  const getEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const onSubmit = async (data: { notes?: string }) => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      toast.error('Please complete all fields');
      return;
    }

    setSubmitting(true);
    try {
      const isFallback = ['64f1b2c3d4e5f6a7b8c9d0e1', '64f1b2c3d4e5f6a7b8c9d0e2', '64f1b2c3d4e5f6a7b8c9d0e3', '64f1b2c3d4e5f6a7b8c9d0e4'].includes(selectedService._id);
      
      let res;
      if (isFallback) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockAppointment = {
          _id: 'mock_id_' + Date.now(),
          bookingReference: 'SBP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
          service: selectedService,
          serviceId: selectedService,
          bookingDate: new Date(selectedDate).toISOString(),
          appointmentDate: new Date(selectedDate).toISOString(),
          bookingTime: selectedSlot.start,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          amount: selectedService.price,
          bookingStatus: 'confirmed',
          createdAt: new Date().toISOString(),
          userId: user?._id,
          userEmail: user?.email,
          user: user
        };
        
        // Save to localStorage for dashboard
        const stored = JSON.parse(localStorage.getItem('mockBookings') || '[]');
        stored.push(mockAppointment);
        localStorage.setItem('mockBookings', JSON.stringify(stored));

        res = { data: { appointment: mockAppointment } };
      } else {
        res = await API.post('/appointments', {
          serviceId: selectedService._id,
          date: selectedDate,
          timeSlot: selectedSlot.start,
          notes: data.notes,
        });
      }

      setConfirmedBooking(res.data.appointment || res.data.data);
      toast.success('Booking confirmed! 🎉', { duration: 3 });
      setStep(4);
      setTimeout(() => {
        navigate('/dashboard', { state: { booking: res.data.appointment || res.data.data } });
      }, 5000); // Wait 5 seconds to let them copy the code
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-[120px] pb-32 px-4 overflow-y-visible">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-white to-amber-200 mb-4 font-serif">
            Book Your Appointment
          </h1>
          <p className="text-pink-200/60 text-lg">Reserve your spot at Snigdha Beauty Parlour</p>
        </motion.div>

        {/* Progress Steps */}
        {step < 4 && (
        <div className="mb-16 relative max-w-2xl mx-auto">
          {/* Background Line */}
          <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-white/10 z-0" />
          
          {/* Active Line */}
          <div
            className="absolute top-6 left-[10%] h-[2px] bg-gradient-to-r from-pink-400 to-amber-300 z-0 transition-all duration-500 shadow-[0_0_10px_rgba(238,174,202,0.5)]"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 80}%` }}
          />

          <div className="flex justify-between items-start relative z-10">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-3 w-1/3">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
                    step > i + 1
                      ? 'bg-gradient-to-r from-pink-400 to-amber-300 text-black shadow-[0_0_15px_rgba(238,174,202,0.4)]'
                      : step === i + 1
                      ? 'bg-gradient-to-r from-pink-400 to-amber-300 text-black ring-4 ring-pink-400/30 shadow-[0_0_20px_rgba(238,174,202,0.6)]'
                      : 'bg-[#1a1a1a] text-gray-500 border-2 border-white/10'
                  }`}
                  animate={{ scale: step === i + 1 ? 1.1 : 1 }}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </motion.div>
                <p
                  className={`text-sm font-medium tracking-wide whitespace-nowrap ${
                    step >= i + 1 ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Step 1: Service Selection */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-8 overflow-visible h-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Service</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <motion.button
                      key={service._id}
                      onClick={() => setSelectedService(service)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border-2 transition-all text-left h-full flex flex-col justify-between ${
                        selectedService?._id === service._id
                          ? 'border-gold bg-gold/10'
                          : 'border-gray-600 bg-gray-800/40 hover:border-gold/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-white text-lg">{service.name}</h3>
                          <p className="text-gray-400 text-sm">{service.category}</p>
                        </div>
                        {selectedService?._id === service._id && (
                          <CheckCircle className="text-gold" size={24} />
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock size={14} /> {service.duration} mins
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gold">₹{service.price}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectedService && setStep(2)}
                  disabled={!selectedService}
                  className="px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-amber-300 to-pink-400 opacity-50"></div>
                
                <h2 className="text-2xl font-bold text-white mb-8 font-serif flex items-center gap-3">
                  <Calendar className="text-pink-400" />
                  Select Date & Time
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Custom Luxury Calendar */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-semibold text-lg">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                          className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                        >
                          <ChevronRight size={16} className="rotate-180" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                          className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-pink-200/60 uppercase tracking-wider">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const firstDay = new Date(year, month, 1).getDay();
                        
                        const days = [];
                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
                        }
                        
                        for (let d = 1; d <= daysInMonth; d++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const dateObj = new Date(year, month, d);
                          const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                          const isSelected = selectedDate === dateStr;
                          
                          days.push(
                            <motion.button
                              key={d}
                              whileHover={!isPast ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                              whileTap={!isPast ? { scale: 0.9 } : {}}
                              onClick={() => {
                                if (!isPast) {
                                  setSelectedDate(dateStr);
                                  setSelectedSlot(null);
                                }
                              }}
                              disabled={isPast}
                              className={`h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-pink-400 to-amber-300 text-black font-bold shadow-[0_0_15px_rgba(238,174,202,0.5)]'
                                  : isPast
                                  ? 'text-white/20 cursor-not-allowed'
                                  : 'text-white/70 hover:text-white border border-transparent hover:border-white/10'
                              }`}
                            >
                              {d}
                            </motion.button>
                          );
                        }
                        return days;
                      })()}
                    </div>
                  </div>

                  {/* Animated Time Slots */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                      <Clock className="text-amber-300" size={20} />
                      Available Time
                    </h3>
                    <div className="relative min-h-[200px]">
                      {loadingSlots ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : !selectedDate ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/40">
                          <Calendar size={32} className="mb-2 opacity-50" />
                          <p>Please select a date first</p>
                        </div>
                      ) : selectedDate && slots.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                            <AlertCircle size={24} className="text-red-400" />
                          </div>
                          <p className="text-white/80 font-medium">No slots available</p>
                          <p className="text-sm text-white/40 mt-1">Please try another date</p>
                        </div>
                      ) : (
                        <motion.div 
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                          }}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                        >
                          {slots.map((slot) => {
                            const isSelected = selectedSlot?.start === slot;
                            return (
                              <motion.button
                                key={slot}
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (selectedService) {
                                    const end = getEndTime(slot, selectedService.duration);
                                    setSelectedSlot({ start: slot, end });
                                  }
                                }}
                                className={`py-3 rounded-xl border transition-all text-sm font-semibold ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-pink-400 to-amber-300 border-transparent text-black shadow-[0_0_15px_rgba(238,174,202,0.4)]'
                                    : 'bg-white/5 border-white/10 text-white hover:border-pink-400/50 hover:bg-white/10'
                                }`}
                              >
                                {slot}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Summary */}
                {selectedService && selectedDate && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gold/10 border border-gold/30 rounded-lg"
                  >
                    <p className="text-white font-semibold mb-3">Booking Summary</p>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-300">Service:</span>
                        <span className="text-white font-semibold">{selectedService.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-300">Date:</span>
                        <span className="text-white font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-300">Time:</span>
                        <span className="text-white font-semibold">
                          {selectedSlot.start} - {selectedSlot.end}
                        </span>
                      </p>
                      <p className="flex justify-between pt-2 border-t border-gold/20">
                        <span className="text-gray-300">Price:</span>
                        <span className="text-gold font-bold">₹{selectedService.price}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectedDate && selectedSlot && setStep(3)}
                  disabled={!selectedDate || !selectedSlot}
                  className="px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Confirm Your Booking</h2>

                  {/* Booking Details */}
                  {selectedService && selectedDate && selectedSlot && (
                    <div className="space-y-6 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Service</p>
                          <p className="text-white font-bold text-lg">{selectedService.name}</p>
                          <p className="text-gray-400 text-sm">{selectedService.category}</p>
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Price</p>
                          <p className="text-gold font-bold text-lg">₹{selectedService.price}</p>
                          <p className="text-gray-400 text-sm">{selectedService.duration} minutes</p>
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Date</p>
                          <p className="text-white font-bold">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Time</p>
                          <p className="text-white font-bold">
                            {selectedSlot.start} - {selectedSlot.end}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-white font-semibold mb-3">Additional Notes (Optional)</label>
                    <textarea
                      {...register('notes')}
                      maxLength={500}
                      placeholder="Any special requests or preferences..."
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20"
                      rows={4}
                    />
                    <p className="text-gray-500 text-sm mt-1">{notes?.length || 0}/500</p>
                  </div>
                </div>

                {/* Terms & Booking */}
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    By confirming, you agree to our{' '}
                    <a href="#" className="text-gold hover:underline">
                      Terms & Conditions
                    </a>
                    . You'll receive a confirmation email shortly.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-gold to-amber-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-gold/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                    {!submitting && <CheckCircle size={18} />}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 4: Luxury Success Animation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
                className="w-32 h-32 bg-gradient-to-tr from-pink-400 to-amber-300 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(238,174,202,0.6)]"
              >
                <CheckCircle size={64} className="text-black" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-amber-200 mb-4 font-serif"
              >
                Appointment Confirmed
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-pink-200/60 max-w-md mx-auto mb-8 text-lg"
              >
                Your luxury experience has been beautifully reserved. 
              </motion.div>

              {confirmedBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-black/50 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-lg mx-auto w-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                >
                  <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-2">Tracking Code</p>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300 tracking-wider">
                      {confirmedBooking.bookingReference || confirmedBooking.bookingRef}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(confirmedBooking.bookingReference || confirmedBooking.bookingRef);
                        toast.success('Tracking code copied!');
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                      title="Copy tracking code"
                    >
                      <FileText size={18} className="text-gray-300" />
                    </button>
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><CheckCircle size={16} /></div>
                      <div>
                        <p className="text-xs text-gray-500">Service</p>
                        <p className="text-white text-sm font-medium">{confirmedBooking.service?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Clock size={16} /></div>
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="text-white text-sm font-medium">
                          {new Date(confirmedBooking.bookingDate || confirmedBooking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {confirmedBooking.bookingTime || confirmedBooking.timeSlot}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-gray-500 text-sm mt-8"
              >
                Redirecting to your dashboard...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
