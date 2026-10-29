import { Megaphone } from 'lucide-react'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'

export function Notices() {
  return (
    <div className="notices-page">
      <div className="page-header">
        <div>
          <h1>Department Notices</h1>
          <p>Official circulars, exam notifications, and campus bulletins.</p>
        </div>
      </div>
      <Card className="p-8">
        <EmptyState
          icon={Megaphone}
          title="No Unread Notices"
          description="Check back regularly for announcements regarding exam schedules and campus operations."
        />
      </Card>
    </div>
  )
}

export default Notices
