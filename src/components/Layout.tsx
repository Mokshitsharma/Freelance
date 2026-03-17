import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Globe, User, LogOut, Home, Info, Calendar, Users, Heart, Phone, Shield, PhoneCall } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('members') || 'Members', path: '/members', icon: Users },
    { name: t('about'), path: '/about', icon: Info },
    { name: t('events'), path: '/events', icon: Calendar },
    { name: t('parichay'), path: '/parichay', icon: Users },
    { name: t('helpline'), path: '/helpline', icon: PhoneCall },
    { name: t('donate'), path: '/donate', icon: Heart },
    { name: t('contact'), path: '/contact', icon: Phone },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ name: t('admin'), path: '/admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-orange-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo/Title */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <span className="bg-white text-orange-600 rounded-full p-1">
                  <Users size={20} />
                </span>
                <span className="truncate max-w-[200px] sm:max-w-none">{t('app_name')}</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-orange-700 text-white"
                      : "text-orange-100 hover:bg-orange-500 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-orange-500 transition-colors flex items-center gap-1 text-sm font-medium"
                aria-label="Toggle Language"
              >
                <Globe size={20} />
                <span className="hidden sm:inline">{i18n.language === 'en' ? 'हिंदी' : 'EN'}</span>
              </button>

              <div className="hidden md:flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    <Link to="/profile" className="flex items-center gap-2 hover:text-orange-200 transition-colors">
                      <User size={20} />
                      <span className="text-sm font-medium">{userProfile?.name || t('profile')}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 text-sm font-medium hover:text-orange-200 transition-colors"
                    >
                      <LogOut size={20} />
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-white text-orange-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
                  >
                    {t('login')}
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md hover:bg-orange-500 focus:outline-none"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-orange-700 shadow-inner">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium",
                    location.pathname === item.path
                      ? "bg-orange-800 text-white"
                      : "text-orange-100 hover:bg-orange-600 hover:text-white"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-orange-600 pt-4 pb-2 mt-4">
                {currentUser ? (
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-orange-100 hover:bg-orange-600 hover:text-white"
                    >
                      <User size={20} />
                      {userProfile?.name || t('profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-orange-100 hover:bg-orange-600 hover:text-white text-left"
                    >
                      <LogOut size={20} />
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-white text-orange-700 px-4 py-3 rounded-md text-base font-bold shadow-sm"
                  >
                    <User size={20} />
                    {t('login')} / {t('register')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-orange-900 text-orange-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-bold text-white mb-2">{t('app_name')}</p>
          <p className="text-sm mb-4">{t('hero_subtitle')}</p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link>
            <Link to="/admin-login" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
          <p className="text-xs mt-8 opacity-60">
            &copy; {new Date().getFullYear()} {t('app_name')}. {t('all_rights_reserved')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
