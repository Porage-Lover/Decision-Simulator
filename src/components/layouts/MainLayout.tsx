import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FolderOpen, 
  Settings, 
  Menu,
  LogOut,
  User,
  Moon,
  Sun,
  GitCompare,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRestartTour } from '@/components/common/OnboardingTour';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, dataTour: 'dashboard' },
  { name: 'New Simulation', href: '/create', icon: PlusCircle, dataTour: 'create-simulation' },
  { name: 'Saved Simulations', href: '/simulations', icon: FolderOpen, dataTour: 'saved-simulations' },
  { name: 'Compare', href: '/compare', icon: GitCompare, dataTour: 'compare' }
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const { restartTour } = useRestartTour();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col glass-strong">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary glow">
            <span className="text-xl font-bold text-white">DS</span>
          </div>
          <span className="gradient-text text-lg font-bold">Decision Simulator</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              data-tour={item.dataTour}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-lg'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              {item.name}
            </Link>
          );
        })}

        {profile?.role === 'admin' && (
          <Link
            to="/admin"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive('/admin')
                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-lg'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
          >
            <Settings className={`h-5 w-5 transition-transform ${isActive('/admin') ? 'scale-110' : 'group-hover:scale-110'}`} />
            Admin
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
              {profile?.username || user?.email || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/70">{profile?.role || 'user'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="border-sidebar-border bg-sidebar-background/50 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={restartTour}
            className="border-sidebar-border bg-sidebar-background/50 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Restart tour"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-sidebar-border bg-sidebar-background/50 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full gradient-mesh">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 lg:block">
        <div className="fixed h-screen w-64">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex w-full flex-col lg:hidden">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border glass-strong px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="glass">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-lg font-bold text-white">DS</span>
            </div>
            <span className="gradient-text text-lg font-semibold">Decision Simulator</span>
          </Link>
          <div className="w-10" />
        </header>
        <main className="flex-1">{children}</main>
      </div>

      {/* Desktop Main Content */}
      <main className="hidden flex-1 lg:block">{children}</main>
    </div>
  );
}

