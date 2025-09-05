import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import CardItem from "../../Compo/CardItem/CardItem";
import Footer from "../../Compo/Footer/Footer";
export default function LandingPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const cardRefs = useRef([]);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Animate hero on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/card-item-all");
        const result = await res.json();
        if (result.status === "success") {
          // Get 5 random products for better viewing experience
          const allProducts = result.data;
          const randomProducts = [];
          
          // Only proceed if we have products
          if (allProducts.length > 0) {
            // Get 5 random products or all if less than 5
            const numToShow = Math.min(5, allProducts.length);
            
            // Create a copy of the array to avoid modifying the original
            const productsCopy = [...allProducts];
            
            for (let i = 0; i < numToShow; i++) {
              // Get random index
              const randomIndex = Math.floor(Math.random() * productsCopy.length);
              // Add the product to our selection
              randomProducts.push(productsCopy[randomIndex]);
              // Remove the selected product to avoid duplicates
              productsCopy.splice(randomIndex, 1);
            }
          }
          
          setItems(randomProducts);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Card animation with IntersectionObserver
  useEffect(() => {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.showCard);
            }
          });
        },
        { threshold: 0.1 }
      );

      cardRefs.current.forEach((card) => card && observer.observe(card));
      return () => {
        cardRefs.current.forEach((card) => card && observer.unobserve(card));
      };
    }
  }, [items]);

  // Show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={styles.landingPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          <img src="/Vinque_logo.png" alt="Vinque" />
        </div>
        <nav className={styles.nav}>
          <button onClick={() => navigate("/login")}>Login</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className={`${styles.hero} ${heroVisible ? styles.showHero : ""}`}
      >
        <video autoPlay muted loop playsInline>
          <source src="/landing_background.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroContent}>
          <h1>Welcome to Vinque</h1>
          <p>Purchase your past with timeless treasures</p>
          <button onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionTitle}>Featured Products</h2>
        {loading ? (
          <p className={styles.loadingText}>Loading items...</p>
        ) : items.length === 0 ? (
          <p className={styles.loadingText}>No items found.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item, idx) => (
              <div
                key={item.product_id || idx}
                className={styles.cardItem}
                ref={(el) => (cardRefs.current[idx] = el)}
              >
                <CardItem 
                  data={item} 
                  onCardClick={() => navigate('/signup')}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
