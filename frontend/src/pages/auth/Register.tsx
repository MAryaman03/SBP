import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Scissors, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { SignUpForm } from '../../types/index';
import '../Auth.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Register() {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>({
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: SignUpForm) => {
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp(data);
      toast.success(`Welcome ${res.user.name}! Your account has been created. 🎉`, {
        duration: 3,
        icon: '🎊',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = {
    weak: password.length > 0 && password.length < 8,
    medium: password.length >= 8 && password.length < 12,
    strong: password.length >= 12,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 pt-[120px] pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl relative z-10 mx-4"
      >
        <div className="text-center mb-8">
          <Scissors size={32} className="text-pink-400 mx-auto mb-4" />
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join Snigdha Beauty Parlour to book your first appointment</p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          variants={containerVariants}
        >
          {/* Full Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 border transition-all focus:outline-none ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-600 focus:border-gold focus:ring-2 focus:ring-gold/20'
                } text-white placeholder-gray-500`}
                placeholder="John Doe"
              />
              {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>}
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                })}
                type="email"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 border transition-all focus:outline-none ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-600 focus:border-gold focus:ring-2 focus:ring-gold/20'
                } text-white placeholder-gray-500`}
                placeholder="you@example.com"
              />
              {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>}
            </div>
          </motion.div>

          {/* Phone */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                {...register('phone', {
                  pattern: { value: /^[0-9+\-\s()]{7,25}$/, message: 'Invalid phone' },
                })}
                type="tel"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:border-gold focus:ring-2 focus:ring-gold/20 text-white placeholder-gray-500 transition-all focus:outline-none"
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone && <span className="text-red-400 text-xs mt-1 block">{errors.phone.message}</span>}
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-2.5 rounded-lg bg-gray-700 border transition-all focus:outline-none ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-600 focus:border-gold focus:ring-2 focus:ring-gold/20'
                } text-white placeholder-gray-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>}
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      (i === 0 && (passwordStrength.weak || passwordStrength.medium || passwordStrength.strong)) ||
                      (i === 1 && (passwordStrength.medium || passwordStrength.strong)) ||
                      (i === 2 && passwordStrength.strong)
                        ? 'bg-gold'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-2.5 rounded-lg bg-gray-700 border transition-all focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-600 focus:border-gold focus:ring-2 focus:ring-gold/20'
                } text-white placeholder-gray-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirmPassword && (
                <span className="text-red-400 text-xs mt-1 block">{errors.confirmPassword.message}</span>
              )}
            </div>
          </motion.div>

          {/* Terms & Conditions */}
          <motion.div variants={itemVariants} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 accent-gold cursor-pointer"
            />
            <label className="text-sm text-gray-400">
              I agree to the{' '}
              <Link to="#" className="text-gold hover:text-amber-400">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-gold hover:text-amber-400">
                Privacy Policy
              </Link>
            </label>
          </motion.div>

          {/* Sign Up Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading || !agreedToTerms}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-amber-500 text-black font-semibold hover:shadow-lg hover:shadow-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </motion.button>

          {/* Sign In Link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-gold hover:text-amber-400 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </main>
  );
}
