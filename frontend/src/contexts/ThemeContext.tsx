import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextProps {
  songColor: string;
  setSongColor: (color: string) => void;
  getColorRgb: () => { r: number; g: number; b: number };
  getLighterColor: (opacity?: number) => string;
  getDarkerColor: (percentage?: number) => string;
}

const defaultContext: ThemeContextProps = {
  songColor: '4f46e5', // Default purple color
  setSongColor: () => {},
  getColorRgb: () => ({ r: 79, g: 70, b: 229 }), // Default purple in RGB
  getLighterColor: () => 'rgba(79, 70, 229, 0.2)',
  getDarkerColor: () => '#3b35b1',
};

const ThemeContext = createContext<ThemeContextProps>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [songColor, setSongColor] = useState<string>(defaultContext.songColor);

  // Convert hex to RGB
  const getColorRgb = () => {
    // Handle hex with or without '#'
    const hex = songColor.charAt(0) === '#' ? songColor.substring(1) : songColor;

    // Parse hex string
    const bigint = parseInt(hex, 16);

    // Extract RGB components
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  };

  // Get a lighter version of the color
  const getLighterColor = (opacity = 0.2) => {
    const { r, g, b } = getColorRgb();
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Get a darker version of the color
  const getDarkerColor = (percentage = 30) => {
    const { r, g, b } = getColorRgb();
    const darken = (1 - percentage / 100);
    const rd = Math.floor(r * darken);
    const gd = Math.floor(g * darken);
    const bd = Math.floor(b * darken);

    return `#${rd.toString(16).padStart(2, '0')}${gd.toString(16).padStart(2, '0')}${bd.toString(16).padStart(2, '0')}`;
  };

  return (
    <ThemeContext.Provider
      value={{
        songColor,
        setSongColor,
        getColorRgb,
        getLighterColor,
        getDarkerColor
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};