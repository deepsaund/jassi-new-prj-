import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { useNotifications } from './hooks/useNotifications';

function AppInit() {
  useNotifications();
  return null;
}

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <>
      {isAuthenticated && <AppInit />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
