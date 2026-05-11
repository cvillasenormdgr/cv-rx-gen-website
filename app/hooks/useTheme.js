'use client';

import { useContext } from 'react';

import { ThemeContext } from '@/app/lib/theme/themeContext';

const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return value;
};

export default useTheme;
