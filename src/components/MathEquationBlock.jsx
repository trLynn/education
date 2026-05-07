import { useEffect, useRef, useState } from 'react';

export default function MathEquationBlock({ value, onChange }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const tick = () => {
      if (window.customElements?.get('math-field')) {
        setLoaded(true);
      } else {
        setTimeout(tick, 150);
      }
    };
    tick();
  }, []);

  useEffect(() => {
    if (!loaded || !ref.current) return;
    ref.current.value = value || '';
  }, [loaded, value]);

  useEffect(() => {
    if (!loaded || !ref.current) return;
    const mf = ref.current;
    mf.inlineShortcuts = {
      ...mf.inlineShortcuts,
      root: '\\sqrt[#?]{#?}',
      sq: '\\sqrt{#?}',
      '^': '^{(#?)}',
    };
    const handler = (e) => onChange(e.target.value);
    mf.addEventListener('input', handler);
    return () => mf.removeEventListener('input', handler);
  }, [loaded, onChange]);

  if (!loaded) return <div className="math-preview">Loading math editor…</div>;

  return <math-field ref={ref} className="math-input" placeholder="Type equation here" />;
}