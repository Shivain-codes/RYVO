type RuleProps = {
  label?: string;
};

export function Rule({ label }: RuleProps) {
  return (
    <div className="pulse-rule" role={label ? 'separator' : undefined} aria-label={label}>
      <span aria-hidden="true" />
      {label ? <span className="pulse-rule__label">{label}</span> : null}
    </div>
  );
}
