export default function LogoIcon({ size = 60 }) {
  return (
    <img 
      src="/DUG DUG.png" 
      alt="DUGDUG WHEELS" 
      style={{ height: `${size * 1.5}px`, width: `${size * 1.5}px`, display: 'block', objectFit: 'contain' }} 
    />
  );
}
