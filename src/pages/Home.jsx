import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import { getIcon } from '../utils/iconUtils';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get icons as components
  const CheckListIcon = getIcon('CheckSquare');
  const OrganizeIcon = getIcon('Layout');
  const ProgressIcon = getIcon('BarChart2');
  
  // App features description
  const features = [
    {
      icon: CheckListIcon,
      title: "Task Creation",
      description: "Create and organize your tasks with priority levels and due dates."
    },
    {
      icon: OrganizeIcon,
      title: "Organization",
      description: "Categorize tasks with projects and tags for better workflow management."
    },
    {
      icon: ProgressIcon,
      title: "Progress Tracking",
      description: "Monitor your progress with visual indicators and completion statistics."
    }
  ];

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-surface-200 border-t-primary"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckListIcon className="h-7 w-7 md:h-8 md:w-8" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TaskFlow</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            {/* App Introduction */}
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <motion.h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-surface-800 dark:text-surface-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Manage Your Tasks Efficiently
              </motion.h2>
              <motion.p 
                className="text-lg text-surface-600 dark:text-surface-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                A simple, intuitive task management tool to boost your productivity
              </motion.p>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="card flex flex-col items-center text-center p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
                >
                  <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-surface-800 dark:text-surface-50">{feature.title}</h3>
                  <p className="text-surface-600 dark:text-surface-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Task Management Feature */}
            <MainFeature />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-100 dark:bg-surface-800 py-6">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-surface-600 dark:text-surface-400">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;