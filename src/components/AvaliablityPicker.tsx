'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'

// Define the days and the standard time slots (9 AM to 6 PM)
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
]

interface AvailabilityPickerProps {
  initialData?: any
}

export default function AvailabilityPicker({ initialData }: AvailabilityPickerProps) {
  // Parse existing data or start fresh
  const [schedule, setSchedule] = useState<Record<string, string[]>>(
    initialData && Object.keys(initialData).length > 0 ? initialData : {}
  )
  const [activeDay, setActiveDay] = useState<string>('monday')

  // Toggle a time slot on or off for the active day
  const toggleTimeSlot = (time: string) => {
    setSchedule(prev => {
      const daySlots = prev[activeDay] || []
      const newSlots = daySlots.includes(time)
        ? daySlots.filter(t => t !== time) // Remove it
        : [...daySlots, time].sort() // Add it and keep chronological order

      return { ...prev, [activeDay]: newSlots }
    })
  }

  // Helper to count how many total slots they've selected across the whole week
  const totalSlots = Object.values(schedule).reduce((acc, slots) => acc + slots.length, 0)

  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* 🔴 HIDDEN INPUT: This magically sends our JSON to the Server Action! */}
      <input type="hidden" name="availability" value={JSON.stringify(schedule)} />

      {/* DAYS TAB BAR */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #E5E7EB', background: '#ffffff' }}>
        {DAYS.map((day) => {
          const isActive = activeDay === day
          const hasSlots = schedule[day]?.length > 0
          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              style={{
                flex: '1 0 auto',
                padding: '1rem 0.5rem',
                background: isActive ? '#EEF2FF' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                color: isActive ? '#4F46E5' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem'
              }}
            >
              {day.slice(0, 3)}
              {hasSlots && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4F46E5' }} />}
            </button>
          )
        })}
      </div>

      {/* TIME SLOTS GRID */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, textTransform: 'capitalize', color: '#111827' }}>
            {activeDay} Availability
          </h3>
          <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {schedule[activeDay]?.length || 0} slots selected
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = schedule[activeDay]?.includes(slot.value)
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => toggleTimeSlot(slot.value)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #4F46E5' : '1px solid #D1D5DB',
                  background: isSelected ? '#EEF2FF' : '#ffffff',
                  color: isSelected ? '#4F46E5' : '#374151',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {isSelected && <CheckCircle2 size={14} />}
                {slot.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* FOOTER SUMMARY */}
      <div style={{ padding: '1rem 1.5rem', background: '#F3F4F6', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4B5563' }}>
        <Clock size={16} />
        <span>You have <strong>{totalSlots}</strong> total time slots open for buyers to book this week.</span>
      </div>
    </div>
  )
}