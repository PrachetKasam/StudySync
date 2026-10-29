import { Calendar, Plus } from 'lucide-react'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'

export function Events() {
  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h1>College Events</h1>
          <p>Campus seminars, hackathons, academic fairs, and holiday schedules.</p>
        </div>
      </div>
      <Card className="p-8">
        <EmptyState
          icon={Calendar}
          title="Campus Events Calendar"
          description="Upcoming events announced by your department and student organizations will appear here."
        />
      </Card>
    </div>
  )
}

export default Events
