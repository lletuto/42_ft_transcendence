'use client';

/*we buitl a componenent so that the errors are displayed correctly with their corresponding field, 
allowing for a reusable input component */

export default function InputBox({
  id,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  inputMode,
  autoComplete = "off",
}) {
  return (
    <div className="input-container">
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="input-box"
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}