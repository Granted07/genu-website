"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AudioLines, Headphones, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp } from "lucide-react"
import { Manrope, Playfair_Display } from "next/font/google"

import { cn } from "@/lib/utils"

type Track = {
  id: string
  title: string
  subtitle: string
  tags: string[]
  mood: string
  duration: string
  src: string
}

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

const generateWaveformSeeds = (count: number) =>
  Array.from({ length: count }, (_, trackIndex) =>
    Array.from({ length: 16 }, (_, barIndex) => 0.35 + (((barIndex + trackIndex) % 5) * 0.13))
  )

const floatingShapes = [
  "-top-24 left-[8%] h-40 w-40 rotate-[22deg] bg-white/8",
  "top-[28%] right-[10%] h-28 w-28 rotate-[-18deg] bg-amber-300/15",
  "bottom-[18%] left-[12%] h-20 w-20 rotate-[12deg] bg-white/10",
  "bottom-[-8%] right-[16%] h-32 w-32 rotate-[24deg] bg-white/12"
]

const defaultEasing = [0.19, 1, 0.22, 1] as [number, number, number, number]

const formatDateLabel = (value?: string | null) => {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value))
  } catch {
    return null
  }
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00"
  const clamped = Math.max(seconds, 0)
  const minutes = Math.floor(clamped / 60)
  const remaining = Math.floor(clamped % 60)
  return `${minutes}:${remaining.toString().padStart(2, "0")}`
}

export default function HallOfNoisePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevVolumeRef = useRef(0.8)
  const isScrubbingRef = useRef(false)

  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pause, setPause] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLabel, setTimeLabel] = useState("0:00")
  const [durationLabel, setDurationLabel] = useState("-")
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  const prefersReducedMotion = useReducedMotion()

  const waveformSeeds = useMemo(() => generateWaveformSeeds(tracks.length), [tracks.length])
  const currentTrack = tracks[currentTrackIndex]
  const isLoading = status === "loading"
  const hasTracks = tracks.length > 0
  const isCurrentMuted = isMuted || volume === 0

  const shellTargetWidth = "min(90vw,46rem)"
  const shellInitial = prefersReducedMotion
    ? { opacity: 0, minWidth: 0 }
    : { opacity: 0, minWidth: 0, y: 28, scale: 0.96 }
  const shellAnimate = prefersReducedMotion
    ? { opacity: 1, minWidth: shellTargetWidth }
    : { opacity: 1, minWidth: shellTargetWidth, y: 0, scale: 1 }
  const shellExit = prefersReducedMotion
    ? { opacity: 0, minWidth: 0 }
    : { opacity: 0, minWidth: 0, y: 28, scale: 0.95 }

  useEffect(() => {
    let active = true

    const loadTracks = async () => {
      if (!active) return

      setStatus("loading")
      setMessage(null)

      try {
        const response = await fetch("/api/hall-of-noise")
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const payload = await response.json()
        const rows = Array.isArray(payload?.data) ? payload.data : []
        if (!active) return

        const mapped = rows
          .filter((row: any) => row && typeof row.public_url === "string")
          .map((row: any, index: number) => {
            const baseId = row.uuid || row.id || row.file_path || `dispatch-${index}`
            const title = row.title || row.file_name || `Dispatch ${index + 1}`

            const dateLabel = formatDateLabel(row.created_at)
            const authorLabel = row.author ? `Filed by ${row.author}` : null
            const subtitleParts = [authorLabel, dateLabel ? `Released ${dateLabel}` : null].filter(Boolean)
            const subtitle = subtitleParts.join(" • ") || "Signal intercept from the movement archive."

            const mimeTail = typeof row.mime_type === "string" ? row.mime_type.split("/").pop() : null
            const rawTags = ["dispatch", mimeTail?.replace(/[-_]+/g, " "), row.author?.toString()]
              .filter((tag): tag is string => Boolean(tag))
            const tags = Array.from(new Set(rawTags)).slice(0, 3)

            const secondsValue = typeof row.duration_seconds === "number" ? row.duration_seconds : Number(row.duration_seconds)
            const hasSeconds = Number.isFinite(secondsValue) && secondsValue > 0
            const duration = hasSeconds
              ? formatTime(secondsValue)
              : typeof row.duration === "string"
                ? row.duration
                : "-"

            return {
              id: String(baseId),
              title,
              subtitle,
              tags,
              mood: (mimeTail || "dispatch").replace(/[-_]+/g, " "),
              duration,
              src: row.public_url as string
            } satisfies Track
          })

        setTracks(mapped)
        setCurrentTrackIndex(0)
        setPause(false)
        setIsPlaying(false)
        setHoveredTrack(null)
        setStatus("ready")
        setMessage(mapped.length === 0 ? "No transmissions yet. Check back soon." : null)
      } catch (error) {
        console.error(error)
        if (!active) return

        setTracks([])
        setCurrentTrackIndex(0)
        setPause(false)
        setIsPlaying(false)
        setHoveredTrack(null)
        setStatus("error")
        setMessage("Unable to reach the archive. Please try again in a moment.")
      }
    }

    loadTracks()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setCurrentTrackIndex((prev) => {
      if (tracks.length === 0) {
        return 0
      }
      return prev < tracks.length ? prev : 0
    })
  }, [tracks.length])

  useEffect(() => {
    const audio = audioRef.current
    const track = tracks[currentTrackIndex]
    if (!audio || !track) return

    audio.src = track.src
    audio.load()
    setProgress(0)
    setTimeLabel("0:00")
    setDurationLabel(track.duration ?? "-")
    setDurationSeconds(null)
  }, [currentTrackIndex, tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!tracks[currentTrackIndex]) return

    if (pause) {
      const playPromise = audio.play()
      if (playPromise) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setPause(false)
            
          })
      } else {
        setIsPlaying(true)
      }
    } else {
      audio.pause()
      
    }
  }, [pause, currentTrackIndex, tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoaded = () => {
      if (audio.duration) {
        setDurationLabel(formatTime(audio.duration))
        setDurationSeconds(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      if (isScrubbingRef.current || !audio.duration) return
      const nextProgress = audio.currentTime / audio.duration
      setProgress(nextProgress)
      setTimeLabel(formatTime(audio.currentTime))
    }

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => {
        if (tracks.length === 0) {
          return 0
        }
        return (prev + 1) % tracks.length
      })
      setPause(true)
    }

    audio.addEventListener("loadedmetadata", handleLoaded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [tracks.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      if (!isScrubbingRef.current && audio.duration) {
        const nextProgress = audio.currentTime / audio.duration
        setProgress(nextProgress)
        setTimeLabel(formatTime(audio.currentTime))
      }
      if (pause) {
        rafRef.current = requestAnimationFrame(update)
      }
    }

    if (pause) {
      rafRef.current = requestAnimationFrame(update)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [pause])

  useEffect(() => {
    const handleGlobalPlaybackToggle = (event: KeyboardEvent) => {
      const isMediaKey = event.code === "MediaPlayPause"
      const isSpaceKey = event.code === "Space" || event.key === " " || event.key === "Spacebar"

      if (!isMediaKey && !isSpaceKey) {
        return
      }

      if (event.defaultPrevented) {
        return
      }

      const target = event.target as HTMLElement | null
      if (event.repeat) {
        return
      }

      if (target) {
        const tagName = target.tagName.toLowerCase()
        if (["input", "textarea", "select", "button"].includes(tagName) || target.isContentEditable) {
          return
        }
      }

      event.preventDefault()
      setPause((prev) => !prev)
    }

    window.addEventListener("keydown", handleGlobalPlaybackToggle)
    return () => window.removeEventListener("keydown", handleGlobalPlaybackToggle)
  }, [setPause])

  useEffect(() => {
    if (!isPlaying) {
      setExpanded(false)
    }
  }, [isPlaying])


  const handleSelectTrack = (index: number) => {
    if (!tracks[index]) {
      return
    }
    if (index === currentTrackIndex) {
      setPause((prev) => !prev)
      setIsPlaying(true)
      setTimeout(() => {
        setExpanded(true)
      }, 500)
      return
    }
    setCurrentTrackIndex(index)
    setIsPlaying(true)
    setTimeout(() => {
      setExpanded(true)
    }, 500)
    setPause(true)
    setIsPlaying(true)
  }

  const clampFraction = (value: number) => Math.min(Math.max(value, 0), 1)

  const handleScrub = (value: number) => {
    isScrubbingRef.current = true
    setIsScrubbing(true)
    setProgress(value)
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const newTime = clampFraction(value) * audio.duration
    setTimeLabel(formatTime(newTime))
  }

  const commitScrub = (value: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) {
      isScrubbingRef.current = false
      setIsScrubbing(false)
      return
    }
    const clamped = clampFraction(value)
    audio.currentTime = clamped * audio.duration
    setTimeLabel(formatTime(audio.currentTime))
    isScrubbingRef.current = false
    setIsScrubbing(false)
    setProgress(clamped)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (value > 0) {
      prevVolumeRef.current = value
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.5
      setVolume(restored)
      setIsMuted(false)
    } else {
      prevVolumeRef.current = volume
      setIsMuted(true)
    }
  }

  const playNext = () => {
    if (tracks.length === 0) return
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    setPause(true)
    setIsPlaying(true)
  }

  const playPrevious = () => {
    if (tracks.length === 0) return
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setPause(true)
    setIsPlaying(true)
  }

  return (
    <div
      className={cn(
        manrope.className,
        "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(5,5,5,0.94)_55%)] text-white"
      )}
    >
      <audio ref={audioRef} preload="metadata" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.72),rgba(8,8,8,0.96))]" />

      {floatingShapes.map((classes, index) => (
        <motion.div
          key={classes}
          className={cn("pointer-events-none absolute z-0 rounded-[22%] blur-[1px]", classes)}
          initial={{ opacity: 0.25, scale: 0.8 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.35, scale: 1 }
              : {
                  opacity: [0.25, 0.6, 0.3],
                  scale: [0.9, 1.05, 0.95]
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 12 + index * 2, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

  <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-24 pt-20 sm:gap-14 sm:px-6 sm:pb-28 sm:pt-24 md:gap-16 md:px-10 md:pb-32 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: defaultEasing }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.62rem] uppercase tracking-[0.45em] text-white/70 backdrop-blur">
            <Headphones size={14} />
            Hall of Noise
          </span>
          <h1
            className={cn(
              playfair.className,
              "text-balance text-[clamp(2.9rem,7.5vw,4.8rem)] font-semibold uppercase leading-[0.88]"
            )}
          >
            Hall of Noise
          </h1>
          <p className="max-w-2xl text-sm uppercase tracking-[0.4em] text-white/65">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit et reprehenderit nam ex culpa praesentium dicta mollitia architecto sed beatae recusandae consequuntur debitis reiciendis, quidem illum possimus, veritatis in distinctio?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-[0.68rem] uppercase tracking-[0.35em] text-white/70">
            <span className="rounded-full border border-white/20 px-4 py-2">Field recordings</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Dispatch briefs</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Spoken word</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.15, duration: 0.7, ease: defaultEasing }}
          className="grid gap-6 sm:gap-8 md:grid-cols-2"
        >
          {isLoading && !hasTracks &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/10 p-5 sm:rounded-[1.8rem] sm:p-7"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(120deg,transparent_0,transparent_18px,rgba(255,255,255,0.05)_18px,rgba(255,255,255,0.05)_20px)] opacity-30" />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="h-3 w-16 rounded-full bg-white/15" />
                    <span className="h-3 w-24 rounded-full bg-white/15" />
                  </div>
                  <div className="space-y-4">
                    <span className="block h-5 w-3/4 rounded-full bg-white/18" />
                    <span className="block h-3 w-24 rounded-full bg-white/12" />
                    <span className="block h-12 w-full rounded-xl bg-white/10" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="h-6 w-20 rounded-full bg-white/12" />
                    <span className="h-6 w-16 rounded-full bg-white/12" />
                    <span className="h-6 w-14 rounded-full bg-white/12" />
                  </div>
                  <div className="mt-4 flex h-9 items-end gap-1 sm:mt-5 sm:h-10" aria-hidden="true">
                    {Array.from({ length: 16 }).map((__, barIndex) => (
                      <span
                        key={`wave-skeleton-${index}-${barIndex}`}
                        className="block h-full w-1 origin-bottom rounded-full bg-white/15"
                        style={{ transform: `scaleY(${0.35 + (barIndex % 4) * 0.1})` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {hasTracks && tracks.map((track, index) => {
            const isActive = index === currentTrackIndex
            const isHovered = hoveredTrack === track.id
            const trackWaveform = waveformSeeds[index] ?? []

            return (
              <motion.button
                key={track.id}
                type="button"
                className={cn(
                  "group relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/10 p-5 text-left transition-colors backdrop-blur focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:rounded-[1.8rem] sm:p-7",
                  isActive ? "border-white/35 bg-white/15" : "hover:border-white/25 hover:bg-white/12"
                )}
                onClick={() => handleSelectTrack(index)}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                aria-pressed={isActive}
                aria-label={`Cue ${track.title}`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(120deg,transparent_0,transparent_18px,rgba(255,255,255,0.08)_18px,rgba(255,255,255,0.08)_20px)] opacity-20 transition-opacity group-hover:opacity-40" />
                <div className="pointer-events-none absolute inset-[12px] rounded-[1.3rem] border border-white/10 sm:inset-[14px] sm:rounded-[1.4rem]" />

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.35em] text-white/60 sm:text-[0.62rem]">
                    <span>{track.duration}</span>
                    <span className="flex items-center gap-2">
                      <AudioLines size={14} />
                      {track.mood}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className={cn(playfair.className, "text-[1.65rem] font-semibold uppercase leading-tight")}>{track.title}</h3>
                    <p className="text-sm uppercase tracking-[0.35em] text-white/55">Track {index + 1}</p>
                    <p className="text-sm leading-relaxed text-white/70">{track.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/65">
                    {track.tags.map((tag) => (
                      <span key={`${track.id}-${tag}`} className="rounded-full bg-white/12 px-3 py-1">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-4 flex h-9 items-end gap-1 sm:mt-5 sm:h-10" aria-hidden="true">
                    {trackWaveform.map((seed, barIndex) => (
                      <motion.span
                        key={`${track.id}-bar-${barIndex}`}
                        className="block h-full w-1 origin-bottom rounded-full bg-white/60"
                        animate={
                          prefersReducedMotion
                            ? { scaleY: 0.4 + seed * (isActive ? 0.55 : 0.3) }
                            : {
                                scaleY:
                                  isActive && pause
                                    ? [0.45 + seed * 0.55, 0.75 + seed * 0.7, 0.4 + seed * 0.5]
                                    : 0.45 + seed * (isActive ? 0.6 : isHovered ? 0.4 : 0.28)
                              }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.5 + barIndex * 0.015, repeat: isActive && pause ? Infinity : 0, repeatType: "mirror" }
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.35em] text-white/60">
                    <span>{isActive ? (pause ? "Playing" : "Paused") : "Tap to cue"}</span>
                    {isActive && (
                      <span className="rounded-full border border-white/30 px-3 py-1">
                        Live feed
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {message && (
          <div className="rounded-[1.6rem] border border-white/12 bg-white/5 px-6 py-4 text-center text-sm uppercase tracking-[0.3em] text-white/65">
            {message}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="hall-of-noise-shell"
            initial={shellInitial}
            animate={shellAnimate}
            exit={shellExit}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: defaultEasing }}
            className="fixed bottom-3 left-1/2 z-30 flex w-full max-w-[min(90vw,46rem)] -translate-x-1/2 flex-col gap-3 rounded-[1.8rem] border border-white/15 bg-[rgba(12,12,12,0.85)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur sm:bottom-6 sm:gap-4 sm:rounded-[2.2rem] sm:p-6"
            style={{ overflow: "hidden" }}
            aria-live="polite"
          >
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="hover:cursor-pointer flex w-fit items-center justify-center self-center rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:border-white/30 hover:bg-white/10"
              aria-expanded={expanded}
              aria-controls="hall-of-noise-player-panel"
            >
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: defaultEasing }}
                className="flex"
              >
                <ChevronUp size={18} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="hall-of-noise-player"
                  id="hall-of-noise-player-panel"
                  initial={prefersReducedMotion ? undefined : { height: 0, opacity: 1 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: defaultEasing }}
                  className="flex flex-col gap-4 overflow-hidden sm:gap-5"
                >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">
                <span>{currentTrack.title}</span>
                <span>{durationLabel}</span>
              </div>

              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">{timeLabel}</span>
                <div className="relative w-full flex-1 min-w-0">
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    value={Math.round(progress * 1000)}
                    onChange={(event) => {
                      const fraction = Number(event.currentTarget.value) / 1000
                      handleScrub(fraction)
                    }}
                    onMouseUp={(event) => {
                      const fraction = Number(event.currentTarget.value) / 1000
                      commitScrub(fraction)
                    }}
                    onTouchEnd={(event) => {
                      const fraction = Number(event.currentTarget.value) / 1000
                      commitScrub(fraction)
                    }}
                    onPointerUp={(event) => {
                      const fraction = Number(event.currentTarget.value) / 1000
                      commitScrub(fraction)
                    }}
                    onPointerCancel={(event) => {
                      const fraction = Number(event.currentTarget.value) / 1000
                      commitScrub(fraction)
                    }}
                    aria-label="Playback position"
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-900/40 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[6px] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-900/40"
                  />
                  <motion.span
                    className="pointer-events-none absolute left-0 top-1/2 h-1.5 rounded-full bg-white"
                    animate={{ width: `${progress * 100}%` }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "tween", duration: isScrubbing ? 0 : 0.2 }}
                  />
                </div>
                <span className="text-[0.58rem] uppercase tracking-[0.35em] text-white/55 sm:text-[0.65rem]">
                  {durationSeconds != null ? formatTime(Math.max(durationSeconds - progress * durationSeconds, 0)) : "0:00"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="max-sm:hidden flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left sm:gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-12 sm:w-12">
                    <Headphones size={20} />
                  </div>
                  <div className="flex flex-col text-[0.62rem] uppercase tracking-[0.35em] text-white/60 sm:text-[0.7rem]">
                    <span>Hall of Noise</span>
                    <span className="text-white/40">Track {currentTrackIndex + 1} of {tracks.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white sm:gap-4">
                  <button
                    type="button"
                    onClick={playPrevious}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                    aria-label="Play previous track"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPause((prev) => !prev)}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white text-neutral-900 transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-16 sm:w-16"
                    aria-label={pause ? "Pause" : "Play"}
                    aria-keyshortcuts="Space"
                  >
                    {pause ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    type="button"
                    onClick={playNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                    aria-label="Play next track"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>

                <div className="hidden items-center gap-2.5 text-white sm:flex sm:gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/35 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:h-11 sm:w-11"
                    aria-label={isCurrentMuted ? "Unmute" : "Mute"}
                  >
                    {isCurrentMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((isCurrentMuted ? 0 : volume) * 100)}
                    onChange={(event) => handleVolumeChange(Number(event.target.value) / 100)}
                    aria-label="Volume"
                    className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/20 accent-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[0.65rem] [&::-webkit-slider-thumb]:w-[0.65rem] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-900/40 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[5px] [&::-moz-range-thumb]:h-[0.65rem] [&::-moz-range-thumb]:w-[0.65rem] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-900/40 sm:w-28"
                  />
                </div>
              </div>
            </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
