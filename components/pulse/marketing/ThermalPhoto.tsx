import Image from 'next/image';

/** Original photographs with an SVG luminance palette. No thermal data is measured. */
export function ThermalFilters() {
  return <svg className="thermal-definitions" aria-hidden="true" width="0" height="0"><defs><filter id="pulse-thermal" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="table" tableValues="0.08 0.17 0.08 0 0.25 0.95 1 1 1" /><feFuncG type="table" tableValues="0 0.02 0.12 0.5 0.9 1 0.85 0.3 0.1" /><feFuncB type="table" tableValues="0.3 0.8 1 1 0.5 0 0 0.05 0.4" /></feComponentTransfer></filter></defs></svg>;
}
export function ThermalPhoto({ image, alt, priority = false }: { image: string; alt: string; priority?: boolean }) {
  return <div className="thermal-photo"><Image src={`/images/${image}.webp`} alt={alt} fill sizes={priority ? '(max-width: 767px) 54vw, 25vw' : '(max-width: 767px) 90vw, 50vw'} preload={priority} className="photo-natural" /><div className="photo-heat" aria-hidden="true"><Image src={`/images/${image}.webp`} alt="" fill sizes="(max-width: 767px) 90vw, 50vw" /></div></div>;
}
export function ThermalWord() {
  return <span className="thermal-word" aria-hidden="true">{'RYVO'.split('').map((letter, index) => <span className="hero-line" key={index}><span>{letter}</span></span>)}</span>;
}
