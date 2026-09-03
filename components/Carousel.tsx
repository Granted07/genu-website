"use client";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const items = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1761882835101-02ab45ac0726?auto=format&fit=crop&q=80&w=690",
    title: "MAXX PHAM",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1661980494567-40a5e01b699b?auto=format&fit=crop&q=80&w=685",
    title: "BOXIEN BAY",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1761882725885-d3d8bd2032d1?auto=format&fit=crop&q=80&w=687",
    title: "AUSIZE MAM",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1761775915848-467e41c1c4db?auto=format&fit=crop&q=80&w=689",
    title: "RECLKTIKA",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1761078980679-e89e25fe279b?auto=format&fit=crop&q=80&w=687",
    title: "SONYPOO",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1760389005000-bf02bf24f463?auto=format&fit=crop&q=80&w=1123",
    title: "DONM FLY",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1761165307495-56bd564d322f?auto=format&fit=crop&q=80&w=663",
    title: "Snowy Mountain Highway",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1756299792672-157811bf1005?auto=format&fit=crop&q=80&w=1074",
    title: "FOGGY FOLS",
  },
];

export default function Carousel() {
  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (!carouselRef.current) return;

      setWidth(
        carouselRef.current.scrollWidth - carouselRef.current.offsetWidth,
      );
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <motion.div
        ref={carouselRef}
        drag="x"
        dragConstraints={{
          left: -width,
          right: 0,
        }}
        dragElastic={0.15}
        whileDrag={{ scale: 0.98 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        style={{
          display: "flex",
          cursor: "grab",
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            style={{
              minWidth: "320px",
              height: "500px",
              padding: "8px",
              flexShrink: 0,
            }}
          >
            <img
              src={item.url}
              alt={item.title}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
