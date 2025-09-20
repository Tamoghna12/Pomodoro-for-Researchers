import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { NotificationSystem } from '../utils/audioUtils'

export const useNotifications = () => {
  const notificationSystem = useRef<NotificationSystem | null>(null)
  const timer = useSelector((state: RootState) => state.timer)
  const settings = useSelector((state: RootState) => state.settings)
  const prevStatus = useRef(timer.status)
  const prevTimeRemaining = useRef(timer.timeRemaining)
  const hasShownMinuteWarning = useRef(false)

  // Initialize notification system
  useEffect(() => {
    notificationSystem.current = new NotificationSystem()
  }, [])

  // Update notification settings
  useEffect(() => {
    if (notificationSystem.current) {
      notificationSystem.current.setAudioEnabled(settings.soundEnabled)
      notificationSystem.current.setBrowserNotificationsEnabled(settings.notifications)
      notificationSystem.current.setVolume(settings.soundVolume)
    }
  }, [settings.soundEnabled, settings.notifications, settings.soundVolume])

  // Handle status changes
  useEffect(() => {
    if (!notificationSystem.current) return

    // Session started
    if (prevStatus.current === 'idle' && timer.status === 'running') {
      notificationSystem.current.notifySessionStart()
      hasShownMinuteWarning.current = false
    }

    // Session completed
    if (prevStatus.current === 'running' && timer.status === 'completed') {
      notificationSystem.current.notifySessionComplete(timer.mode)
    }

    prevStatus.current = timer.status
  }, [timer.status, timer.mode])

  // Handle minute warning
  useEffect(() => {
    if (!notificationSystem.current) return

    // Show warning when 1 minute remaining and timer is running
    if (
      timer.status === 'running' &&
      timer.timeRemaining === 60 &&
      prevTimeRemaining.current > 60 &&
      !hasShownMinuteWarning.current
    ) {
      notificationSystem.current.notifyMinuteWarning(timer.mode)
      hasShownMinuteWarning.current = true
    }

    // Reset warning flag when time increases (session reset/switched)
    if (timer.timeRemaining > prevTimeRemaining.current) {
      hasShownMinuteWarning.current = false
    }

    prevTimeRemaining.current = timer.timeRemaining
  }, [timer.timeRemaining, timer.status, timer.mode])

  return notificationSystem.current
}