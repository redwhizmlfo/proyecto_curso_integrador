export default function FieldValidationHint({
  value,
  isValid,
  validMessage,
  invalidMessage,
  maxLength,
  unit = 'caracteres',
  limitLabel,
}) {
  const hasValue = String(value ?? '').trim().length > 0;
  if (!hasValue) return null;

  const valid = isValid(value);
  const currentLength = String(value ?? '').length;
  const counterLabel = limitLabel || (maxLength ? `${currentLength}/${maxLength} ${unit}` : '');

  return (
    <div className={`field-validation-hint ${valid ? 'valid' : 'invalid'}`}>
      <span>{valid ? validMessage : invalidMessage}</span>
      {counterLabel ? (
        <strong>{counterLabel}</strong>
      ) : null}
    </div>
  );
}
