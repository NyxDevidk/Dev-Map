import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: {
    background: string;
    surface: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
    hover: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = {
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#000000',
  primary: '#2196f3',
  secondary: '#e3f2fd',
  border: '#e0e0e0',
  hover: '#f0f0f0',
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  primary: '#64b5f6',
  secondary: '#1e1e1e',
  border: '#404040',
  hover: '#3d3d3d',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 