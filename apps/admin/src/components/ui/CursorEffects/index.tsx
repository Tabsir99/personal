import { useEffect, useRef, useState } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
  }
  
  export const ParticleTrail = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
  
    useEffect(() => {
      let particleId = 0;
  
      const handleMouseMove = (e: MouseEvent) => {
        const newParticle = {
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
        };
  
        setParticles((prev) => [...prev, newParticle]);
  
        // Remove particle after animation completes
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 1000);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
  
    return (
      <div className="pointer-events-none fixed inset-0 z-50">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute h-2 w-2 rounded-full bg-blue-400/60"
            style={{
              left: particle.x,
              top: particle.y,
              animation: "particleFade 1s ease-out forwards",
            }}
          />
        ))}
      </div>
    );
  };
  
  export const CometTrail = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const points = useRef<{ x: number; y: number }[]>([]);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      const handleMouseMove = (e: MouseEvent) => {
        points.current.push({ x: e.clientX, y: e.clientY });
        if (points.current.length > 20) points.current.shift(); // Keep last 20 points
      };
  
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        if (points.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points.current[0].x, points.current[0].y);
  
          for (let i = 1; i < points.current.length; i++) {
            ctx.lineTo(points.current[i].x, points.current[i].y);
          }
  
          ctx.strokeStyle = "rgba(96, 165, 250, 0.5)";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();
        }
  
        requestAnimationFrame(animate);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      animate();
  
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
  
    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
      />
    );
  };
  
  export const MagneticCursor = () => {
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const magneticElements = document.querySelectorAll("[data-magnetic]");
  
        magneticElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
  
          const deltaX = (e.clientX - centerX) * 0.2;
          const deltaY = (e.clientY - centerY) * 0.2;
  
          (
            el as HTMLElement
          ).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
      };
  
      const handleMouseLeave = () => {
        const magneticElements = document.querySelectorAll("[data-magnetic]");
        magneticElements.forEach((el) => {
          (el as HTMLElement).style.transform = "translate(0, 0)";
        });
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
  
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, []);
  
    return null;
  };
  
  export const BlobCursor = () => {
    const blobRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const blobPos = useRef({ x: 0, y: 0 });
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
      };
  
      const animate = () => {
        // Smooth follow with easing
        blobPos.current.x += (mousePos.current.x - blobPos.current.x) * 0.1;
        blobPos.current.y += (mousePos.current.y - blobPos.current.y) * 0.1;
  
        if (blobRef.current) {
          blobRef.current.style.transform = `translate(${
            blobPos.current.x - 20
          }px, ${blobPos.current.y - 20}px)`;
        }
  
        requestAnimationFrame(animate);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      animate();
  
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
  
    return (
      <div
        ref={blobRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-14 w-14 rounded-full bg-blue-400/30 blur-xl"
      />
    );
  };
  