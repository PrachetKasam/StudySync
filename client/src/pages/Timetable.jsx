import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, MapPin, Trash2, Calendar } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Timetable() {
  const [slots, setSlots] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]
  const defaultDay = DAYS.includes(todayDayName) ? todayDayName : 'Monday'
  const [selectedMobileDay, setSelectedMobileDay] = useState(defaultDay)

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [day, setDay] = useState(defaultDay)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:30')
  const [room, setRoom] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null)
  const toast = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [timeRes, subRes] = await Promise.all([
        api.get('/api/timetable'),
        api.get('/api/subjects'),
      ])
      if (timeRes.success) setSlots(timeRes.data)
      if (subRes.success) {
        setSubjects(subRes.data)
        if (subRes.data.length > 0 && !subjectId) {
          setSubjectId(String(subRes.data[0].id))
        }
      }
    } catch (err) {
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!subjectId || !day || !startTime || !endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/api/timetable', {
        subjectId: Number(subjectId),
        day,
        startTime,
        endTime,
        room: room.trim() || null,
      })
      if (res.success) {
        toast.success('Class slot added to timetable')
        setModalOpen(false)
        setRoom('')
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add class slot')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/api/timetable/${id}`)
      if (res.success) {
        toast.success('Class slot removed')
        setDeleteId(null)
        setSlots((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete class slot')
    }
  }

  // Group slots by day
  const slotsByDay = DAYS.reduce((acc, d) => {
    acc[d] = slots
      .filter((s) => s.day === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
    return acc
  }, {})

  return (
    <div className="timetable-page">
      <div className="page-header">
        <div>
          <h1>Weekly Timetable</h1>
          <p>Organize your weekly course schedule, lecture halls, and discussion sections.</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            icon={Plus}
            disabled={subjects.length === 0}
            onClick={() => setModalOpen(true)}
          >
            Add Class Slot
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : subjects.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={CalendarDays}
            title="No subjects available"
            description="Add your enrolled subjects first before configuring your weekly class timetable."
            actionLabel="Add Subject First"
            onAction={() => (window.location.href = '/subjects')}
          />
        </Card>
      ) : slots.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={CalendarDays}
            title="Weekly timetable is empty"
            description="Add your lecture periods and discussion lab hours to create your weekly calendar grid."
            actionLabel="Add First Class Slot"
            onAction={() => setModalOpen(true)}
          />
        </Card>
      ) : (
        <>
          {/* Desktop 6-Column Weekly Grid */}
          <div className="timetable-grid-desktop">
            {DAYS.map((dayName) => {
              const daySlots = slotsByDay[dayName] || []
              const isToday = dayName === todayDayName
              return (
                <div key={dayName} className={`day-column ${isToday ? 'day-column-today' : ''}`}>
                  <div className="day-column-header">
                    <div className="day-header-top">
                      <h3>{dayName}</h3>
                      {isToday && <span className="today-chip">Today</span>}
                    </div>
                    <span className="day-count-badge">
                      {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  <div className="day-slots-list">
                    {daySlots.length === 0 ? (
                      <div className="day-empty-cell">
                        <span>No classes</span>
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div key={slot.id} className="slot-card">
                          <div className="slot-card-top">
                            <span className="slot-subject-code">{slot.subjectCode}</span>
                            <button
                              type="button"
                              className="slot-delete-btn"
                              onClick={() => setDeleteId(slot.id)}
                              aria-label={`Remove slot for ${slot.subjectName}`}
                              title="Remove slot"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <span className="slot-subject-name">{slot.subjectName}</span>
                          <div className="slot-time-row">
                            <Clock size={11} />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {slot.room && (
                            <div className="slot-room-row">
                              <MapPin size={11} />
                              <span>Room {slot.room}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile Tabs & List View */}
          <div className="timetable-mobile-wrapper">
            <div className="timetable-mobile-tabs" role="tablist">
              {DAYS.map((dayName) => {
                const count = slotsByDay[dayName]?.length || 0
                const isSelected = selectedMobileDay === dayName
                const isToday = dayName === todayDayName
                return (
                  <button
                    key={dayName}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`mobile-day-tab ${isSelected ? 'active' : ''} ${isToday ? 'is-today-tab' : ''}`}
                    onClick={() => setSelectedMobileDay(dayName)}
                  >
                    <span>{dayName.slice(0, 3)}</span>
                    <span className="count-dot">{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="timetable-mobile-view">
              <div className="mobile-slots-list">
                {slotsByDay[selectedMobileDay]?.length === 0 ? (
                  <Card className="p-8">
                    <EmptyState
                      icon={Calendar}
                      title={`No classes on ${selectedMobileDay}`}
                      description="You have no lectures or labs scheduled for this day."
                      actionLabel="Add Class Slot"
                      onAction={() => {
                        setDay(selectedMobileDay)
                        setModalOpen(true)
                      }}
                    />
                  </Card>
                ) : (
                  slotsByDay[selectedMobileDay]?.map((slot) => (
                    <Card key={slot.id} className="mobile-slot-card">
                      <div>
                        <div className="slot-card-top">
                          <Badge variant="neutral" size="sm">
                            {slot.subjectCode}
                          </Badge>
                        </div>
                        <h3 className="mobile-slot-title">{slot.subjectName}</h3>
                        <div className="mobile-slot-meta">
                          <div className="slot-time-row">
                            <Clock size={13} />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {slot.room && (
                            <div className="slot-room-row">
                              <MapPin size={13} />
                              <span>Room {slot.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-action-btn danger"
                        onClick={() => setDeleteId(slot.id)}
                        aria-label={`Remove slot for ${slot.subjectName}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Class to Timetable"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>
              Add Class
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="form-vertical">
          <div className="form-group">
            <label htmlFor="modal-time-subject" className="form-label">
              Subject
            </label>
            <select
              id="modal-time-subject"
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="modal-time-day" className="form-label">
              Day of Week
            </label>
            <select
              id="modal-time-day"
              className="form-select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="modal-time-start" className="form-label">
                Start Time
              </label>
              <input
                id="modal-time-start"
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-time-end" className="form-label">
                End Time
              </label>
              <input
                id="modal-time-end"
                type="time"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="modal-time-room" className="form-label">
              Room / Hall (Optional)
            </label>
            <input
              id="modal-time-room"
              type="text"
              className="form-input"
              placeholder="e.g. Hall 302, Lab B"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Remove Class Slot"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteId)}>
              Remove Slot
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to remove this class slot from your weekly timetable?</p>
      </Modal>
    </div>
  )
}

export default Timetable
