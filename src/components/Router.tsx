import React, { useState, useEffect } from 'react';

interface RouterProps {
  children: React.ReactNode;
}

export interface RouteProps {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

// Simple router context
export const RouterContext = React.createContext({
  currentPath: '/',
  navigate: (path: string) => {},
});

export function Router({ children }: RouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Route({ path, component: Component, exact = false }: RouteProps) {
  const { currentPath } = React.useContext(RouterContext);
  
  const isMatch = exact 
    ? currentPath === path 
    : currentPath.startsWith(path);

  if (!isMatch) return null;

  return <Component />;
}

export function useRouter() {
  return React.useContext(RouterContext);
}