import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const NotFound = () => {
  const AlertTriangleIcon = getIcon('AlertTriangle');
  const HomeIcon = getIcon('Home');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-primary mb-6"
      >
        <AlertTriangleIcon className="w-20 h-20 md:w-24 md:h-24" />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center text-surface-800 dark:text-surface-100"
      >
        404 - Page Not Found
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg text-center mb-8 text-surface-600 dark:text-surface-300 max-w-md"
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link 
          to="/" 
          className="btn btn-primary flex items-center gap-2 group transition-all duration-300 px-6 py-3"
        >
          <HomeIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
          <span>Return Home</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="mt-16 text-surface-500 dark:text-surface-400 text-sm md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>Need help? <a href="#" className="text-primary hover:underline">Contact Support</a></p>
      </motion.div>
    </div>
  );
};

export default NotFound;