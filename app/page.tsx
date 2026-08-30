"use client";

import { Anton, Playfair_Display, Space_Mono } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Mic,
  Quote,
  Radio,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

import Noise from "@/components/Noise";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Type                                                               */
/* ------------------------------------------------------------------ */

const anton = Anton({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Deterministic "randomness" so server + client render identically  */
/* ------------------------------------------------------------------ */

function seeded(seed: number, salt = 1) {
  const value = Math.sin(seed * salt * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function seededRange(seed: number, salt: number, min: number, max: number) {
  return min + seeded(seed, salt) * (max - min);
}

/* ------------------------------------------------------------------ */
/*  Content — the crux of Generation Uprising                         */
/* ------------------------------------------------------------------ */

const tickerItems = [
  "EVIDENCE SPEAKS LOUDER",
  "REBELLION LOOKS LIKE HER",
  "NEWS BITES THAT BITE BACK",
  "CIVIC AWARENESS IS NOT OPTIONAL",
  "TURN UP THE DISSENT",
  "A GENERATION IS NOT WAITING",
];

const pillars = [
  {
    id: "believe",
    label: "What we believe",
    body: "Apathy is manufactured, not inherited. Every young person handed the truth, plainly and without a filter, becomes ungovernable in the best possible way.",
  },
  {
    id: "do",
    label: "What we do",
    body: "We investigate, we report, we broadcast, and we organize — turning courtroom transcripts and policy footnotes into stories a 19-year-old will actually stop scrolling for.",
  },
  {
    id: "want",
    label: "What we want",
    body: "A generation that treats civic literacy like a survival skill, and treats silence — in classrooms, courtrooms, and comment sections — as the actual scandal.",
  },
];

type Vertical = {
  label: string;
  tag: string;
  tagline: string;
  description: string;
  href: string;
  icon: typeof FileText;
  accent: string;
};

const verticals: Vertical[] = [
  {
    label: "Case Files",
    tag: "INVESTIGATIONS",
    tagline: "Evidence speaks louder.",
    description:
      "Long-form dossiers on the systems young people are told to accept quietly — courts, campuses, and the fine print of power.",
    href: "/case-files",
    icon: FileText,
    accent: "#ff3b30",
  },
  {
    label: "Daughters of Dissent",
    tag: "FIELD REPORTS",
    tagline: "Rebellion looks like her.",
    description:
      "Frontline dispatches from young women rewriting what resistance is allowed to look like.",
    href: "/daughters-of-dissent",
    icon: Users,
    accent: "#ffd23f",
  },
  {
    label: "Signals",
    tag: "RAPID BRIEFS",
    tagline: "News bites that bite back.",
    description:
      "Fast, sharp reads on the headlines shaping your civic life — no spin, no filler, no patience for either.",
    href: "/signals",
    icon: Radio,
    accent: "#3fb8ff",
  },
  {
    label: "Hall of Noise",
    tag: "AUDIO DISPATCH",
    tagline: "Turn up the dissent.",
    description:
      "Audio dispatches on landmark cases, dissenting opinions, and the politics quietly shaping tomorrow.",
    href: "/hall-of-noise",
    icon: Mic,
    accent: "#c084fc",
  },
];

const stats = [
  { label: "States reached", value: 19, ring: 76 },
  { label: "Case files filed", value: 64, ring: 58 },
  { label: "Signals published", value: 312, ring: 92 },
  { label: "Volunteer reporters", value: 87, ring: 64 },
];

const growthLabels = ["FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"];
const growthData = [12, 18, 22, 31, 40, 52, 68, 91];

const radarData = [
  { label: "Investigations", value: 82 },
  { label: "Field Reports", value: 68 },
  { label: "Rapid Briefs", value: 94 },
  { label: "Audio", value: 42 },
  { label: "Community", value: 75 },
];

/* ------------------------------------------------------------------ */
/*  Kokonut-style primitives — animated, interactive components       */
/* ------------------------------------------------------------------ */

function MagneticButton({
  children,
  onClick,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const handleMove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.94 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

function SpotlightPanel({
  children,
  className,
  color = "255, 59, 48",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const background = useTransform([mx, my], (latest) => {
    const [lx, ly] = latest as number[];
    return `radial-gradient(320px circle at ${lx}% ${ly}%, rgba(${color}, 0.22), transparent 72%)`;
  });

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((event.clientX - rect.left) / rect.width) * 100);
    my.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn("group relative overflow-hidden", className)}
    >
      <motion.div
        aria-hidden
        style={{ backgroundImage: background }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  );
}

function DragMarquee({
  items,
  className,
  textClassName,
  speed = 42,
}: {
  items: string[];
  className?: string;
  textClassName?: string;
  speed?: number;
}) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const halfWidth = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (trackRef.current) {
      halfWidth.current = trackRef.current.scrollWidth / 2;
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (dragging || halfWidth.current === 0) return;
    const next = x.get() - (speed * delta) / 1000;
    if (next <= -halfWidth.current) {
      x.set(next + halfWidth.current);
    } else {
      x.set(next);
    }
  });

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={trackRef}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100000, right: 100000 }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
        className="flex w-max cursor-grab items-center gap-10 whitespace-nowrap active:cursor-grabbing"
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={cn(
              "flex items-center gap-10 select-none",
              textClassName,
            )}
          >
            {item}
            <span className="text-[#ff3b30]">///</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function useCountUp(target: number, duration = 1.4) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  };

  return { value, start };
}

/* ------------------------------------------------------------------ */
/*  Bklit-style composable charts, built for GenU's palette            */
/* ------------------------------------------------------------------ */

function ImpactAreaChart() {
  const width = 640;
  const height = 240;
  const padding = 28;
  const max = Math.max(...growthData) * 1.15;

  const points = growthData.map((value, index) => {
    const px =
      padding + (index / (growthData.length - 1)) * (width - padding * 2);
    const py = height - padding - (value / max) * (height - padding * 2);
    return { x: px, y: py, value };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - padding
  } L ${points[0].x} ${height - padding} Z`;

  const [hovered, setHovered] = useState<number | null>(null);

  const handleMove = (event: ReactMouseEvent<SVGRectElement>) => {
    const rect = (event.target as SVGRectElement).getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const ratio = relX / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHovered(Math.min(Math.max(index, 0), points.length - 1));
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Signals published, month over month"
      >
        <title>Signals published growth chart</title>
        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={padding}
            x2={width - padding}
            y1={padding + fraction * (height - padding * 2)}
            y2={padding + fraction * (height - padding * 2)}
            stroke="rgba(243,239,228,0.08)"
            strokeDasharray="4 6"
          />
        ))}

        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill="url(#area-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="#ff3b30"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.4, ease }}
        />

        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hovered === index ? 6 : 3.5}
            fill="#0a0a08"
            stroke="#ff3b30"
            strokeWidth={2}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 + index * 0.05 }}
          />
        ))}

        {hovered !== null && (
          <line
            x1={points[hovered].x}
            x2={points[hovered].x}
            y1={padding}
            y2={height - padding}
            stroke="rgba(243,239,228,0.25)"
          />
        )}

        <rect
          x={padding}
          y={0}
          width={width - padding * 2}
          height={height}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        />
      </svg>

      <div className="mt-2 flex justify-between px-1 text-[0.6rem] uppercase tracking-[0.3em] text-[#f3efe4]/40">
        {growthLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {hovered !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute top-0 rounded-md border border-[#ff3b30]/40 bg-[#0a0a08] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[#f3efe4] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{
            left: `${(points[hovered].x / width) * 100}%`,
            transform: "translate(-50%, -8px)",
          }}
        >
          {growthLabels[hovered]} — {points[hovered].value} signals
        </motion.div>
      )}
    </div>
  );
}

function RadarChart() {
  const size = 260;
  const center = size / 2;
  const maxRadius = size / 2 - 34;
  const total = radarData.length;

  const pointFor = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * maxRadius * ratio,
      y: center + Math.sin(angle) * maxRadius * ratio,
    };
  };

  const dataPoints = radarData.map((item, index) =>
    pointFor(index, item.value / 100),
  );
  const dataPath = `${dataPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")} Z`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[280px] overflow-visible"
      role="img"
      aria-label="Content focus across GenU verticals"
    >
      <title>Editorial focus radar</title>
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={Array.from({ length: total })
            .map((_, index) => {
              const point = pointFor(index, ratio);
              return `${point.x},${point.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(243,239,228,0.1)"
        />
      ))}

      {radarData.map((_, index) => {
        const point = pointFor(index, 1);
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="rgba(243,239,228,0.1)"
          />
        );
      })}

      <motion.path
        d={dataPath}
        fill="rgba(255,59,48,0.28)"
        stroke="#ff3b30"
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {radarData.map((item, index) => {
        const labelPoint = pointFor(index, 1.28);
        return (
          <text
            key={item.label}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#f3efe4]/50 font-mono"
            fontSize={8}
            letterSpacing={1}
          >
            {item.label.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

function StatRing({
  value,
  ring,
  label,
}: {
  value: number;
  ring: number;
  label: string;
}) {
  const { value: displayed, start } = useCountUp(value);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      onViewportEnter={() => start()}
      viewport={{ once: true, amount: 0.6 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-[#f3efe4]/10 bg-[#f3efe4]/[0.03] p-6 text-center"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-24 w-24 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(243,239,228,0.1)"
            strokeWidth={6}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#ff3b30"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{
              strokeDashoffset: circumference * (1 - ring / 100),
            }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.2, ease }}
          />
        </svg>
        <span className={cn(anton.className, "relative text-2xl")}>
          {displayed}+
        </span>
      </div>
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#f3efe4]/55">
        {label}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Corkboard card                                                     */
/* ------------------------------------------------------------------ */

function VerticalCard({
  vertical,
  index,
  boardRef,
  onNavigate,
}: {
  vertical: Vertical;
  index: number;
  boardRef: RefObject<HTMLDivElement | null>;
  onNavigate: (href: string) => void;
}) {
  const rotate = seededRange(index + 1, 3.7, -4, 4);
  const Icon = vertical.icon;

  return (
    <motion.div
      drag
      dragConstraints={boardRef}
      dragElastic={0.18}
      whileDrag={{ scale: 1.04, zIndex: 30, cursor: "grabbing" }}
      initial={{ opacity: 0, y: 30, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3, ease } }}
      transition={{ duration: 0.7, delay: index * 0.08, ease }}
      style={{ touchAction: "none" }}
      className="group relative flex cursor-grab flex-col gap-5 rounded-sm border border-[#f3efe4]/12 bg-[#12110d] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.45)] active:cursor-grabbing"
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-black/40 shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
        style={{ backgroundColor: vertical.accent }}
      />

      <SpotlightPanel className="flex flex-1 flex-col gap-5 rounded-sm">
        <div className="flex items-center justify-between">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border"
            style={{
              borderColor: `${vertical.accent}55`,
              color: vertical.accent,
            }}
          >
            <Icon size={18} />
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-[#f3efe4]/40">
            {vertical.tag}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className={cn(anton.className, "text-2xl uppercase leading-none")}>
            {vertical.label}
          </h3>
          <p
            className={cn(
              playfair.className,
              "text-sm italic text-[#f3efe4]/70",
            )}
          >
            {vertical.tagline}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-[#f3efe4]/55">
          {vertical.description}
        </p>

        <button
          type="button"
          onClick={() => onNavigate(vertical.href)}
          className="mt-auto flex items-center gap-2 self-start font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#f3efe4] transition-colors group-hover:text-[#ff3b30]"
        >
          Enter
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </button>
      </SpotlightPanel>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState(pillars[0].id);

  return (
    <div
      className={cn(
        mono.className,
        "relative min-h-screen w-full overflow-x-clip bg-[#0a0a08] text-[#f3efe4] selection:bg-[#ff3b30] selection:text-[#0a0a08]",
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.3] mix-blend-overlay">
        <Noise patternAlpha={9} patternRefreshInterval={3} />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* HERO                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="relative flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden px-6 pt-36 pb-16 sm:px-10 lg:px-16">
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          className="pointer-events-none object-cover opacity-20 grayscale"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,48,0.14),_rgba(10,10,8,0.96)_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,8,0.55),rgba(10,10,8,0.97))]" />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[8%] select-none overflow-hidden opacity-[0.06]"
        >
          <motion.p
            initial={{ x: "0%" }}
            animate={{ x: "-33%" }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className={cn(
              anton.className,
              "whitespace-nowrap text-[16vw] uppercase leading-none tracking-tight",
            )}
          >
            UPRISING UPRISING UPRISING UPRISING
          </motion.p>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.4em] text-[#f3efe4]/55"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff3b30]" />
              Live dispatch — Vol. 04
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
              animate={{ opacity: 1, rotate: -8, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="rounded-full border-2 border-[#ff3b30] px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-[#ff3b30]"
            >
              Not Neutral
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
            {/* <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="font-mono text-sm uppercase tracking-[0.55em] text-[#f3efe4]/50"
            >
              Generation Uprising presents
            </motion.p> */}

            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.2, ease }}
                className={cn(
                  anton.className,
                  "text-[clamp(3.2rem,12vw,9rem)] uppercase leading-[0.82] tracking-tight",
                )}
              >
                Gen
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.32, ease }}
                className={cn(
                  anton.className,
                  "text-[clamp(3.2rem,12vw,9rem)] uppercase leading-[0.82] tracking-tight text-transparent",
                )}
                style={{ WebkitTextStroke: "2px #f3efe4" }}
              >
                Uprising
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease }}
              className="max-w-xl text-balance text-base leading-relaxed text-[#f3efe4]/70 sm:text-lg"
            >
              A youth-led movement turning civic apathy into evidence,
              broadcast, and collective action — because a generation this
              online has no excuse to be this uninformed.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <MagneticButton
              onClick={() => router.push("/case-files")}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f3efe4] px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-[#0a0a08] shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
            >
              Read the Case Files
              <ArrowRight size={14} />
            </MagneticButton>
            <MagneticButton
              onClick={() => router.push("/sponsors")}
              className="flex items-center justify-center gap-2 rounded-full border border-[#f3efe4]/30 bg-transparent px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-[#f3efe4]"
            >
              Back the Movement
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.4em] text-[#f3efe4]/40">
            Scroll
          </span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px bg-[#f3efe4]/40"
          />
        </motion.div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* TICKER                                                     */}
      {/* ---------------------------------------------------------- */}
      <div className="relative z-10 border-y border-[#f3efe4]/10 bg-[#ff3b30] py-3">
        <DragMarquee
          items={tickerItems}
          textClassName={cn(
            mono.className,
            "text-xs font-bold uppercase tracking-[0.3em] text-[#0a0a08]",
          )}
        />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* MANIFESTO                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="relative z-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease }}
            className="relative rounded-sm border border-[#f3efe4]/12 bg-[#12110d] p-8 sm:p-12"
          >
            <Quote className="mb-6 text-[#ff3b30]" size={32} />
            <p
              className={cn(
                playfair.className,
                "text-balance text-2xl italic leading-snug sm:text-3xl",
              )}
            >
              We are not here to make you feel comfortable about the state of
              things. We are here to make you impossible to ignore.
            </p>
            <div className="mt-8 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[#f3efe4]/45">
              <ShieldAlert size={14} />
              The GenU editorial line
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {pillars.map((pillar) => (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillar(pillar.id)}
                  className={cn(
                    "relative rounded-full px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.25em] transition-colors",
                    activePillar === pillar.id
                      ? "text-[#0a0a08]"
                      : "text-[#f3efe4]/55 hover:text-[#f3efe4]",
                  )}
                >
                  {activePillar === pillar.id && (
                    <motion.span
                      layoutId="pillar-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#f3efe4]"
                    />
                  )}
                  <span className="relative z-10">{pillar.label}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={activePillar}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="min-h-[9rem] rounded-sm border border-[#f3efe4]/12 bg-[#f3efe4]/[0.03] p-7 text-sm leading-relaxed text-[#f3efe4]/70 sm:text-base"
            >
              {pillars.find((pillar) => pillar.id === activePillar)?.body}
            </motion.div>

            <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#f3efe4]/40">
              <Sparkles size={14} className="text-[#ff3b30]" />
              Founded by students who stopped waiting for permission
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* VERTICALS — corkboard                                      */}
      {/* ---------------------------------------------------------- */}
      <section className="relative z-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto mb-14 flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.4em] text-[#ff3b30]">
              The desk
            </p>
            <h2
              className={cn(
                anton.className,
                "text-[clamp(2.4rem,6vw,4.2rem)] uppercase leading-[0.9]",
              )}
            >
              Four ways in
            </h2>
          </div>
          {/* <p className="max-w-sm text-sm text-[#f3efe4]/50">
            Every card below is pinned, not framed — drag it around, then click
            through to the full desk.
          </p> */}
        </div>

        <div
          ref={boardRef}
          className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 rounded-lg border border-dashed border-[#f3efe4]/10 p-6 sm:grid-cols-2 sm:p-10"
        >
          {verticals.map((vertical, index) => (
            <VerticalCard
              key={vertical.label}
              vertical={vertical}
              index={index}
              boardRef={boardRef}
              onNavigate={(href) => router.push(href)}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* IMPACT — data visuals                                      */}
      {/* ---------------------------------------------------------- */}
      <section className="relative z-10 border-y border-[#f3efe4]/10 bg-[#0d0c09] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto mb-14 w-full max-w-6xl">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.4em] text-[#ff3b30]">
            Receipts
          </p>
          <h2
            className={cn(
              anton.className,
              "text-[clamp(2.4rem,6vw,4.2rem)] uppercase leading-[0.9]",
            )}
          >
            The movement, in numbers
          </h2>
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatRing
              key={stat.label}
              value={stat.value}
              ring={stat.ring}
              label={stat.label}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#f3efe4]/10 bg-[#f3efe4]/[0.03] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-[#f3efe4]/60">
                Signals published, by month
              </h3>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#ff3b30]">
                +658% YTD
              </span>
            </div>
            <ImpactAreaChart />
          </div>

          <div className="rounded-2xl border border-[#f3efe4]/10 bg-[#f3efe4]/[0.03] p-6 sm:p-8">
            <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[#f3efe4]/60">
              Editorial focus
            </h3>
            <RadarChart />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CTA FOOTER                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="relative z-10 overflow-hidden px-6 py-28 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none opacity-[0.08]">
          <DragMarquee
            items={["JOIN THE UPRISING"]}
            speed={70}
            textClassName={cn(
              anton.className,
              "text-[9vw] uppercase leading-none",
            )}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
          <span className="rounded-full border border-[#f3efe4]/20 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-[#f3efe4]/60">
            No permission slips required
          </span>
          <h2
            className={cn(
              anton.className,
              "text-[clamp(2.6rem,7vw,5rem)] uppercase leading-[0.9]",
            )}
          >
            Your generation.
            <br />
            Your evidence.
          </h2>
          <p className="max-w-lg text-sm text-[#f3efe4]/55 sm:text-base">
            Write for Case Files, report for Signals, or just help us reach
            the next state. Every uprising needs hands, not just hashtags.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <MagneticButton
              onClick={() => router.push("/sponsors")}
              className="flex items-center justify-center gap-2 rounded-full bg-[#ff3b30] px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-[#0a0a08] shadow-[0_18px_40px_rgba(255,59,48,0.25)]"
            >
              Know More
            </MagneticButton>
            <MagneticButton
              onClick={() => router.push("/signals")}
              className="flex items-center justify-center gap-2 rounded-full border border-[#f3efe4]/30 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-[#f3efe4]"
            >
              Read Signals
              <ArrowRight size={14} />
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
