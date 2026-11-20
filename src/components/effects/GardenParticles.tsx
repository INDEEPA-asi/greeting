import { useEffect, useRef } from 'react';

export function GardenParticles({ color, hidden, reduced, petals = false }: { color: string; hidden: boolean; reduced: boolean; petals?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || hidden || reduced) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const count = window.innerWidth < 600 ? 13 : 28;
    const dots = Array.from({ length: count }, (_, index) => ({
      x: Math.random(), y: Math.random(), radius: Math.random() * 1.8 + .34,
      angle: Math.random() * Math.PI * 2, speed: .000012 + Math.random() * .000035,
      petal: petals && index % 5 === 0,
    }));
    let width = 0;
    let height = 0;
    let previous = 0;
    let frame = 0;
    function resize() {
      if (!canvas || !context) return;
      const dpr = Math.min(1.4, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(time: number) {
      if (!context) return;
      frame = requestAnimationFrame(draw);
      if (previous && time - previous < 30) return;
      const elapsed = Math.min(65, time - (previous || time));
      previous = time;
      context.clearRect(0, 0, width, height);
      dots.forEach((dot) => {
        dot.y = (dot.y + elapsed * dot.speed * (dot.petal ? 1 : -.55) + 1) % 1;
        dot.x = (dot.x + elapsed * dot.speed * .22) % 1;
        context.globalAlpha = .18 + (.5 + .5 * Math.sin(time / 900 + dot.angle)) * (dot.petal ? .19 : .45);
        context.fillStyle = dot.petal ? '#e4a2b8' : color;
        context.beginPath();
        context.ellipse(dot.x * width, dot.y * height, dot.radius * (dot.petal ? 2.8 : 1), dot.radius, dot.angle + time / 4000, 0, Math.PI * 2);
        context.fill();
      });
    }
    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, width, height);
    };
  }, [color, hidden, petals, reduced]);

  return <canvas ref={ref} className="garden-particles" aria-hidden="true" />;
}
