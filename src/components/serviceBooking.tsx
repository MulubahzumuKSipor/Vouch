'use client'

import { useState, useMemo } from 'react'
import BuyNowButton from '@/components/buyProduct'
import AddToCartButton from '@/components/AddToCartButton'
import { Clock } from 'lucide-react'
import styles from '@/styles/service-booking.module.css'

function generateAvailableDates(availabilityRaw: any) {
  let data: { repeat_weekly?: boolean; schedule?: any } = {}

  // 1. SMART PARSING: Handles both the old flat format and the new toggle format
  try {
    const parsed = typeof availabilityRaw === 'string'
      ? JSON.parse(availabilityRaw)
      : availabilityRaw

    if (parsed && 'schedule' in parsed) {
      data = parsed
    } else {
      // Backwards compatibility for older products
      data = { repeat_weekly: true, schedule: parsed || {} }
    }
  } catch (e) {
    data = { repeat_weekly: true, schedule: {} }
  }

  const schedule = data.schedule || {}
  const isRecurring = data.repeat_weekly !== false // Defaults to true
  const dates = []
  const today = new Date()

  // 2. THE TOGGLE LOGIC: 30 days if repeating, only 7 days if one-time
  const lookAheadLimit = isRecurring ? 30 : 7

  for (let i = 1; i <= lookAheadLimit; i++) {
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + i)
    
    // 3. TIMEZONE FIX: Uses locale to get the exact day name, preventing drift
    const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    // Only generate this date if the seller specifically added time slots for it
    if (schedule[dayName] && schedule[dayName].length > 0) {
      dates.push({
        // Normalize to midnight to prevent selection bugs
        fullDate: new Date(futureDate.setHours(0, 0, 0, 0)),
        dayName: dayName,
        displayDate: futureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        slots: schedule[dayName]
      })
    }
  }
  return dates
}

export default function ServiceBookingCalendar({ availability, duration, cartPayload }: { availability: any, duration: number, cartPayload: any }) {
  const availableDates = useMemo(() => generateAvailableDates(availability), [availability])
  
  const [selectedDate, setSelectedDate] = useState<any | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const handleDateSelect = (dateObj: any) => {
    setSelectedDate(dateObj)
    setSelectedTime(null)
  }

  const dynamicPayload = {
    ...cartPayload,
    booking_time: selectedDate && selectedTime ? `${selectedDate.displayDate} at ${selectedTime}` : undefined
  }

  const isReady = selectedDate && selectedTime

  return (
    <div className={styles.container}>
      <div className={styles.durationBadge}>
        <Clock size={18} /> <span>{duration || 60} Minute Session (GMT)</span>
      </div>

      <h3 className={styles.stepTitle}>1. Select a Date</h3>
      
      {availableDates.length > 0 ? (
        <div className={styles.dateScroll}>
          {availableDates.map((dateObj, idx) => {
            const isSelected = selectedDate?.fullDate === dateObj.fullDate
            return (
              <button
                key={idx}
                onClick={() => handleDateSelect(dateObj)}
                className={`${styles.dateBtn} ${isSelected ? styles.dateBtnActive : ''}`}
              >
                <div className={styles.dayText}>{dateObj.dayName.slice(0, 3)}</div>
                <div className={styles.dateNum}>{dateObj.fullDate.getDate()}</div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className={styles.emptyState}>
          No availability currently set by seller.
        </p>
      )}

      {selectedDate && (
        <div className={styles.timeSection}>
          <h3 className={styles.stepTitle}>2. Select a Time</h3>
          <div className={styles.timeGrid}>
            {selectedDate.slots.map((time: string) => {
              const isSelected = selectedTime === time
              const [hourStr, minStr] = time.split(':')
              let hour = parseInt(hourStr)
              const ampm = hour >= 12 ? 'PM' : 'AM'
              hour = hour % 12 || 12
              const displayTime = `${hour}:${minStr} ${ampm}`

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`${styles.timeBtn} ${isSelected ? styles.timeBtnActive : ''}`}
                >
                  {displayTime}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className={`${styles.actionBox} ${isReady ? styles.actionBoxEnabled : styles.actionBoxDisabled}`}>
        <BuyNowButton product={dynamicPayload} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AddToCartButton product={dynamicPayload} />
        </div>
        {!isReady && (
          <p className={styles.warningText}>Please select a date and time to continue.</p>
        )}
      </div>
    </div>
  )
}