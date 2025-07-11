import { useNavigate, useLocation } from 'react-router-dom';

interface HistoryLocation {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

interface HistoryObject {
  push: (path: string) => void;
  replace: (path: string) => void;
  goBack: () => void;
  location: HistoryLocation;
}

/**
 * Hook personalizado para mantener compatibilidad con la API de history de React Router v5
 * mientras usamos React Router v6
 */
export const useHistory = (): HistoryObject => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    goBack: () => navigate(-1),
    location: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      key: location.key || ''
    }
  };
};
