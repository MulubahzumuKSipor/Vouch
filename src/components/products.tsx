'use client'

import Image from 'next/image'
import { ShoppingBag, Star, ShieldCheck, PlayCircle, Award, Users, Globe } from 'lucide-react'
import styles from '@/styles/productView.module.css'

interface SellerProfile {
  avatar_url?: string | null
  username?: string
  full_name?: string
}

interface Product {
  title: string
  description?: string
  cover_image?: string | null
  price_amount: number
  rating_average?: number | null
  sales_count: number
  profiles?: SellerProfile
}

export default function ProductSalesView({ product }: { product: Product }) {
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price_amount / 100)

  return (
    <div className={styles.salesContainer}>

      {/* 1. HERO SECTION (Mobile Only Header) */}
      <div className={styles.mobileHeader}>
        {product.cover_image && (
          <div className={styles.mobileCover}>
            <Image
              src={product.cover_image}
              alt={product.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}
        <h1 className={styles.mobileTitle}>{product.title}</h1>
      </div>

      <div className={styles.gridLayout}>
        {/* 2. LEFT COLUMN: Content & Description */}
        <div className={styles.mainContent}>
          {/* Desktop Cover */}
          <div className={styles.desktopCover}>
            {product.cover_image ? (
               <Image
                 src={product.cover_image}
                 alt={product.title}
                 fill
                 style={{ objectFit: 'cover' }}
                 priority
               />
            ) : (
              <div className={styles.placeholderCover}>
                <Award size={64} opacity={0.2} />
              </div>
            )}
          </div>

          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionHeading}>About this product</h2>
            <div className={styles.prose}>
              {product.description?.split('\n').map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* Seller Bio Card */}
          <div className={styles.sellerCard}>
            <div className={styles.sellerHeader}>
              <Image
                src={product.profiles?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + product.profiles?.username}
                alt={product.profiles?.full_name || 'Seller'}
                width={48}
                height={48}
                className={styles.sellerAvatar}
              />
              <div>
                <p className={styles.sellerLabel}>Created by</p>
                <h3 className={styles.sellerName}>{product.profiles?.full_name}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: Sticky Buy Widget */}
        <div className={styles.sidebar}>
          <div className={styles.buyCard}>
            <h1 className={styles.desktopTitle}>{product.title}</h1>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <span>{product.rating_average?.toFixed(1) || 'New'}</span>
              </div>
              <div className={styles.dividerDot} />
              <div className={styles.stat}>
                <Users size={16} />
                <span>{product.sales_count} students</span>
              </div>
            </div>

            <div className={styles.priceTag}>{price}</div>

            <button className={styles.primaryBtn}>
              <ShoppingBag size={20} />
              Buy Now
            </button>

            <p className={styles.guaranteeText}>
              <ShieldCheck size={14} />
              Secure payment via Mobile Money
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <PlayCircle size={16} />
                <span>Lifetime Access</span>
              </div>
              <div className={styles.featureItem}>
                <Globe size={16} />
                <span>Access on Mobile & Web</span>
              </div>
              <div className={styles.featureItem}>
                <Award size={16} />
                <span>Certificate of Completion</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}