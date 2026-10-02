"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type TeamCoreProps = {
  /** Number of orbiting nodes — one per seat. */
  seats?: number;
};

const RED = 0xff3b30;
const PAPER = 0xf3efe4;

/**
 * Decorative WebGL centrepiece: a wireframe core with one node orbiting per
 * seat. Purely visual (aria-hidden) — all real content lives in the DOM.
 * Degrades to nothing if WebGL is unavailable, stays static under
 * prefers-reduced-motion, and pauses while offscreen or in a hidden tab.
 */
export function TeamCore({ seats = 7 }: TeamCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 8;

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    const rig = new THREE.Group();
    scene.add(rig);

    const shell = new THREE.LineSegments(
      track(
        new THREE.WireframeGeometry(
          track(new THREE.IcosahedronGeometry(1.5, 1)),
        ),
      ),
      track(
        new THREE.LineBasicMaterial({
          color: RED,
          transparent: true,
          opacity: 0.6,
        }),
      ),
    );
    rig.add(shell);

    const core = new THREE.Mesh(
      track(new THREE.OctahedronGeometry(0.7, 0)),
      track(
        new THREE.MeshBasicMaterial({
          color: PAPER,
          wireframe: true,
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );
    rig.add(core);

    const orbit = new THREE.Group();
    orbit.rotation.x = 0.4;
    rig.add(orbit);

    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.7, 0.006, 8, 160)),
      track(
        new THREE.MeshBasicMaterial({
          color: PAPER,
          transparent: true,
          opacity: 0.3,
        }),
      ),
    );
    ring.rotation.x = Math.PI / 2;
    orbit.add(ring);

    const nodeGeometry = track(new THREE.SphereGeometry(0.09, 16, 16));
    const nodeMaterial = track(new THREE.MeshBasicMaterial({ color: RED }));
    const nodes = Array.from({ length: seats }, () => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      orbit.add(node);
      return node;
    });

    const haloCount = 500;
    const haloPositions = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i += 1) {
      const radius = 3.2 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      haloPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      haloPositions[i * 3 + 1] = radius * Math.cos(phi);
      haloPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const haloGeometry = track(new THREE.BufferGeometry());
    haloGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(haloPositions, 3),
    );
    const halo = new THREE.Points(
      haloGeometry,
      track(
        new THREE.PointsMaterial({
          color: PAPER,
          size: 0.02,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    rig.add(halo);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const draw = (time: number) => {
      const t = time * 0.001;
      shell.rotation.y = t * 0.25;
      shell.rotation.x = t * 0.12;
      core.rotation.y = -t * 0.4;
      core.rotation.z = t * 0.2;
      halo.rotation.y = t * 0.03;
      nodes.forEach((node, index) => {
        const angle = t * 0.22 + (index / seats) * Math.PI * 2;
        node.position.set(
          Math.cos(angle) * 2.7,
          Math.sin(angle * 2 + index) * 0.25,
          Math.sin(angle) * 2.7,
        );
      });
      rig.rotation.y += (pointer.x * 0.35 - rig.rotation.y) * 0.04;
      rig.rotation.x += (pointer.y * 0.2 - rig.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };

    let frame = 0;
    let running = false;
    let inView = true;

    const tick = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduceMotion.matches || !inView || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (reduceMotion.matches) {
        stop();
        draw(0);
      } else {
        start();
      }
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 1 ? 11 : 8;
      camera.updateProjectionMatrix();
      if (!running) draw(performance.now());
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (inView) start();
      else stop();
    });
    visibilityObserver.observe(canvas);

    const onVisibilityChange = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibilityChange);
    reduceMotion.addEventListener("change", sync);

    sync();

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reduceMotion.removeEventListener("change", sync);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      for (const item of disposables) item.dispose();
      renderer.dispose();
    };
  }, [seats]);

  return (
    <canvas ref={canvasRef} className="pointer-events-none h-full w-full" />
  );
}
