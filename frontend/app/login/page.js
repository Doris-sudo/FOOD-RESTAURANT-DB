'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiLogin } from '../../lib/auth';
import AlertMessage from '../../components/AlertMessage';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim())    return setError('Please enter your email.');
    if (!password)        return setError('Please enter your password.');

    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      login(res.token, res.user);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoName}>Maison Laurel</span>
          <span className={styles.logoSub}>Fine Dining</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account to continue.</p>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={`form-input ${styles.inputWrap}`}
                style={{ paddingRight: '2.75rem' }}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <hr className={styles.divider} />

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
