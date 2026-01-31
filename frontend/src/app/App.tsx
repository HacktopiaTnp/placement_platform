import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Building2, Briefcase, Video, LayoutDashboard, Users, LogOut, Settings, User, Bell, Search } from 'lucide-react';
import Dashboard from '@/app/components/Dashboard';
import OpportunityDiscovery from '@/app/components/OpportunityDiscovery';
import RecruiterOutreach from '@/app/components/RecruiterOutreach';
import MockInterview from '@/app/components/MockInterview';
import Analytics from '@/app/components/Analytics';
import Auth from '@/app/components/Auth';
import Profile from '@/app/components/Profile';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

type View = 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics' | 'profile';

interface UserData {
  name: string;
  email: string;
  role: 'student' | 'coordinator';
  branch?: string;
  year?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications] = useState(7);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const { signOut } = useClerk();

  const navigation = [
    { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'opportunities' as View, name: 'Opportunities', icon: Briefcase },
    { id: 'recruiters' as View, name: 'Recruiters', icon: Building2 },
    { id: 'interview' as View, name: 'Mock Interview', icon: Video },
    { id: 'analytics' as View, name: 'Analytics', icon: Users },
  ];

  // Get dynamic search placeholder based on current view
  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Search opportunities...';
      case 'opportunities':
        return 'Search jobs by role, company, or skills...';
      case 'recruiters':
        return 'Search recruiters by name or company...';
      case 'interview':
        return 'Search interview sessions...';
      case 'analytics':
        return 'Search students or companies...';
      default:
        return 'Search...';
    }
  };

  // Enhanced setView to clear search when changing sections
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setGlobalSearchQuery(''); // Clear search when switching sections
  };

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={handleViewChange} userRole={user.role} userName={user.name} searchQuery={globalSearchQuery} />;
      case 'opportunities':
        return <OpportunityDiscovery userRole={user.role} searchQuery={globalSearchQuery} setView={handleViewChange} />;
      case 'recruiters':
        return <RecruiterOutreach userRole={user.role} searchQuery={globalSearchQuery} setView={handleViewChange} />;
      case 'interview':
        return <MockInterview userRole={user.role} searchQuery={globalSearchQuery} setView={handleViewChange} />;
      case 'analytics':
        return <Analytics userRole={user.role} searchQuery={globalSearchQuery} setView={handleViewChange} />;
      case 'profile':
        return <Profile user={user} onUpdate={setUser} />;
      default:
        return <Dashboard setView={handleViewChange} userRole={user.role} userName={user.name} />;
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="size-full flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white/98 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shadow-xl md:shadow-2xl">
        {/* Logo Section */}
        <div className="p-5 md:p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="size-11 md:size-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg pulse-animation">
              <Building2 className="size-5 md:size-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TnP AI Platform
              </h1>
              <p className="text-xs text-slate-600">Smart Placement System</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 rounded-xl transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-xl shadow-blue-500/40 scale-105'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                  }`}
                >
                  <Icon className="size-4 md:size-5" />
                  <span className="font-medium text-sm md:text-base">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats in Sidebar */}  
          <div className="hidden md:block pt-6 mt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
              Quick Stats
            </p>
            <div className="space-y-2 animate-fade-in">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all cursor-pointer card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-900 font-medium">Applications</span>
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-700">12</Badge>
                </div>
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-900 font-medium">Shortlisted</span>
                  <Badge className="bg-gradient-to-r from-green-600 to-green-700">5</Badge>
                </div>
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-900 font-medium">Interviews</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700">3</Badge>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-white/80 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <div className="size-11 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-xl ring-2 ring-white">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-600">
                    {user.role === 'student' ? `${user.branch} • ${user.year}` : 'Administrator'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewChange('profile')}>
                <User className="size-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-md">
          <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className={`absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 transition-colors ${
                  globalSearchQuery ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 pr-10 h-10 md:h-11 border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm md:text-base transition-all shadow-sm focus:shadow-md rounded-lg"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-100 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Clear search"
                  >
                    <svg className="size-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Notifications */}
              <button className="relative p-2 md:p-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-105">
                <Bell className="size-5 md:size-6 text-slate-600" />
                {notifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 size-4 md:size-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Badge */}
              <div className="hidden sm:block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-200/60 rounded-xl shadow-sm hover:shadow-md transition-all">
                <p className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.role === 'student' ? '🎓 Student' : '👔 Coordinator'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/30 via-blue-50/20 to-purple-50/20">
          <div>
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
