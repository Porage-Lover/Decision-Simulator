import Home from './pages/Home';
import CreateSimulation from './pages/CreateSimulation';
import ViewResults from './pages/ViewResults';
import SavedSimulations from './pages/SavedSimulations';
import Compare from './pages/Compare';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'Create Simulation',
    path: '/create',
    element: <CreateSimulation />
  },
  {
    name: 'View Results',
    path: '/results/:id',
    element: <ViewResults />,
    visible: false
  },
  {
    name: 'Saved Simulations',
    path: '/simulations',
    element: <SavedSimulations />
  },
  {
    name: 'Compare',
    path: '/compare',
    element: <Compare />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    visible: false
  }
];

export default routes;
