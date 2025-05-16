import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';

function Signup() {
  const { isInitialized } = useContext(AuthContext);

  useEffect(() => {
    if (isInitialized) {
      // Show signup UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showSignup("#authentication");
    }
  }, [isInitialized]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <motion.div 
        className="w-full max-w-md space-y-8 p-6 bg-white dark:bg-surface-800 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-surface-800 dark:text-surface-100">Join TaskFlow</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Create your account to get started</p>
        </div>

        <div id="authentication" className="min-h-[400px]" />

        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>

          <div className="mt-4">
            <Link to="/" className="text-sm text-primary hover:text-primary-dark">
              Continue as guest
            </Link>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              (Limited functionality available without an account)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;