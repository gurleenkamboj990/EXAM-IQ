import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyThemeToDocument = (isDark) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const getSystemPrefersDark = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      isDark: false,

      initTheme: () => {
        const { theme } = get();
        let shouldBeDark = false;
        if (theme === 'dark') {
          shouldBeDark = true;
        } else if (theme === 'light') {
          shouldBeDark = false;
        } else {
          shouldBeDark = getSystemPrefersDark();
        }
        applyThemeToDocument(shouldBeDark);
        set({ isDark: shouldBeDark });

        // Listen for system changes if system theme is selected
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const listener = (e) => {
            if (get().theme === 'system') {
              applyThemeToDocument(e.matches);
              set({ isDark: e.matches });
            }
          };
          mediaQuery.addEventListener('change', listener);
        }
      },

      setTheme: (newTheme) => {
        let shouldBeDark = false;
        if (newTheme === 'dark') {
          shouldBeDark = true;
        } else if (newTheme === 'light') {
          shouldBeDark = false;
        } else {
          shouldBeDark = getSystemPrefersDark();
        }
        applyThemeToDocument(shouldBeDark);
        set({ theme: newTheme, isDark: shouldBeDark });
      },

      toggleTheme: () => {
        const currentIsDark = get().isDark;
        const nextIsDark = !currentIsDark;
        const nextTheme = nextIsDark ? 'dark' : 'light';
        applyThemeToDocument(nextIsDark);
        set({ theme: nextTheme, isDark: nextIsDark });
      },
    }),
    {
      name: 'examiq-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

