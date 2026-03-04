import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomThemeContext = createContext();

// Thèmes prédéfinis
const PRESET_THEMES = {
  default: {
    name: 'Défaut',
    colors: {
      primary: '#667eea',
      primaryDark: '#5568d3',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      bgPrimary: '#ffffff',
      bgSecondary: '#f5f5f5',
      textPrimary: '#333333',
      textMuted: '#999999',
      borderColor: '#ddd'
    }
  },
  dark: {
    name: 'Sombre',
    colors: {
      primary: '#667eea',
      primaryDark: '#5568d3',
      success: '#66bb6a',
      warning: '#ffa726',
      danger: '#ef5350',
      bgPrimary: '#1e1e1e',
      bgSecondary: '#2d2d2d',
      textPrimary: '#e0e0e0',
      textMuted: '#999999',
      borderColor: '#404040'
    }
  },
  ocean: {
    name: 'Océan',
    colors: {
      primary: '#0288d1',
      primaryDark: '#0277bd',
      success: '#26a69a',
      warning: '#ff9800',
      danger: '#ef5350',
      bgPrimary: '#ffffff',
      bgSecondary: '#e0f2f1',
      textPrimary: '#01579b',
      textMuted: '#9e9e9e',
      borderColor: '#80deea'
    }
  },
  forest: {
    name: 'Forêt',
    colors: {
      primary: '#2e7d32',
      primaryDark: '#27632a',
      success: '#388e3c',
      warning: '#f57c00',
      danger: '#d32f2f',
      bgPrimary: '#ffffff',
      bgSecondary: '#f1f8e9',
      textPrimary: '#1b5e20',
      textMuted: '#9e9e9e',
      borderColor: '#7cb342'
    }
  },
  sunset: {
    name: 'Coucher de soleil',
    colors: {
      primary: '#ff6f00',
      primaryDark: '#e65100',
      success: '#ff9100',
      warning: '#ff5f00',
      danger: '#d84315',
      bgPrimary: '#fff3e0',
      bgSecondary: '#ffe0b2',
      textPrimary: '#bf360c',
      textMuted: '#ff6f00',
      borderColor: '#ffb74d'
    }
  },
  purple: {
    name: 'Violet',
    colors: {
      primary: '#7e57c2',
      primaryDark: '#6a42c2',
      success: '#ab47bc',
      warning: '#ce93d8',
      danger: '#c2185b',
      bgPrimary: '#f3e5f5',
      bgSecondary: '#ede7f6',
      textPrimary: '#4527a0',
      textMuted: '#7e57c2',
      borderColor: '#b39ddb'
    }
  }
};

export const CustomThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved || 'default';
  });

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('customThemeColors');
    return saved ? JSON.parse(saved) : PRESET_THEMES.default.colors;
  });

  useEffect(() => {
    applyTheme(customColors);
  }, [customColors]);

  const applyTheme = (colors) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      // Convertir camelCase en kebab-case
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
  };

  const changeTheme = (themeName) => {
    if (PRESET_THEMES[themeName]) {
      setCurrentTheme(themeName);
      setCustomColors(PRESET_THEMES[themeName].colors);
      localStorage.setItem('selectedTheme', themeName);
    }
  };

  const updateColor = (colorKey, colorValue) => {
    const updated = { ...customColors, [colorKey]: colorValue };
    setCustomColors(updated);
    localStorage.setItem('customThemeColors', JSON.stringify(updated));
  };

  const resetToPreset = () => {
    const defaultColors = PRESET_THEMES.default.colors;
    setCustomColors(defaultColors);
    localStorage.setItem('customThemeColors', JSON.stringify(defaultColors));
  };

  const value = {
    currentTheme,
    customColors,
    changeTheme,
    updateColor,
    resetToPreset,
    presetThemes: PRESET_THEMES,
    availableThemes: Object.keys(PRESET_THEMES)
  };

  return (
    <CustomThemeContext.Provider value={value}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within CustomThemeProvider');
  }
  return context;
};
