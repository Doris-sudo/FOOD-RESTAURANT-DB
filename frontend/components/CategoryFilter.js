'use client';

import styles from './CategoryFilter.module.css';

/**
 * CategoryFilter
 * Renders a row of pill buttons for filtering menu items by category.
 *
 * Props:
 *   categories    — array of category objects from the API
 *   selected      — currently selected category id (null = "All")
 *   onSelect(id)  — called with the category id, or null for "All"
 */
export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <nav className={styles.wrap} aria-label="Filter by category">
      <button
        className={`${styles.btn} ${selected === null ? styles.active : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.btn} ${selected === cat.id ? styles.active : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
