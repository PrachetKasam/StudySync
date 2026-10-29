import { useState, useEffect } from 'react'
import { BookOpen, Plus, Trash2, ArrowUpRight, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'

const CARD_ACCENT_CLASSES = [
  'subject-accent-indigo',
  'subject-accent-emerald',
  'subject-accent-sky',
  'subject-accent-purple',
  'subject-accent-amber',
]

export function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/subjects')
      if (res.success) {
        setSubjects(res.data)
      }
    } catch (err) {
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    setSaving(true)
    try {
      const res = await api.post('/api/subjects', {
        name: name.trim(),
        code: code.trim(),
      })
      if (res.success) {
        toast.success(`Subject "${res.data.name}" created successfully`)
        setModalOpen(false)
        setName('')
        setCode('')
        fetchSubjects()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create subject')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/api/subjects/${id}`)
      if (res.success) {
        toast.success('Subject deleted successfully')
        setDeleteConfirmId(null)
        fetchSubjects()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject')
    }
  }

  return (
    <div className="subjects-page">
      <div className="page-header">
        <div>
          <h1>Enrolled Subjects</h1>
          <p>Manage your curriculum, catalog numbers, and course details for this semester.</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Add Subject
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : subjects.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={BookOpen}
            title="No subjects added yet"
            description="Add your first enrolled subject to unlock attendance logging, timetable schedule grids, and assignment management."
            actionLabel="Add Subject"
            onAction={() => setModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="subjects-grid">
          {subjects.map((sub, index) => {
            const accentClass = CARD_ACCENT_CLASSES[index % CARD_ACCENT_CLASSES.length]
            return (
              <Card key={sub.id} className={`subject-card ${accentClass}`}>
                <div>
                  <div className="subject-card-header">
                    <div className="subject-badge-group">
                      <div className="subject-icon-avatar" aria-hidden="true">
                        <BookOpen size={16} />
                      </div>
                      <Badge variant="neutral" size="sm">
                        {sub.code}
                      </Badge>
                    </div>
                    <div className="subject-card-actions">
                      <button
                        type="button"
                        className="icon-action-btn danger"
                        onClick={() => setDeleteConfirmId(sub.id)}
                        aria-label={`Delete ${sub.name}`}
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h2 className="subject-name">{sub.name}</h2>
                </div>

                <div className="subject-card-footer">
                  <Link to="/attendance" className="subject-link">
                    <span>Track Attendance</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Subject"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>
              Add Subject
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="form-vertical">
          <div className="form-group">
            <label htmlFor="modal-name" className="form-label">
              Subject Name
            </label>
            <input
              id="modal-name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Distributed Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-code" className="form-label">
              Subject Code
            </label>
            <input
              id="modal-code"
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS401"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Subject Deletion"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>
              Delete Subject
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete this subject? Its associated attendance records,
          assignments, and timetable slots will also be removed.
        </p>
      </Modal>
    </div>
  )
}

export default Subjects
