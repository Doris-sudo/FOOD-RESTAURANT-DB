'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import MenuCard from '../../components/MenuCard';
import CategoryFilter from '../../components/CategoryFilter';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { getMenuItems, getCategories } from '../../lib/api';
import styles from './page.module.css';

export default function MenuPage() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected,   setSelected]   = useState(null);   // null = All
  const [search,     setSearch]     = useState('');
  const [available,  setAvailable]  = useState(false);  // toggle: show only available
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Fetch items + categories on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [itemsData, catsData] = await Promise.all([
          getMenuItems(),
          getCategories(),
        ]);
        setItems(itemsData);
        setCategories(catsData);
      } catch (err) {
        setError(err.message || 'Failed to load menu. Is the API server running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (selected !== null && item.category_id !== selected) return false;
      if (available && !item.is_available) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.category_name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, selected, available, search]);

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div>
              <h1>Our Menu</h1>
              {!loading && (
                <p className={styles.count}>
                  Showing {filtered.length} of {items.length} dishes
                </p>
              )}
            </div>
            <Link href="/orders/new" className="btn btn-primary">
              + Place an Order
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className="container">
          {error && <AlertMessage type="error" message={error} />}

          {loading ? (
            <LoadingSpinner label="Loading menu…" />
          ) : (
            <>
              {/* Category filter */}
              <CategoryFilter
                categories={categories}
                selected={selected}
                onSelect={setSelected}
              />

              {/* Search + availability toggle */}
              <div className={styles.toolbar}>
                <div className={styles.search}>
                  <span className={styles.searchIcon} aria-hidden="true">🔍</span>
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search dishes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search menu items"
                  />
                </div>

                <div className={styles.toggleWrap}>
                  <label htmlFor="avail-toggle">Available only</label>
                  <label className={styles.toggle}>
                    <input
                      id="avail-toggle"
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>

              {/* Grid */}
              {filtered.length > 0 ? (
                <div className={styles.grid}>
                  {filtered.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">🍽</span>
                  <h3>No dishes found</h3>
                  <p>Try adjusting your search or clearing the filters.</p>
                  <button
                    className="btn btn-ghost mt-2"
                    onClick={() => { setSelected(null); setSearch(''); setAvailable(false); }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
