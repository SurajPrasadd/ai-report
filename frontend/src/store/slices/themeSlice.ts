import { createSlice } from '@reduxjs/toolkit';

interface ThemeState { isDark: boolean; }
const saved = localStorage.getItem('theme');
const initialState: ThemeState = { isDark: saved === 'dark' };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: s => {
      s.isDark = !s.isDark;
      localStorage.setItem('theme', s.isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', s.isDark ? 'dark' : 'light');
    },
    setDark: (s, a) => {
      s.isDark = a.payload;
      document.documentElement.setAttribute('data-theme', a.payload ? 'dark' : 'light');
    },
  },
});

export const { toggleTheme, setDark } = themeSlice.actions;
export default themeSlice.reducer;
