import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Routes from '../routes/Routes';
import { ModalComponent } from './Modal/modal.component';
import { ModalProvider } from './Modal/modal.provider';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { applyTheme, getStoredThemeMode, getSystemTheme, persistThemeMode, resolveTheme } from '../utils/theme';
import type { ThemeMode } from '../utils/theme';

export default function App(): JSX.Element {
  console.log('APP');
  const isFetching = useAppSelector(state => state.app.isFetching);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(resolveTheme(getStoredThemeMode(), getSystemTheme()));

  useEffect(() => {
    const mode = getStoredThemeMode();
    const systemTheme = getSystemTheme();
    const nextTheme = resolveTheme(mode, systemTheme);
    setThemeMode(mode);
    setResolvedTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const handleThemeChange = (mode: ThemeMode) => {
    const nextTheme = resolveTheme(mode, getSystemTheme());
    persistThemeMode(mode);
    setThemeMode(mode);
    setResolvedTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const themeLabel = useMemo(() => {
    if (themeMode === 'dark') return 'Oscuro';
    if (themeMode === 'light') return 'Claro';
    return 'Sistema';
  }, [themeMode]);

  return (
    <div className='app-container mx-auto'>
        <ModalProvider>
          <ModalComponent />
          <HashRouter>
            <Routes themeMode={themeMode} resolvedTheme={resolvedTheme} onThemeChange={handleThemeChange} />
          </HashRouter>
          <footer className='page-footer fixed-bottom text-center'>
            {isFetching ?
              <div className='float-right'>
                <span
                  className='spinner-grow'
                  role='status'
                  style={{
                    height: '15vh',
                    width: '15vh'
                  }}
                >
                </span>
              </div>
              : null}
          </footer>
        </ModalProvider>
    </div>
  );
}
