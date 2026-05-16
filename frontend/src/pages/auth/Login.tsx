import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Scissors, Mail, Lock } from 'lucide-react';
import { LoginForm } from '../../types/index';
import '../Auth.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await signIn(data);
      toast.success(`Welcome back, ${res.user.name?.split(' ')[0]}! ✨`, {
        duration: 3000,
        icon: '👋',
      });
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      // Show the real server error (wrong password, user not found, etc.)
      const errorMessage =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Server is waking up — please wait 30 seconds and try again.' : null) ||
        (err.message === 'Network Error' ? 'Cannot reach server. Is the backend deployed?' : null) ||
        err.message ||
        'Sign in failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to Snigdha Beauty Parlour to continue</p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          variants={containerVariants}
        >
          {/* Email Field */}
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
              {errors.email && <span className="text-red-400 text-sm mt-1 block">{errors.email.message}</span>}
            </div>
          </motion.div>

          {/* Password Field */}
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
              {errors.password && <span className="text-red-400 text-sm mt-1 block">{errors.password.message}</span>}
            </div>
          </motion.div>

          {/* Sign In Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-amber-500 text-black font-semibold hover:shadow-lg hover:shadow-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">Or continue with</span>
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:text-amber-400 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.form>

        {/* Features */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: '✓', label: 'Secure' },
            { icon: '⚡', label: 'Fast' },
            { icon: '🔒', label: 'Private' },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{feature.icon}</div>
              <p className="text-gray-500 text-sm">{feature.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
