import * as Icons from 'lucide-react';

/**
 * Get icon component by name from lucide-react
 * @param {string} name - Icon name in PascalCase
 * @returns {React.Component} Icon component
 */
export const getIcon = (name) => {
  return Icons[name] || Icons.HelpCircle;
};