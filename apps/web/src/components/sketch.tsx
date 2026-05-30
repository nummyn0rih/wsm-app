import type { CSSProperties, ReactNode } from 'react';

/* Sketch-атомы — TS-порт Box/Pill из reference/project/Wireframes.html.
   Caveat — глобальный шрифт (index.css), поэтому отдельный Label не нужен. */

export function SkBox({
  children, gray, onClick, title, style, className = '',
}: {
  children?: ReactNode; gray?: boolean; onClick?: () => void; title?: string;
  style?: CSSProperties; className?: string;
}) {
  return (
    <div
      onClick={onClick}
      title={title}
      className={`sk-box ${gray ? 'sk-gray' : ''} ${className}`}
      style={{ overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  );
}

/* Кнопка-плашка тулбара: sk-box со стандартными отступами, опц. зелёная/активная. */
export function SkButton({
  children, onClick, title, green, active, disabled, style,
}: {
  children: ReactNode; onClick?: () => void; title?: string;
  green?: boolean; active?: boolean; disabled?: boolean; style?: CSSProperties;
}) {
  const bg = green ? 'var(--accent)' : active ? '#e2d4f0' : '#fff';
  const bd = green ? 'var(--accent-dark)' : active ? '#5530a0' : '#333';
  const fg = green ? '#fff' : active ? '#5530a0' : '#222';
  return (
    <SkBox
      gray
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{
        padding: '4px 11px', cursor: disabled ? 'not-allowed' : 'pointer',
        background: bg, borderColor: bd, color: fg, fontWeight: 600,
        opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {children}
    </SkBox>
  );
}

/* Цветная пилюля «сырьё/итог» — точка + текст, фон по сырью. */
export function ColorPill({
  bg, dot, children, size,
}: { bg?: string; dot?: string; children: ReactNode; size?: number }) {
  return (
    <span className="pill" style={{ background: bg ?? '#eee', fontSize: size }}>
      {dot && <span className="dot" style={{ background: dot }} />}
      {children}
    </span>
  );
}
