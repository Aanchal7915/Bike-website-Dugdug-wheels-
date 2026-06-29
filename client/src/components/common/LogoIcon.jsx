export default function LogoIcon({ size = 60 }) {
  return (
    <svg height={size} width={size} viewBox="0 0 46 46" style={{ display: 'block' }}>
      <circle cx="23" cy="23" r="21" stroke="#E53935" strokeWidth="2.5" fill="none" />
      <circle cx="23" cy="23" r="13" stroke="#E53935" strokeWidth="1" fill="none" opacity="0.35" />
      <circle cx="23" cy="23" r="4" fill="#E53935" />
      <line x1="23" y1="2" x2="23" y2="44" stroke="#E53935" strokeWidth="1.2" />
      <line x1="2" y1="23" x2="44" y2="23" stroke="#E53935" strokeWidth="1.2" />
      <line x1="8" y1="8" x2="38" y2="38" stroke="#E53935" strokeWidth="1.2" />
      <line x1="38" y1="8" x2="8" y2="38" stroke="#E53935" strokeWidth="1.2" />
    </svg>
  );
}
