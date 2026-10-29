export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', title, subtitle, action }) {
  if (title || subtitle || action) {
    return (
      <div className={`card-header ${className}`}>
        <div>
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="card-action">{action}</div>}
      </div>
    )
  }
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>
}

export default Card
