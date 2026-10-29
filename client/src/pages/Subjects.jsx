import { useState, useEffect } from 'react'
import { BookOpen, Plus, Trash2, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'

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
          <h1>Subjects</h1>
          <p>Manage your enrolled courses and view course details.</p>
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
            description="Add your first subject to unlock attendance tracking, timetable scheduling, and assignment management."
            actionLabel="Add Subject"
            onAction={() => setModalOpen(true)}
          />
        </Card>
      ) : (
        <div className="subjects-grid">
          {subjects.map((sub) => (
            <Card key={sub.id} className="subject-card">
              <div className="subject-card-header">
                <Badge variant="neutral" size="sm">
                  {sub.code}
                </Badge>
                <div className="subject-card-actions">
                  <button
                    type="button"
                    className="icon-action-btn danger"
                    onClick={() => setDeleteConfirmId(sub.id)}
                    aria-label={`Delete ${sub.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h2 className="subject-name">{sub.name}</h2>

              <div className="subject-card-footer">
                <Link to={`/attendance`} className="subject-link">
                  <span>Track Attendance</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
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
              Save Subject
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="form-vertical">
          <div className="form-group">
            <label htmlFor="sub-name" className="form-label">
              Subject Name
            </label>
            <input
              id="sub-name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Operating Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sub-code" className="form-label">
              Subject Code
            </label>
            <input
              id="sub-code"
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS203"
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
        title="Delete Subject"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Keep Subject
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="confirm-delete-text">
          Are you sure you want to delete this subject? This will also remove its associated attendance record, assignments, and timetable slots.
        </p>
      </Modal>
    </div>
  )
}

export default Subjects
