import Button from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon" aria-hidden="true">
          <Icon size={40} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <div className="empty-state-action">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
