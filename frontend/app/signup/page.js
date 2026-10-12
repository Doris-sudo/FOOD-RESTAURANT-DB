'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiRegister } from '../../lib/auth';
import AlertMessage from '../../components/AlertMessage';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Live password strength
  const strength = password.length === 0 ? null
    : password.length < 8 ? 'weak'
    : /[A-Z]/.test(password) && /\d/.test(password) ? 'strong'
    : 'medium';

  const strengthColor = { weak: '#ef4444', medium: '#f59e0b', strong: '#22c55e' };
  const strengthLabel = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim())           return setError('Please enter your name.');
    if (!email.trim())          return setError('Please enter your email address.');
    if (password.length < 8)    return setError('Password must be at least 8 characters.');
    if (password !== confirm)   return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await apiRegister({ name, email, password });
      login(res.token, res.user);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Join us — it only takes a moment.</p>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

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
                className="form-input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
            {/* Strength indicator */}
            {strength && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--border)' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
                    background: strengthColor[strength],
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColor[strength], fontWeight: 600 }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              className={`form-input ${confirm && confirm !== password ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            {confirm && confirm !== password && (
              <span className="form-error">Passwords do not match.</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <hr className={styles.divider} />

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
