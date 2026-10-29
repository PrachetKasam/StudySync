import { Loader2 } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon" />
      ) : null}
      <span className="btn-text">{children}</span>
    </button>
  )
}

export default Button
