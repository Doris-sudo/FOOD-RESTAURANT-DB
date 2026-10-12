'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/',       label: 'Home'   },
  { href: '/menu',   label: 'Menu'   },
  { href: '/orders', label: 'Orders' },
];

export default function Navbar() {
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [open,          setOpen]   = useState(false);
  const [dropdownOpen,  setDropdown] = useState(false);

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
    setOpen(false);
    setDropdown(false);
    router.push('/');
  }

  // First letter avatar
  const avatar = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.logoName}>Maison Laurel</span>
          <span className={styles.logoTagline}>Fine Dining</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Nav links */}
        <div className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${isActive(href) ? styles.linkActive : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Admin link — only for admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`${styles.link} ${styles.adminLink} ${isActive('/admin') ? styles.linkActive : ''}`}
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          {/* Auth section */}
          {user ? (
            /* Logged-in user dropdown */
            <div className={styles.userMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdown((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="Account menu"
              >
                <span className={styles.avatar}>{avatar}</span>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <span className={styles.chevron} aria-hidden="true">▾</span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                    <span className={`badge badge-${user.role === 'admin' ? 'confirmed' : user.role === 'staff' ? 'preparing' : 'pending'}`} style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>
                      {user.role}
                    </span>
                  </div>
                  <hr className={styles.dropdownDivider} />
                  <button
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Click-outside overlay */}
              {dropdownOpen && (
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                  onClick={() => setDropdown(false)}
                  aria-hidden="true"
                />
              )}
            </div>
          ) : (
            /* Logged-out: login + signup */
            <div className={styles.authLinks}>
              <Link
                href="/login"
                className={`${styles.link} ${isActive('/login') ? styles.linkActive : ''}`}
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`${styles.link} ${styles.signupBtn}`}
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
