import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'studysync_attendance_threshold'
const DEFAULT_THRESHOLD = 75

/**
 * Hook to manage user-configurable low-attendance threshold (default 75%).
 * Encapsulated in a single hook so persistence can move server-side seamlessly.
 */
export function useAttendanceThreshold() {
  const [threshold, setThresholdState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
          return parsed
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_THRESHOLD
  })

  const setThreshold = useCallback((newVal) => {
    const num = Math.min(100, Math.max(1, parseInt(newVal, 10) || DEFAULT_THRESHOLD))
    setThresholdState(num)
    try {
      localStorage.setItem(STORAGE_KEY, String(num))
    } catch {
      // Ignore
    }
  }, [])

  /**
   * Helper to compute attendance status and class advice for a given subject.
   * Attendance % = (attended / total) * 100. (0 when total is 0)
   * If % >= threshold: returns number of future classes student can miss while staying at or above threshold.
   * If % < threshold: returns number of consecutive classes student must attend to reach threshold.
   */
  const calculateAttendanceMetrics = useCallback((attended, total) => {
    const att = Math.max(0, parseInt(attended, 10) || 0)
    const tot = Math.max(0, parseInt(total, 10) || 0)

    if (tot === 0) {
      return {
        percentage: 0,
        isLow: false,
        advice: 'No classes recorded yet',
        classesToMiss: 0,
        classesToAttend: 0,
      }
    }

    const percentage = Math.round((att / tot) * 100)
    const tFrac = threshold / 100
    const isLow = percentage < threshold

    if (!isLow) {
      // How many classes can still be missed?
      // (att) / (tot + m) >= tFrac  =>  m <= (att / tFrac) - tot
      const canMiss = Math.max(0, Math.floor((att / tFrac) - tot))
      return {
        percentage,
        isLow: false,
        classesToMiss: canMiss,
        classesToAttend: 0,
        advice: canMiss === 0
          ? 'You are right at the threshold. Do not miss the next class!'
          : `You can safely miss ${canMiss} more ${canMiss === 1 ? 'class' : 'classes'}`,
      }
    } else {
      // How many consecutive classes needed to reach threshold?
      // (att + a) / (tot + a) >= tFrac  =>  att + a >= tFrac*tot + tFrac*a
      // a * (1 - tFrac) >= tFrac*tot - att  =>  a >= (tFrac*tot - att) / (1 - tFrac)
      const needed = Math.max(1, Math.ceil((tFrac * tot - att) / (1 - tFrac)))
      return {
        percentage,
        isLow: true,
        classesToMiss: 0,
        classesToAttend: needed,
        advice: `Need to attend next ${needed} ${needed === 1 ? 'class' : 'classes'} to reach ${threshold}%`,
      }
    }
  }, [threshold])

  return {
    threshold,
    setThreshold,
    calculateAttendanceMetrics,
  }
}

export default useAttendanceThreshold
