import Link from 'next/link';
export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="RYVO home">
      <span>RYVO</span>
    </Link>
  );
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M3 12h17m-7-7 7 7-7 7" />}
    </svg>
  );
}
