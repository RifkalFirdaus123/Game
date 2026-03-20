import React, { useEffect, useMemo, useRef, useState } from "react";
import { IdulfitriDecorationsV2, PixelTransition } from "./components";
import { getLinkTemplate, updateLinkTemplate } from "./lib/supabase";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const ADMIN_USERNAME = "aku";
const ADMIN_PASSWORD = "123";

function GameContainer({ title, subtitle, timerBar, children }) {
  return (
    <div className="min-h-[100dvh] w-full overscroll-y-contain touch-manipulation flex flex-col">
      <div className="flex-1 max-w-md mx-auto px-4 py-4 sm:py-6 w-full flex flex-col justify-center">
        <div className="gauntlet-enter rounded-2xl border border-emerald-500/20 bg-white/85 backdrop-blur shadow-[0_0_0_1px_rgba(16,185,129,0.18)]">
          <div className="p-4 sm:p-5 border-b border-emerald-900/10">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.35)]" />
              <div className="flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight">{title}</div>
                {subtitle ? (
                  <div className="mt-1 text-sm sm:text-base text-zinc-700">{subtitle}</div>
                ) : null}
              </div>
            </div>
            {timerBar ? <div className="mt-4">{timerBar}</div> : null}
          </div>
          <div className="p-4 sm:p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function TimerBar({ durationMs, timerKey, label }) {
  const displaySeconds = Math.ceil(durationMs / 1000);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-700">
        <div className="font-semibold text-emerald-700/90">{label ?? "WAKTU"}</div>
        <div className="tabular-nums">{displaySeconds} dtk</div>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
        <div
          key={timerKey}
          className="timer-shrink-anim h-full w-full bg-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.45)]"
          style={{ animationDuration: `${durationMs}ms` }}
        />
      </div>
    </div>
  );
}

function StageShell({ stepLabel, timerBar, children }) {
  return (
    <div className="animate-[gauntlet-enter_220ms_ease-out_both]">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm sm:text-base text-zinc-700">{stepLabel}</div>
        <div className="h-2 w-2 rounded-full bg-emerald-600/80 shadow-[0_0_18px_rgba(16,185,129,0.35)]" />
      </div>
      {timerBar ? <div className="mb-4">{timerBar}</div> : null}
      {children}
    </div>
  );
}

function StartStage({ onStart, onAdmin }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-zinc-900">
        <div className="text-2xl sm:text-3xl font-black tracking-tight">
          Jadi ade 5 level ya ges yak
        </div>
        <p className="mt-3 text-sm sm:text-base text-zinc-700">
          main kan semue nye kalo sesai nanti daget nye di kirim ke email. kalo nda mau yaudah juga, ye bebas la
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full min-h-[4rem] rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.35)]"
      >
        Mulai Game sini
      </button>

      <button
        type="button"
        onClick={onAdmin}
        className="w-full min-h-[4rem] rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-500/20 active:scale-95 transition-transform font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.12)]"
      >
        🔐 Admin Panel khusus saye
      </button>

      <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
        silekan. 
      </div>
    </div>
  );
}

function ReactionStage({ onSuccess, onFail }) {
  const containerRef = useRef(null);
  const btnRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(true);
  const intervalRef = useRef(null);

  const REQUIRED_CLICKS = 8; // dibuat lebih sulit

  const [timeLeftMs, setTimeLeftMs] = useState(20000);
  const [clicks, setClicks] = useState(0);
  const [boost, setBoost] = useState(0); // visual feedback only
  const [roundKey, setRoundKey] = useState(0);

  const endRef = useRef(0);

  const stop = () => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  useEffect(() => {
    runningRef.current = true;

    let last = performance.now();
    const speed = 0.42; // px/ms (~420 px/s) - lebih agresif
    const state = {
      x: 0,
      y: 0,
      vx: (Math.random() < 0.5 ? -1 : 1) * speed,
      vy: (Math.random() < 0.5 ? -1 : 1) * speed,
      boundsW: 0,
      boundsH: 0
    };

    const measure = () => {
      const container = containerRef.current;
      const btn = btnRef.current;
      if (!container || !btn) return false;
      const c = container.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      state.boundsW = c.width - b.width;
      state.boundsH = c.height - b.height;
      state.x = clamp(Math.random() * Math.max(0, state.boundsW), 0, state.boundsW);
      state.y = clamp(Math.random() * Math.max(0, state.boundsH), 0, state.boundsH);
      return true;
    };

    const resetRound = () => {
      if (!runningRef.current) return;
      setClicks(0);
      setBoost(0);
      setTimeLeftMs(20000);
      setRoundKey((k) => k + 1);
      endRef.current = performance.now() + 20000;
      state.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
      state.vy = (Math.random() < 0.5 ? -1 : 1) * speed;
      measure();
    };

    resetRound();

    intervalRef.current = window.setInterval(() => {
      const left = Math.max(0, endRef.current - performance.now());
      setTimeLeftMs(left);
      if (left <= 0 && runningRef.current) {
        stop();
        onFail(); // timeout = permadeath
      }
    }, 50);

    const tick = () => {
      if (!runningRef.current) return;
      const current = performance.now();
      const dt = current - last;
      last = current;

      // In case fonts/layout changed after mount, keep bounds fresh occasionally.
      if (Math.random() < 0.02) measure();

      state.x += state.vx * dt;
      state.y += state.vy * dt;

      if (state.x <= 0) {
        state.x = 0;
        state.vx = Math.abs(state.vx);
      } else if (state.x >= state.boundsW) {
        state.x = state.boundsW;
        state.vx = -Math.abs(state.vx);
      }

      if (state.y <= 0) {
        state.y = 0;
        state.vy = Math.abs(state.vy);
      } else if (state.y >= state.boundsH) {
        state.y = state.boundsH;
        state.vy = -Math.abs(state.vy);
      }

      const btn = btnRef.current;
      if (btn) btn.style.transform = `translate(${state.x}px, ${state.y}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, [onFail]);

  const timeLabel = useMemo(() => {
    const sec = Math.ceil(timeLeftMs / 1000);
    return sec <= 0 ? "WAKTU" : `${sec}dtk`;
  }, [timeLeftMs]);

  const handleClick = () => {
    // If we're out of time, ignore taps (timeout effect will handle fail).
    if (performance.now() > endRef.current) return;

    setClicks((c) => {
      const next = c + 1;
      setBoost(next);
      if (next >= REQUIRED_CLICKS) {
        stop();
        onSuccess();
      }
      return next;
    });
  };

  return (
    <StageShell
      stepLabel="Tahap 1 / 5 — Reaksi"
      timerBar={<TimerBar durationMs={20000} timerKey={roundKey} label="20 dtk" />}
    >
      <div className="text-sm sm:text-base text-zinc-700">
        Klik tombol bergerak{" "}
        <span className="text-zinc-900 font-bold">{REQUIRED_CLICKS}</span> kali dalam{" "}
        <span className="text-emerald-700 font-black">20 detik</span>.
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full h-[280px] sm:h-[320px] select-none"
        >
          <button
            ref={btnRef}
            type="button"
            onClick={handleClick}
            className={[
              "absolute rounded-2xl bg-emerald-600",
              "min-h-[4rem] min-w-[4rem] px-4 py-3",
              "flex items-center justify-center",
              "active:scale-95 transition-transform",
              "font-black text-lg sm:text-xl shadow-[0_0_30px_rgba(16,185,129,0.35)]",
              boost > 0 ? "ring-2 ring-emerald-400/60" : ""
            ].join(" ")}
            aria-label="Target bergerak"
          >
            Klik
          </button>

          <div className="absolute inset-x-0 top-3 flex justify-between px-3 text-xs sm:text-sm text-zinc-700 pointer-events-none">
            <div>
              Tepat:{" "}
              <span className="text-zinc-900 font-bold">{clicks}</span>/{REQUIRED_CLICKS}
            </div>
            <div className="text-emerald-700">
              {timeLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/70 p-3">
          <div className="text-xs text-zinc-600">Target</div>
          <div className="text-lg font-black">{REQUIRED_CLICKS} klik</div>
        </div>
        <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/70 p-3">
          <div className="text-xs text-zinc-600">Status</div>
          <div className="text-lg font-black text-emerald-700">
            {clicks >= REQUIRED_CLICKS ? "SELESAI!" : "Kunci"}
          </div>
        </div>
      </div>
    </StageShell>
  );
}

function StroopStage({ onSuccess, onFail }) {
  const COLORS = useMemo(
    () => [
      { key: "RED", textClass: "text-red-500", buttonClass: "border-red-500/30" },
      { key: "BLUE", textClass: "text-blue-500", buttonClass: "border-blue-500/30" },
      { key: "GREEN", textClass: "text-green-500", buttonClass: "border-green-500/30" },
      { key: "YELLOW", textClass: "text-yellow-400", buttonClass: "border-yellow-400/30" }
    ],
    []
  );

  const COLOR_LABELS = useMemo(
    () => ({
      RED: "MERAH",
      BLUE: "BIRU",
      GREEN: "HIJAU",
      YELLOW: "KUNING"
    }),
    []
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [wordColor, setWordColor] = useState("RED");
  const [paintColor, setPaintColor] = useState("BLUE");
  const [options, setOptions] = useState(["RED", "BLUE", "GREEN", "YELLOW"]);
  const [timeLeftMs, setTimeLeftMs] = useState(3000);

  const roundTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (roundIndex >= 3) return;
    doneRef.current = false;

    const keys = COLORS.map((c) => c.key);
    const newWord = keys[Math.floor(Math.random() * keys.length)];

    let newPaint = keys[Math.floor(Math.random() * keys.length)];
    if (newPaint === newWord) {
      const other = keys.filter((k) => k !== newWord);
      newPaint = other[Math.floor(Math.random() * other.length)];
    }

    // Correct choice is the INK/text color (paintColor), not the word.
    const otherKeys = keys.filter((k) => k !== newPaint);
    const otherOptions = shuffleArray(otherKeys).slice(0, 3);
    const newOptions = shuffleArray([newPaint, ...otherOptions]);

    setWordColor(newWord);
    setPaintColor(newPaint);
    setOptions(newOptions);
    setTimeLeftMs(3000);

    if (roundTimeoutRef.current) window.clearTimeout(roundTimeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    const end = performance.now() + 3000;
    intervalRef.current = window.setInterval(() => {
      const left = Math.max(0, end - performance.now());
      setTimeLeftMs(left);
    }, 50);

    roundTimeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      if (doneRef.current) return;
      doneRef.current = true;
      onFail();
    }, 3000);

    return () => {
      if (roundTimeoutRef.current) window.clearTimeout(roundTimeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [roundIndex, COLORS, onFail]);

  const handleChoice = (choice) => {
    if (doneRef.current) return;
    if (choice !== paintColor) {
      doneRef.current = true;
      onFail();
      return;
    }

    setRoundIndex((i) => {
      const next = i + 1;
      if (next >= 3) {
        doneRef.current = true;
        onSuccess();
      }
      return next;
    });
  };

  const paintClass = COLORS.find((c) => c.key === paintColor)?.textClass ?? "text-red-500";

  const sec = Math.ceil(timeLeftMs / 1000);

  return (
    <StageShell
      stepLabel="Tahap 2 / 5 — Efek Stroop"
      timerBar={<TimerBar durationMs={3000} timerKey={roundIndex} label="3 dtk" />}
    >
      <div className="text-sm sm:text-base text-zinc-700">
        Putaran{" "}
        <span className="font-black text-zinc-900">
          {roundIndex + 1}/3
        </span>
        . Klik tombol dengan <span className="font-black text-zinc-900">TEKS</span> warna (tinta), bukan katanya.
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-4 sm:p-5">
          <div className="text-xs text-zinc-600 mb-2">
            Kata ditulis dengan warna berbeda (pilih tintanya)
          </div>
          <div
            className={[
              "text-4xl sm:text-5xl font-black tracking-tight",
              paintClass
            ].join(" ")}
            aria-label={`Warna tinta (ink) adalah ${COLOR_LABELS[paintColor] ?? paintColor}`}
          >
            {COLOR_LABELS[wordColor] ?? wordColor}
          </div>
          <div className="mt-2 text-sm text-zinc-700">
            Diwarnai: <span className={`font-black ${paintClass}`}>{COLOR_LABELS[paintColor] ?? paintColor}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const c = COLORS.find((x) => x.key === opt);
            const optTextClass = c?.textClass ?? "text-zinc-700";
            const borderClass = c?.buttonClass ?? "border-emerald-200/70";
            const isCorrect = opt === paintColor;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleChoice(opt)}
                className={[
                  "min-h-[4rem] rounded-xl border",
                  "w-full text-xl font-black",
                  "active:scale-95 transition-transform",
                  "bg-white/80 hover:bg-emerald-50/90",
                  borderClass,
                  isCorrect ? "shadow-[0_0_18px_rgba(16,185,129,0.25)]" : ""
                ].join(" ")}
              >
                <span className={optTextClass}>{COLOR_LABELS[opt] ?? opt}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-zinc-600">
          Waktu: <span className="text-emerald-700 font-black tabular-nums">{sec}dtk</span>
        </div>
      </div>
    </StageShell>
  );
}

function MathStage({ onSuccess, onFail }) {
  const [problems, setProblems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(20000);

  useEffect(() => {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Generate 3 math problems
    const genProblems = () => {
      const probs = [];
      for (let i = 0; i < 3; i++) {
        const op = Math.random() < 0.5 ? "+" : "-";
        let a, b;
        if (op === "+") {
          a = randInt(20, 80);
          b = randInt(10, 60);
        } else {
          b = randInt(10, 50);
          a = randInt(b + 5, 110); // pastikan hasil positif
        }
        const answer = op === "+" ? a + b : a - b;

        const wrongs = new Set();
        while (wrongs.size < 3) {
          const delta = randInt(-8, 8);
          const w = answer + delta;
          if (w !== answer && w >= 0 && w <= 200) wrongs.add(w);
        }

        const all = shuffleArray([answer, ...Array.from(wrongs)]);
        probs.push({ a, b, op, answer, choices: all });
      }
      return probs;
    };

    setProblems(genProblems());
    setCurrentIdx(0);
    setTimeLeftMs(20000);

    const end = performance.now() + 20000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, end - performance.now());
      setTimeLeftMs(left);
    }, 50);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      onFail();
    }, 20000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [onFail]);

  const currentProblem = problems[currentIdx];
  const sec = Math.ceil(timeLeftMs / 1000);

  const handleAnswer = (choice) => {
    if (!currentProblem) return;
    
    if (choice === currentProblem.answer) {
      // Jawaban benar
      if (currentIdx >= 2) {
        // Semua 3 soal benar
        onSuccess();
      } else {
        // Lanjut ke soal berikutnya
        setCurrentIdx(currentIdx + 1);
      }
    } else {
      // Jawaban salah
      onFail();
    }
  };

  if (!currentProblem) {
    return (
      <StageShell stepLabel="Tahap 3 / 5 — Matematika Cepat">
        <div>Loading...</div>
      </StageShell>
    );
  }

  return (
    <StageShell
      stepLabel={`Tahap 3 / 5 — Matematika Cepat (Soal ${currentIdx + 1}/3)`}
      timerBar={<TimerBar durationMs={20000} timerKey={0} label="20 dtk" />}
    >
      <div className="text-sm sm:text-base text-zinc-700">
        Jawab 3 soal cepat dalam 20 detik. Jawaban salah = kembali ke Tahap 1.
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-5">
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
          {currentProblem.a} {currentProblem.op} {currentProblem.b}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {currentProblem.choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleAnswer(c)}
            className="min-h-[4rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 active:scale-95 transition-transform border border-emerald-200/70 text-xl font-black"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200/70 p-3">
          <div className="text-xs text-zinc-600">Soal</div>
          <div className="text-lg font-black text-emerald-700">{currentIdx + 1} / 3</div>
        </div>
        <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200/70 p-3">
          <div className="text-xs text-zinc-600">Waktu</div>
          <div className="text-lg font-black text-emerald-700 tabular-nums">{sec}dtk</div>
        </div>
      </div>
    </StageShell>
  );
}

function MemoryStage({ onSuccess, onFail }) {
  const EMOJIS = useMemo(
    () => ["🔥", "⚡", "🍀", "👾", "🧠", "🩸", "💎", "🌀", "🎯", "🌙"],
    []
  );

  const [sequence, setSequence] = useState([]);
  const [mixed, setMixed] = useState([]);
  const [phase, setPhase] = useState("show"); // show | recall
  const [picked, setPicked] = useState([]); // clicked emoji list (in order)
  const [pickedIndices, setPickedIndices] = useState(new Set());

  const showTimeoutRef = useRef(null);

  useEffect(() => {
    const seq = Array.from({ length: 4 }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    const mixedList = shuffleArray(seq);
    setSequence(seq);
    setMixed(mixedList);
    setPhase("show");
    setPicked([]);
    setPickedIndices(new Set());

    showTimeoutRef.current = window.setTimeout(() => {
      setPhase("recall");
    }, 2000);

    return () => {
      if (showTimeoutRef.current) window.clearTimeout(showTimeoutRef.current);
    };
  }, [EMOJIS]);

  const handleEmojiClick = (idx) => {
    if (phase !== "recall") return;
    if (pickedIndices.has(idx)) return;

    const emoji = mixed[idx];
    const expected = sequence[picked.length];
    if (emoji !== expected) {
      onFail();
      return;
    }

    const nextPicked = [...picked, emoji];
    setPicked(nextPicked);
    const nextSet = new Set(pickedIndices);
    nextSet.add(idx);
    setPickedIndices(nextSet);

    if (nextPicked.length >= 4) onSuccess();
  };

  return (
    <StageShell stepLabel="Tahap 4 / 5 — Memori">
      <div className="text-sm sm:text-base text-zinc-700">
        {phase === "show"
          ? "Ingat 4 emoji ini. Kamu punya 2 detik."
          : "Klik sesuai urutan persis."}
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-5">
        {phase === "show" ? (
          <div className="flex items-center justify-between gap-3">
            {sequence.map((e, i) => (
              <div
                key={`${e}-${i}`}
                className="w-1/4 text-center text-4xl sm:text-5xl animate-pulse"
                aria-hidden="true"
              >
                {e}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {mixed.map((e, idx) => (
              <button
                key={`${e}-${idx}`}
                type="button"
                onClick={() => handleEmojiClick(idx)}
                disabled={pickedIndices.has(idx)}
                className={[
                  "min-h-[4rem] rounded-xl border text-3xl sm:text-4xl",
                  "active:scale-95 transition-transform",
                  pickedIndices.has(idx)
                    ? "bg-emerald-100/70 border-emerald-200/70 text-zinc-600"
                    : "bg-white/80 border-emerald-200/70 hover:bg-emerald-50/90 text-zinc-900"
                ].join(" ")}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-xs text-zinc-600 mb-2">Dikilik</div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`slot-${i}`}
              className={[
                "h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-2xl border",
                i < picked.length
                  ? "bg-green-500/10 border-green-500/30 text-green-600"
                  : i === picked.length
                    ? "bg-blue-500/10 border-blue-500/30 animate-pulse"
                    : "bg-white/80 border-emerald-200/70"
              ].join(" ")}
            >
              {i < picked.length ? "✓" : i === picked.length ? "?" : ""}
            </div>
          ))}
        </div>
      </div>
    </StageShell>
  );
}

function TypingStage({ onSuccess, onFail }) {
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("");
  const [timeLeftMs, setTimeLeftMs] = useState(8000);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
    let s = "";
    for (let i = 0; i < 8; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    setTarget(s);
    setValue("");
    setTimeLeftMs(8000);

    const end = performance.now() + 8000;
    intervalRef.current = window.setInterval(() => {
      const left = Math.max(0, end - performance.now());
      setTimeLeftMs(left);
    }, 50);

    timeoutRef.current = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onFail();
    }, 8000);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [onFail]);

  const sec = Math.ceil(timeLeftMs / 1000);

  const handleChange = (next) => {
    if (doneRef.current) return;

    const upper = next.toUpperCase();
    setValue(upper);

    // Fail instantly on a single wrong character (perm-death feel).
    for (let i = 0; i < upper.length; i++) {
      if (upper[i] !== target[i]) {
        doneRef.current = true;
        onFail();
        return;
      }
    }

    if (upper.length === 8 && upper === target) {
      doneRef.current = true;
      onSuccess();
    }
  };

  return (
    <StageShell
      stepLabel="Tahap 5 / 5 — Boss Mengetik"
      timerBar={<TimerBar durationMs={8000} timerKey={0} label="8 dtk" />}
    >
      <div className="text-sm sm:text-base text-zinc-700">
        Ketik string persis. Satu karakter salah mengembalikanmu ke Tahap 1.
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-5">
        <div className="text-xs text-zinc-600 mb-2">Target</div>
        <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-emerald-700">
          {target}
        </div>
        <div className="mt-2 text-xs text-zinc-600">
          Waktu:{" "}
          <span className="text-emerald-700 font-black tabular-nums">{sec}dtk</span>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          inputMode="text"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full min-h-[4rem] rounded-xl bg-white/85 border border-emerald-200/70 px-4 text-xl sm:text-2xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Mulai mengetik..."
          aria-label="Input boss mengetik"
        />
      </div>

      <div className="mt-3 text-xs text-zinc-600">
        Karakter diketik: <span className="font-black text-zinc-900">{value.length}/8</span>
      </div>
    </StageShell>
  );
}

function AdminLoginStage({ onLoginSuccess, onBackToGame }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLoginSuccess();
      return;
    }

    setError("Username atau password salah.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">Login Admin</div>
      <div className="text-zinc-700 text-sm sm:text-base">
        Masuk untuk edit link reward.
      </div>

      <form onSubmit={handleLogin} className="mt-2">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full min-h-[4rem] rounded-xl bg-white/85 border border-emerald-200/70 px-4 text-xl outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="username"
            autoComplete="username"
            aria-label="Username admin"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[4rem] rounded-xl bg-white/85 border border-emerald-200/70 px-4 text-xl outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="password"
            autoComplete="current-password"
            aria-label="Password admin"
          />

          {error ? <div className="text-sm text-red-300">{error}</div> : null}

          <button
            type="submit"
            className="w-full min-h-[4rem] rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          >
            Masuk
          </button>

          <button
            type="button"
            onClick={onBackToGame}
            className="w-full min-h-[3.75rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 active:scale-95 transition-transform border border-emerald-200/70 font-bold text-lg"
          >
            Kembali ke Game
          </button>
        </div>
      </form>

      <div className="text-xs text-zinc-600 leading-relaxed">
        Kredensial: <span className="font-black text-zinc-900">aku</span> / <span className="font-black text-zinc-900">123</span>
      </div>
    </div>
  );
}

function AdminLinkEditorStage({ linkTemplate, setLinkTemplate, onBackToGame }) {
  const [savedPulse, setSavedPulse] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sampleName = "Rifka";
  
  const previewLink = linkTemplate
    .replace("[name]", sampleName)
    .replace("[origin]", "https://example.com")
    .replace("[timestamp]", "1234567890");

  const handleSaveClick = () => {
    setIsSaving(true);
    setSavedPulse(true);
    window.setTimeout(() => {
      setSavedPulse(false);
      setIsSaving(false);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">Editor Link Reward</div>
      <div className="text-zinc-700 text-sm sm:text-base">
        Gunakan placeholder: <span className="font-black text-zinc-900">[name]</span>,{" "}
        <span className="font-black text-zinc-900">[origin]</span>, dan{" "}
        <span className="font-black text-zinc-900">[timestamp]</span>.
      </div>

      <div className="rounded-2xl bg-white/80 border border-emerald-200/70 p-4 sm:p-5">
        <div className="text-xs text-zinc-600 mb-2">Template Link (Tersimpan di Database)</div>
        <textarea
          value={linkTemplate}
          onChange={(e) => setLinkTemplate(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-white/90 border border-emerald-200/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none font-mono"
          aria-label="Link template"
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex-1 min-h-[4rem] rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-transform font-bold text-xl shadow-[0_0_30px_rgba(34,197,94,0.25)] disabled:opacity-75"
          >
            {isSaving ? "Menyimpan..." : savedPulse ? "Tersimpan!" : "Simpan ke Database"}
          </button>
          <button
            type="button"
            onClick={onBackToGame}
            className="min-w-[8rem] min-h-[4rem] rounded-xl bg-white/80 hover:bg-emerald-50/90 active:scale-95 transition-transform border border-emerald-200/70 font-bold text-lg"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 border border-emerald-200/70 p-4 sm:p-5">
        <div className="text-xs text-zinc-600 mb-2">Preview (contoh untuk "{sampleName}")</div>
        <div className="text-sm text-zinc-900 font-mono break-all bg-white/50 p-3 rounded-lg">
          {previewLink}
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-4">
        <div className="text-xs text-zinc-600 mb-2">Placeholder yang tersedia:</div>
        <ul className="text-xs text-zinc-700 space-y-1">
          <li><span className="font-black">[name]</span> → Nama pemenang</li>
          <li><span className="font-black">[origin]</span> → Domain website</li>
          <li><span className="font-black">[timestamp]</span> → Waktu saat menang</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-blue-50/60 border border-blue-200/70 p-4">
        <div className="text-xs text-blue-800 font-semibold">💾 Catatan</div>
        <div className="text-xs text-blue-700 mt-2">
          Link template disimpan di Supabase database. Semua user akan mengambil link dari sini.
        </div>
      </div>
    </div>
  );
}

function NameInputStage({ onSuccess, setWinnerName }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleNameSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Silakan masukkan nama Anda.");
      return;
    }

    setWinnerName(name.trim());
    onSuccess();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl sm:text-3xl font-black tracking-tight">
        Kemenangan.
      </div>
      <div className="text-zinc-700 text-sm sm:text-base">
        Kamu berhasil melewati 5 tahap. Masukkan nama mu.
      </div>

      <form onSubmit={handleNameSubmit} className="mt-2">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[4rem] rounded-xl bg-white/90 border border-emerald-200/70 px-4 text-xl outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="Nama kamu"
            autoComplete="name"
            aria-label="Input nama"
          />
          {error ? <div className="text-sm text-red-300">{error}</div> : null}

          <button
            type="submit"
            className="w-full min-h-[4rem] rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-transform font-bold text-xl shadow-[0_0_30px_rgba(34,197,94,0.25)]"
          >
            Selesai
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessStage({ winnerName, linkTemplate }) {
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    return linkTemplate
      .replace("[name]", encodeURIComponent(winnerName))
      .replace("[origin]", window.location.origin)
      .replace("[timestamp]", Date.now());
  };

  const winnerLink = generateLink();
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(winnerLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback untuk browser lama
      const textarea = document.createElement('textarea');
      textarea.value = winnerLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Popup with tulalit.png */}
      <div className="animate-bounce">
        <img
          src="/images/tulalit.png"
          alt="Success celebration"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)]"
        />
      </div>
      
      <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-700 text-center">
        Selamat {winnerName}! 🎉
      </div>
      
      <div className="text-sm sm:text-base text-zinc-600 text-center">
        Terima kasih sudah bermain!
      </div>

      <div className="mt-6 w-full rounded-2xl bg-emerald-50/60 border border-emerald-200/70 p-5">
        <div className="text-xs font-semibold text-zinc-700 mb-3 uppercase tracking-wide">Link Reward Kamu</div>
        
        <div className="mb-4 rounded-xl bg-white/90 border border-emerald-200/70 overflow-hidden">
          <textarea
            readOnly
            value={winnerLink}
            className="w-full min-h-[5rem] p-4 text-sm sm:text-base font-mono text-zinc-900 outline-none resize-none bg-transparent"
            spellCheck="false"
          />
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className={[
            "w-full min-h-[3.5rem] rounded-xl font-bold text-lg sm:text-xl transition-all",
            copied
              ? "bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          ].join(" ")}
          title="Copy link reward"
        >
          {copied ? "✓ Link Sudah Dicopy!" : "📋 Copy Link"}
        </button>

        {copied && (
          <div className="mt-3 text-center">
            <div className="inline-block rounded-lg bg-green-50 border border-green-200/70 px-4 py-2">
              <div className="text-sm font-semibold text-green-700">
                ✓ Link berhasil disalin!
              </div>
              <div className="text-xs text-green-600 mt-1">
                Bagikan link ini untuk menunjukkan kemenanganmu
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full rounded-2xl bg-blue-50/60 border border-blue-200/70 p-4">
        <div className="text-xs font-semibold text-blue-800 mb-2">💡 Tips</div>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Klik tombol "Copy Link" untuk menyalin link reward</li>
          <li>• Link ini unik dan berisi nama serta waktu kemenangan kamu</li>
          <li>• Bagikan dengan teman untuk buktikan kemenangan kamu!</li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0); // 0..7, 8=admin login, 9=admin edit
  const [winnerName, setWinnerName] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [linkTemplate, setLinkTemplate] = useState("[origin]?winner=[name]&t=[timestamp]");
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  // Load link template from Supabase on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const template = await getLinkTemplate();
        if (template) {
          setLinkTemplate(template);
        }
      } catch (err) {
        console.error("Failed to load template:", err);
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, []);

  // Update Supabase when admin changes template
  useEffect(() => {
    if (isLoadingTemplate) return; // Don't save on initial load
    
    const saveTemplate = async () => {
      try {
        await updateLinkTemplate(linkTemplate);
      } catch (err) {
        console.error("Failed to save template:", err);
      }
    };

    // Debounce to avoid too many requests
    const timeoutId = window.setTimeout(() => {
      saveTemplate();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [linkTemplate, isLoadingTemplate]);

  return (
    <div
      className="min-h-[100dvh] relative bg-gradient-to-b from-white via-emerald-50 to-white text-zinc-900"
      style={{ touchAction: "manipulation", overscrollBehaviorY: "contain" }}
    >
      {/* Idulfitri decorations component */}
      <IdulfitriDecorationsV2 />

      {/* Content wrapper to sit above decorations */}
      <div className="relative z-10">
      {currentStep === 0 ? (
        <>
          <GameContainer
            title="Halo semuanya"
            subtitle="jadi ini anjay"
          >
            <StartStage 
              onStart={() => setCurrentStep(1)} 
              onAdmin={() => setCurrentStep(8)}
            />
          </GameContainer>

          {/* Pixel Transition Card - di bawah container */}
          <div className="flex justify-center mt-4 mb-20 sm:mb-24 px-4">
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <PixelTransition
                firstContent={
                  <img
                    src="/images/king.png"
                    alt="Idulfitri decoration - Tulalit"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                }
                secondContent={
                  <img
                    src="/images/tulalit.png"
                    alt="Idulfitri decoration - King"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                }
                gridSize={12}
                pixelColor="#10b981"
                once={false}
                animationStepDuration={0.4}
                className="rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                style={{
                  aspectRatio: '1',
                  overflow: 'hidden'
                }}
              />
            </div>
          </div>
        </>
      ) : null}

      {currentStep === 1 ? (
        <GameContainer title="Tahap 1: Reaksi" subtitle="8 klik dalam 20 detik.">
          <ReactionStage onSuccess={() => setCurrentStep(2)} onFail={() => setCurrentStep(1)} />
        </GameContainer>
      ) : null}

      {currentStep === 2 ? (
        <GameContainer title="Tahap 2: Efek Stroop" subtitle="Klik warna TEKS, bukan warna tintanya.">
          <StroopStage onSuccess={() => setCurrentStep(3)} onFail={() => setCurrentStep(1)} />
        </GameContainer>
      ) : null}

      {currentStep === 3 ? (
        <GameContainer title="Tahap 3: Matematika Cepat" subtitle="20 detik. Angka lebih sulit.">
          <MathStage onSuccess={() => setCurrentStep(4)} onFail={() => setCurrentStep(1)} />
        </GameContainer>
      ) : null}

      {currentStep === 4 ? (
        <GameContainer title="Tahap 4: Memori" subtitle="Lihat. Sembunyikan. Susun ulang persis.">
          <MemoryStage onSuccess={() => setCurrentStep(5)} onFail={() => setCurrentStep(1)} />
        </GameContainer>
      ) : null}

      {currentStep === 5 ? (
        <GameContainer title="Tahap 5: Boss Mengetik" subtitle="Ketik string 8 karakter persis.">
          <TypingStage onSuccess={() => setCurrentStep(6)} onFail={() => setCurrentStep(1)} />
        </GameContainer>
      ) : null}

      {currentStep === 6 ? (
        <GameContainer title="Nama" subtitle="Masukkan nama mu.">
          <NameInputStage onSuccess={() => setCurrentStep(7)} setWinnerName={setWinnerName} />
        </GameContainer>
      ) : null}

      {currentStep === 7 ? (
        <GameContainer title="Berhasil" subtitle="Terima kasih sudah bermain.">
          <SuccessStage winnerName={winnerName} linkTemplate={linkTemplate} />
        </GameContainer>
      ) : null}

      {currentStep === 8 ? (
        <GameContainer title="Admin" subtitle="Edit link reward">
          <AdminLoginStage 
            onLoginSuccess={() => { setAdminAuthed(true); setCurrentStep(9); }}
            onBackToGame={() => setCurrentStep(0)}
          />
        </GameContainer>
      ) : null}

      {currentStep === 9 ? (
        <GameContainer title="Edit Link Template" subtitle="Customize reward link">
          <AdminLinkEditorStage 
            linkTemplate={linkTemplate}
            setLinkTemplate={setLinkTemplate}
            onBackToGame={() => { setAdminAuthed(false); setCurrentStep(0); }}
          />
        </GameContainer>
      ) : null}
      </div>
    </div>
  );
}

