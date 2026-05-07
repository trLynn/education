export default function BlockEditor({ block, onUpdate, onDelete }) {
  return (
    <div className="block">
      <div className="block-head">
        <strong>{block.type.toUpperCase()}</strong>
        <button onClick={() => onDelete(block.id)}>Delete</button>
      </div>

      {block.type === 'text' && (
        <textarea value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="Type text..." />
      )}
      {block.type === 'math' && (
        <input value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="LaTeX math" />
      )}
      {block.type === 'html' && (
        <textarea value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="HTML/CSS/JS" />
      )}
      {['video', 'slide'].includes(block.type) && (
        <input value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="Embed URL" />
      )}
    </div>
  );
}