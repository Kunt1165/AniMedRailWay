import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import logo from '../assets/logo.png';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Дашборд' },
  { to: '/pets', icon: '🐾', label: 'Мої улюбленці' },
  { to: '/calendar', icon: '📅', label: 'Календар' },
  { to: '/reminders', icon: '🔔', label: 'Нагадування' },
  { to: '/diary', icon: '📓', label: 'Щоденник' },
  { to: '/articles', icon: '📰', label: 'Статті' },
  { to: '/nearby', icon: '🗺️', label: 'Поряд' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">

      {/* LOGO BLOCK */}
      <div className="sidebar-logo-block">
        <img src={logo} alt="AniMed logo" className="sidebar-logo-img" />
        <div className="sidebar-logo-text">AniMed</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Вийти"
        >
          ⬅️
        </button>
      </div>
    </aside>
  );
}