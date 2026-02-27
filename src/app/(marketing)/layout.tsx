import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import styles from "@/styles/layout.module.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}