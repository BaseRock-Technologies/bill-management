import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, ClipboardList, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/billing', icon: Receipt, label: 'Billing' },
    { path: '/bill-history', icon: ClipboardList, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1e3a8a] text-white md:hidden"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-[#1e3a8a] text-white overflow-y-auto transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-64 md:shadow-lg
      `}>
        <div className="flex items-center justify-center h-16 mt-2">
          <Package className="w-8 h-8" />
          <span className="ml-2 text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="mt-8 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center p-3 mb-2 rounded-lg w-full hover:bg-white/5 text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}