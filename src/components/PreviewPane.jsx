function extractYouTubeId(url = '') {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function PreviewPane({ blocks }) {
  return (
    <section className="preview">
      {blocks.map((block) => {
        if (block.type === 'text') return <p key={block.id}>{block.content}</p>;
        if (block.type === 'math') return <pre key={block.id} className="math-preview">{block.content}</pre>;
        if (block.type === 'html') return <iframe key={block.id} title={block.id} srcDoc={block.content} className="preview-frame" />;
        if (block.type === 'video') {
          const yt = extractYouTubeId(block.content);
          return yt ? <iframe key={block.id} className="preview-frame" src={`https://www.youtube.com/embed/${yt}`} title={block.id} /> : null;
        }
        if (block.type === 'slide') return <iframe key={block.id} className="preview-frame" src={block.content} title={block.id} />;
        return null;
      })}
    </section>
  );
}