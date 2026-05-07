export default function PageSidebar({ pages, activePageId, onSelectPage, onAddPage }) {
  return (
    <aside className="sidebar">
      <h2>EduPress</h2>
      <button onClick={onAddPage}>+ Chapter</button>
      <ul>
        {pages.map((page) => (
          <li key={page.id} className={activePageId === page.id ? 'active' : ''} onClick={() => onSelectPage(page.id)}>
            {page.title || 'Untitled'}
          </li>
        ))}
      </ul>
    </aside>
  );
}