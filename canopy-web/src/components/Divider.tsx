interface DividerProps {
  onDragStart: (e: React.MouseEvent) => void;
}

export function Divider({ onDragStart }: DividerProps) {
  return (
    <div className="divider" onMouseDown={onDragStart}>
      <div className="divider-handle" />
    </div>
  );
}
