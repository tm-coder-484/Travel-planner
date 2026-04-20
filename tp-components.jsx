// Shared UI components for Travel Planner
// Exports to window: Btn, Input, Textarea, Modal, Badge, Spinner, ConfirmDialog

const tpColors = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  border: '#E5E5E2',
  borderHover: '#CBCBC6',
  text: '#1C1C1A',
  textMuted: '#7A7A74',
  accent: '#4A72C0',
  accentLight: '#EEF2FA',
  danger: '#C0504A',
  dangerLight: '#FAEEED',
  success: '#4A9C6B',
  successLight: '#EDF7F2',
};

function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    fontWeight: 500, borderRadius: 8, transition: 'all 0.15s ease',
    opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
  };
  const sizes = { sm: { fontSize: 12, padding: '5px 10px' }, md: { fontSize: 13, padding: '8px 14px' }, lg: { fontSize: 14, padding: '10px 18px' } };
  const variants = {
    primary: { background: tpColors.accent, color: '#fff' },
    secondary: { background: tpColors.surface, color: tpColors.text, border: `1px solid ${tpColors.border}` },
    ghost: { background: 'transparent', color: tpColors.textMuted },
    danger: { background: tpColors.dangerLight, color: tpColors.danger, border: `1px solid ${tpColors.danger}22` },
  };
  const [hovered, setHovered] = React.useState(false);
  const hoverStyles = hovered && !disabled ? {
    primary: { background: '#3B60AD' },
    secondary: { borderColor: tpColors.borderHover, background: tpColors.bg },
    ghost: { background: tpColors.bg, color: tpColors.text },
    danger: { background: '#F5DEDE' },
  }[variant] || {} : {};

  return (
    <button
      type={type}
      style={{ ...base, ...sizes[size], ...variants[variant], ...hoverStyles, ...style }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{children}</button>
  );
}

function Input({ value, onChange, placeholder, type = 'text', style, autoFocus, onKeyDown, label, id }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: tpColors.textMuted }} htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        style={{
          fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
          border: `1px solid ${tpColors.border}`, borderRadius: 7,
          background: tpColors.surface, color: tpColors.text, outline: 'none',
          transition: 'border-color 0.15s', ...style,
        }}
        onFocus={e => e.target.style.borderColor = tpColors.accent}
        onBlur={e => e.target.style.borderColor = tpColors.border}
      />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3, style, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: tpColors.textMuted }}>{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
          border: `1px solid ${tpColors.border}`, borderRadius: 7,
          background: tpColors.surface, color: tpColors.text, outline: 'none',
          resize: 'vertical', ...style,
        }}
        onFocus={e => e.target.style.borderColor = tpColors.accent}
        onBlur={e => e.target.style.borderColor = tpColors.border}
      />
    </div>
  );
}

function Modal({ title, children, onClose, width = 480, footer }) {
  React.useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(28,28,26,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: tpColors.surface, borderRadius: 12, width, maxWidth: '90vw',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${tpColors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: tpColors.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tpColors.textMuted, fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: `1px solid ${tpColors.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: { bg: tpColors.accentLight, text: tpColors.accent },
    green: { bg: tpColors.successLight, text: tpColors.success },
    red: { bg: tpColors.dangerLight, text: tpColors.danger },
    gray: { bg: '#F0F0EC', text: tpColors.textMuted },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.text, letterSpacing: '0.02em' }}>
      {children}
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm" onClose={onCancel} width={360}
      footer={<><Btn variant="secondary" onClick={onCancel}>Cancel</Btn><Btn variant="danger" onClick={onConfirm}>Delete</Btn></>}
    >
      <p style={{ margin: 0, fontSize: 14, color: tpColors.text }}>{message}</p>
    </Modal>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 36, opacity: 0.25 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: tpColors.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: tpColors.textMuted, maxWidth: 280 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// Formatters
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDateShort(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function tripDuration(start, end) {
  if (!start || !end) return '';
  const a = new Date(start), b = new Date(end);
  const days = Math.round((b - a) / 86400000) + 1;
  return days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '';
}

Object.assign(window, { Btn, Input, Textarea, Modal, Badge, ConfirmDialog, EmptyState, tpColors, formatDate, formatDateShort, tripDuration });
