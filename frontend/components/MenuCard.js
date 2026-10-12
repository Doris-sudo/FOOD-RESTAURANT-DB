import Image from 'next/image';
import styles from './MenuCard.module.css';

/**
 * MenuCard
 * Displays a single menu item in a grid.
 *
 * Props:
 *   item       — menu item object from the API
 *   onAddToOrder(item) — optional callback; renders an "Add" button when provided
 */
export default function MenuCard({ item, onAddToOrder }) {
  const price = parseFloat(item.price).toFixed(2);

  return (
    <article className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage} aria-hidden="true">🍽</div>
        )}
        {item.is_featured  && <span className={styles.featuredBadge}>Featured</span>}
        {!item.is_available && <span className={styles.unavailableBadge}>Unavailable</span>}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {item.category_name && (
          <p className={styles.category}>{item.category_name}</p>
        )}
        <h3 className={styles.name}>{item.name}</h3>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>£{price}</span>
          {onAddToOrder && (
            <button
              className={styles.addBtn}
              onClick={() => onAddToOrder(item)}
              disabled={!item.is_available}
              aria-label={`Add ${item.name} to order`}
            >
              {item.is_available ? '+ Add' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
