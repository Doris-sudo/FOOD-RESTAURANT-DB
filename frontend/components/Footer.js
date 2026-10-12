import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Brand */}
        <div className={styles.brand}>
          <p className={styles.name}>Maison Laurel</p>
          <p>
            An intimate fine-dining experience where seasonal ingredients meet
            classical technique. Open Tuesday to Sunday, from 6 pm.
          </p>
        </div>

        {/* Navigation */}
        <div className={styles.col}>
          <h4>Navigate</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/orders">Orders</Link></li>
            <li><Link href="/orders/new">Place Order</Link></li>
            <li><Link href="/admin">Admin</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4>Find Us</h4>
          <address>
            14 Laurel Street<br />
            London, W1K 4AB<br />
            <br />
            +44 20 7946 0823<br />
            hello@maisonlaurel.com
          </address>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} Maison Laurel. All rights reserved.</p>
        <p>Restaurant Management System — Built with Next.js & PostgreSQL</p>
      </div>
    </footer>
  );
}
