"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AmbientSignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const points = 900;
    const positions = new Float32Array(points * 3);
    for (let index = 0; index < points; index += 1) {
      const angle = index * 0.42;
      const radius = 0.35 + (index / points) * 2.8;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle * 1.37) * radius * 0.45;
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#ff3b30",
      size: 0.018,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const field = new THREE.Points(geometry, material);
    scene.add(field);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    const render = () => {
      field.rotation.z += 0.0008;
      field.rotation.y = Math.sin(frame * 0.0003) * 0.15;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
