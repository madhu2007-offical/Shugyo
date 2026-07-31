import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  GitFork, 
  BookOpen, 
  Terminal, 
  CheckSquare, 
  FileQuestion, 
  Award, 
  LogOut 
} from 'lucide-react';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const getUsername = (user) => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/roadmap', label: 'Roadmap', icon: <GitFork size={20} /> },
    { path: '/checklist', label: 'Checklist', icon: <CheckSquare size={20} /> },
    { path: '/sql-drills', label: 'SQL Drills', icon: <Terminal size={20} /> },
    { path: '/test-bank', label: 'Test Bank', icon: <FileQuestion size={20} /> },
    { path: '/resources', label: 'Resources', icon: <BookOpen size={20} /> },
    { path: '/trophies', label: 'Trophies', icon: <Award size={20} /> },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <Award size={28} className="logo-icon" />
            <span className="logo-text">SHUGYO</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {getInitials(user?.email)}
            </div>
            <div className="user-details">
              <span className="username" title={user?.email}>
                {getUsername(user)}
              </span>
              <span className="user-role">Disciple</span>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-block" 
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
export default Layout;
