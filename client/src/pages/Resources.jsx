import { Library } from 'lucide-react'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'

export function Resources() {
  return (
    <div className="resources-page">
      <div className="page-header">
        <div>
          <h1>Academic Resources</h1>
          <p>Lecture slides, syllabus PDFs, textbook references, and library links.</p>
        </div>
      </div>
      <Card className="p-8">
        <EmptyState
          icon={Library}
          title="Digital Resource Vault"
          description="Access reference materials and course syllabi curated for your enrolled subjects."
        />
      </Card>
    </div>
  )
}

export default Resources
