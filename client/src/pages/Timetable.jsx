import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, MapPin, Trash2 } from 'lucide-react'
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
  const [selectedMobileDay, setSelectedMobileDay] = useState('Monday')

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [day, setDay] = useState('Monday')
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
    acc[d] = slots.filter((s) => s.day === d)
    return acc
  }, {})

  return (
    <div className="timetable-page">
      <div className="page-header">
        <div>
          <h1>Weekly Timetable</h1>
          <p>Organize your lecture hours, discussion labs, and classrooms.</p>
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
      ) : slots.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={CalendarDays}
            title={subjects.length === 0 ? 'No subjects found' : 'Timetable is empty'}
            description={
              subjects.length === 0
                ? 'Create a subject before scheduling your timetable.'
                : 'Schedule your recurring weekly classes and lab sessions.'
            }
            actionLabel={subjects.length === 0 ? 'Add Subject First' : 'Add First Class'}
            onAction={() => {
              if (subjects.length === 0) {
                window.location.href = '/subjects'
              } else {
                setModalOpen(true)
              }
            }}
          />
        </Card>
      ) : (
        <>
          {/* Mobile Day Selector (Visible <768px) */}
          <div className="timetable-mobile-tabs" role="tablist">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={selectedMobileDay === d}
                className={`mobile-day-tab ${selectedMobileDay === d ? 'active' : ''}`}
                onClick={() => setSelectedMobileDay(d)}
              >
                <span>{d.slice(0, 3)}</span>
                <span className="count-dot">
                  {slotsByDay[d]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Desktop Weekly Grid (>=768px) */}
          <div className="timetable-grid-desktop">
            {DAYS.map((d) => (
              <div key={d} className="day-column">
                <div className="day-column-header">
                  <h3>{d}</h3>
                  <span className="day-count-badge">
                    {slotsByDay[d]?.length || 0} classes
                  </span>
                </div>

                <div className="day-slots-list">
                  {slotsByDay[d]?.length === 0 ? (
                    <div className="day-empty-cell">
                      <span>No classes</span>
                    </div>
                  ) : (
                    slotsByDay[d].map((slot) => (
                      <div key={slot.id} className="slot-card">
                        <div className="slot-card-top">
                          <span className="slot-subject-code">{slot.subjectCode}</span>
                          <button
                            type="button"
                            className="slot-delete-btn"
                            onClick={() => setDeleteId(slot.id)}
                            aria-label="Remove slot"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <h4 className="slot-subject-name">{slot.subjectName}</h4>
                        <div className="slot-time-row">
                          <Clock size={12} />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.room && (
                          <div className="slot-room-row">
                            <MapPin size={12} />
                            <span>Room {slot.room}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Day View (<768px) */}
          <div className="timetable-mobile-view">
            <div className="mobile-day-header">
              <h3>{selectedMobileDay}'s Schedule</h3>
            </div>
            {slotsByDay[selectedMobileDay]?.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted">No classes scheduled for {selectedMobileDay}.</p>
              </Card>
            ) : (
              <div className="mobile-slots-list">
                {slotsByDay[selectedMobileDay].map((slot) => (
                  <Card key={slot.id} className="mobile-slot-card">
                    <div className="mobile-slot-info">
                      <div className="header-tags">
                        <Badge variant="neutral" size="sm">
                          {slot.subjectCode}
                        </Badge>
                        {slot.room && (
                          <span className="room-tag">Room {slot.room}</span>
                        )}
                      </div>
                      <h4>{slot.subjectName}</h4>
                      <div className="slot-time-row">
                        <Clock size={14} />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-action-btn danger"
                      onClick={() => setDeleteId(slot.id)}
                      aria-label="Delete class"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Card>
                ))}
              </div>
            )}
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
              Save Class Slot
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="form-vertical">
          <div className="form-group">
            <label htmlFor="slot-sub" className="form-label">
              Subject
            </label>
            <select
              id="slot-sub"
              required
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="slot-day" className="form-label">
              Day of Week
            </label>
            <select
              id="slot-day"
              required
              className="form-select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
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
              <label htmlFor="slot-start" className="form-label">
                Start Time
              </label>
              <input
                id="slot-start"
                type="time"
                required
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="slot-end" className="form-label">
                End Time
              </label>
              <input
                id="slot-end"
                type="time"
                required
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="slot-room" className="form-label">
              Room / Lab Location (Optional)
            </label>
            <input
              id="slot-room"
              type="text"
              className="form-input"
              placeholder="e.g. Hall 302, CS Lab B"
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
              Keep
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteId)}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="confirm-delete-text">
          Are you sure you want to remove this scheduled class slot from your timetable?
        </p>
      </Modal>
    </div>
  )
}

export default Timetable
