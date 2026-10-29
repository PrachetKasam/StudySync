import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  Check,
  RotateCcw,
} from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SkeletonLoader from '../components/common/SkeletonLoader'

export function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [saving, setSaving] = useState(false)

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const toast = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assRes, subRes] = await Promise.all([
        api.get('/api/assignments'),
        api.get('/api/subjects'),
      ])
      if (assRes.success) setAssignments(assRes.data)
      if (subRes.success) {
        setSubjects(subRes.data)
        if (subRes.data.length > 0 && !subjectId) {
          setSubjectId(String(subRes.data[0].id))
        }
      }
    } catch (err) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(search.toLowerCase())) ||
        (a.subjectName && a.subjectName.toLowerCase().includes(search.toLowerCase())) ||
        (a.subjectCode && a.subjectCode.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && a.status === 'Pending') ||
        (statusFilter === 'Completed' && a.status === 'Completed')
      return matchesSearch && matchesStatus
    })
  }, [assignments, search, statusFilter])

  const pendingCount = useMemo(() => assignments.filter((a) => a.status === 'Pending').length, [assignments])
  const completedCount = useMemo(() => assignments.filter((a) => a.status === 'Completed').length, [assignments])

  const handleToggleStatus = async (assignment) => {
    const nextStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      const res = await api.patch(`/api/assignments/${assignment.id}`, { status: nextStatus })
      if (res.success) {
        toast.success(nextStatus === 'Completed' ? 'Assignment marked as completed!' : 'Assignment moved back to pending')
        setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? res.data : a)))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !subjectId || !dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/api/assignments', {
        title: title.trim(),
        description: description.trim(),
        subjectId: Number(subjectId),
        dueDate: new Date(dueDate).toISOString(),
        priority,
      })
      if (res.success) {
        toast.success('Assignment created successfully')
        setModalOpen(false)
        setTitle('')
        setDescription('')
        setDueDate('')
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/api/assignments/${id}`)
      if (res.success) {
        toast.success('Assignment deleted')
        setDeleteConfirmId(null)
        setAssignments((prev) => prev.filter((a) => a.id !== id))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment')
    }
  }

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>Organize deadlines, prioritize tasks, and keep your semester coursework on track.</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            icon={Plus}
            disabled={subjects.length === 0}
            onClick={() => setModalOpen(true)}
          >
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-search-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, subject, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search assignments"
          />
        </div>

        <div className="status-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'All'}
            className={`status-tab ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All <span className="tab-count-badge">{assignments.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'Pending'}
            className={`status-tab ${statusFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending <span className="tab-count-badge">{pendingCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'Completed'}
            className={`status-tab ${statusFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Completed')}
          >
            Completed <span className="tab-count-badge">{completedCount}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : assignments.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={ClipboardList}
            title="No assignments recorded"
            description={
              subjects.length === 0
                ? 'Add at least one subject before creating assignments.'
                : 'Create your first assignment to track deadlines, homework, and lab reports.'
            }
            actionLabel={subjects.length > 0 ? 'Add Assignment' : 'Add Subject First'}
            onAction={() => {
              if (subjects.length > 0) setModalOpen(true)
              else window.location.href = '/subjects'
            }}
          />
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Search}
            title="No matching assignments"
            description={`No assignments matched "${search}" in "${statusFilter}".`}
            actionLabel="Reset Search"
            onAction={() => {
              setSearch('')
              setStatusFilter('All')
            }}
          />
        </Card>
      ) : (
        <div className="assignments-list-grid">
          {filteredAssignments.map((a) => {
            const isCompleted = a.status === 'Completed'
            return (
              <Card
                key={a.id}
                className={`assignment-card-item priority-stripe-${a.priority.toLowerCase()} ${
                  a.isOverdue && !isCompleted ? 'assignment-card-overdue' : ''
                } ${isCompleted ? 'assignment-card-completed' : ''}`}
              >
                <div>
                  <div className="assignment-item-header">
                    <div className="header-tags">
                      <Badge variant="neutral" size="sm">
                        {a.subjectCode || a.subjectName}
                      </Badge>
                      <Badge
                        variant={
                          a.priority === 'High'
                            ? 'danger'
                            : a.priority === 'Medium'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {a.priority}
                      </Badge>
                    </div>
                    <div className="header-alerts">
                      {isCompleted ? (
                        <Badge variant="success" size="sm">Completed</Badge>
                      ) : (
                        <>
                          {a.isOverdue && <Badge variant="danger" size="sm">Overdue</Badge>}
                          {!a.isOverdue && a.isDueSoon && <Badge variant="warning" size="sm">Due Soon</Badge>}
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className={`assignment-title ${isCompleted ? 'line-through' : ''}`}>
                    {a.title}
                  </h3>

                  {a.description && (
                    <p className={`assignment-desc ${isCompleted ? 'line-through' : ''}`}>
                      {a.description}
                    </p>
                  )}
                </div>

                <div className="assignment-item-footer">
                  <div className="footer-due">
                    <Calendar size={14} />
                    <span>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'No due date'}
                    </span>
                  </div>

                  <div className="footer-actions">
                    <button
                      type="button"
                      className={`btn-toggle-status ${isCompleted ? 'btn-completed' : 'btn-pending'}`}
                      onClick={() => handleToggleStatus(a)}
                      title={isCompleted ? 'Mark as pending' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <>
                          <Check size={14} />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Complete</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="icon-action-btn danger"
                      onClick={() => setDeleteConfirmId(a.id)}
                      aria-label={`Delete assignment ${a.title}`}
                      title="Delete assignment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Assignment"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>
              Create Assignment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="form-vertical">
          <div className="form-group">
            <label htmlFor="modal-ass-title" className="form-label">
              Assignment Title
            </label>
            <input
              id="modal-ass-title"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Problem Set 3 or Term Paper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="modal-ass-subject" className="form-label">
                Subject
              </label>
              <select
                id="modal-ass-subject"
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modal-ass-priority" className="form-label">
                Priority
              </label>
              <select
                id="modal-ass-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="modal-ass-due" className="form-label">
              Due Date & Time
            </label>
            <input
              id="modal-ass-due"
              type="datetime-local"
              required
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-ass-desc" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="modal-ass-desc"
              rows={3}
              className="form-textarea"
              placeholder="Include submission portal links, chapters to read, or grading rubrics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>
              Delete Assignment
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

export default Assignments
