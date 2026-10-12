import Image from 'next/image';
import Link from 'next/link';
import MenuCard from '../components/MenuCard';
import styles from './page.module.css';

// Server component — fetch featured items directly on the server
async function getFeaturedItems() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/menu-items?featured=true&available=true`, {
      next: { revalidate: 60 }, // revalidate every 60 seconds
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedItems();
  // Cap to 3 for the homepage grid
  const displayItems = featured.slice(0, 3);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600"
          alt="Elegant restaurant interior"
          fill
          priority
          className={styles.heroBg}
          sizes="100vw"
        />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Est. 2014 · London</span>
          <h1 className={styles.heroTitle}>
            Where Every Meal<br />Becomes a Memory
          </h1>
          <p className={styles.heroSub}>
            Maison Laurel brings together seasonal ingredients, classical
            technique, and warm hospitality in an intimate setting.
          </p>
          <div className={styles.heroActions}>
            <Link href="/menu" className="btn btn-accent btn-lg">
              Explore Our Menu
            </Link>
            <Link href="/orders/new" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(248,243,236,0.5)', color: 'var(--cream)' }}>
              Place an Order
            </Link>
          </div>
        </div>
      </section>

      {/* ── Info Bar ──────────────────────────────────────── */}
      <div className={styles.infoBar}>
        <div className={styles.infoBarInner}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🕐</span>
            <span>Tue–Sun, 6 pm – 11 pm</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📍</span>
            <span>14 Laurel Street, London</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📞</span>
            <span>+44 20 7946 0823</span>
          </div>
        </div>
      </div>

      {/* ── Featured Items ─────────────────────────────────── */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>From the Kitchen</span>
            <h2>Chef&apos;s Favourites</h2>
            <p>
              A curated selection of dishes our kitchen is most proud of —
              crafted from the finest seasonal produce.
            </p>
          </div>

          {displayItems.length > 0 ? (
            <>
              <div className={styles.featuredGrid}>
                {displayItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
              <div className={styles.menuCta}>
                <Link href="/menu" className="btn btn-secondary">
                  View Full Menu →
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">🍽</span>
              <h3>Menu coming soon</h3>
              <p>Start the API server and seed the database to see featured dishes here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────── */}
      <section className={styles.about}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2>A Commitment to Craft</h2>
              <p>
                Founded in 2014 by Chef Isabelle Laurel, Maison Laurel was built
                on one simple conviction: that exceptional food requires time,
                care, and the best possible ingredients.
              </p>
              <p>
                Our menu changes with the seasons. Every dish on the menu is
                prepared fresh daily, and our relationships with local farmers and
                artisan producers are at the heart of everything we do.
              </p>
              <Link href="/menu" className="btn btn-primary">
                Discover the Menu
              </Link>
            </div>
            <div className={styles.aboutImage}>
              <Image
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800"
                alt="Chef preparing a dish"
                fill
                className={styles.aboutImg}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Dine?</h2>
          <p>
            Browse the full menu and place your order directly — it reaches the
            kitchen in seconds.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/orders/new" className="btn btn-accent btn-lg">
              Place an Order
            </Link>
            <Link href="/orders" className="btn btn-ghost btn-lg" style={{ color: 'var(--cream-dark)', borderColor: 'rgba(248,243,236,0.25)' }}>
              View Existing Orders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
