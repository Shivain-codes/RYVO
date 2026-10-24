type SignalBadgeTone = 'info' | 'success' | 'warning' | 'error';

type SignalBadgeProps = {
  status: string;
  description?: string;
  tone?: SignalBadgeTone;
};

export function SignalBadge({ status, description, tone = 'info' }: SignalBadgeProps) {
  return (
    <div className={`signal-badge signal-badge--${tone}`} role="status">
      <span className="signal-badge__dot" aria-hidden="true" />
      <span className="signal-badge__status">{status}</span>
      {description ? <span className="signal-badge__description">{description}</span> : null}
    </div>
  );
}
