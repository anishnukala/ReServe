"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  HandHeart,
  Users,
  Utensils,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type FoodItem = {
  id: number;
  name: string;
  category: string;
  image: string;
  donated: string;
  donations: number;
  donors: number;
  recipients: number;
  meals: number;
  pounds: number;
  co2: number;
  color: string;
  tint: string;
};

const FOOD: FoodItem[] = [
  {
    id: 1,
    name: "Fresh Produce",
    category: "Produce",
    image: "/impact-assets/fresh-produce-3d.png",
    donated: "4,860 lbs",
    donations: 128,
    donors: 34,
    recipients: 18,
    meals: 4050,
    pounds: 4860,
    co2: 3620,
    color: "#65a30d",
    tint: "#dce9c8",
  },
  {
    id: 2,
    name: "Artisan Bread",
    category: "Bakery",
    image: "/impact-assets/artisan-bread-3d.png",
    donated: "1,920 loaves",
    donations: 76,
    donors: 21,
    recipients: 14,
    meals: 3180,
    pounds: 2150,
    co2: 1610,
    color: "#d97706",
    tint: "#f5d8a8",
  },
  {
    id: 3,
    name: "Prepared Meals",
    category: "Ready to eat",
    image: "/impact-assets/prepared-meals-3d.png",
    donated: "2,340 meals",
    donations: 93,
    donors: 27,
    recipients: 16,
    meals: 2340,
    pounds: 2810,
    co2: 3680,
    color: "#ea580c",
    tint: "#f6c3a3",
  },
  {
    id: 4,
    name: "Fresh Fruits",
    category: "Produce",
    image: "/impact-assets/fresh-fruit-3d.png",
    donated: "3,780 lbs",
    donations: 112,
    donors: 29,
    recipients: 17,
    meals: 3150,
    pounds: 3780,
    co2: 2840,
    color: "#16a34a",
    tint: "#cce8cf",
  },
  {
    id: 5,
    name: "Pantry Staples",
    category: "Groceries",
    image: "/impact-assets/pantry-staples-3d.png",
    donated: "5,640 lbs",
    donations: 84,
    donors: 24,
    recipients: 20,
    meals: 4700,
    pounds: 5640,
    co2: 3510,
    color: "#0f766e",
    tint: "#c9e5df",
  },
];

export default function ImpactShelf() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : FOOD[selectedIndex];
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const closeDetail = () => {
    setSelectedIndex(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  };

  const selectRelative = (direction: number) => {
    setSelectedIndex((current) => {
      const index = current ?? 0;
      return (index + direction + FOOD.length) % FOOD.length;
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (event.key === "Escape") closeDetail();
      if (event.key === "ArrowLeft") selectRelative(-1);
      if (event.key === "ArrowRight") selectRelative(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  return (
    <section
      id="impact"
      className={selected
        ? "overflow-hidden text-[#173a2b] lg:min-h-[calc(100svh-74px)]"
        : "overflow-hidden bg-[var(--cream)] px-4 py-7 text-[#173a2b] md:px-8 md:py-8 lg:min-h-[calc(100svh-74px)]"}
      style={selected ? {
        backgroundColor: selected.tint,
        backgroundImage: "radial-gradient(circle at 28% 32%, rgba(255,255,255,.55), transparent 42%)",
      } : undefined}
    >
      <div className="mx-auto w-full max-w-[1350px]">
        {!selected && (
          <div className="mb-3 grid items-end gap-5 lg:grid-cols-[1.12fr_.88fr] lg:gap-24">
            <div>
              <span className="impact-kicker mb-4 inline-flex items-center text-[11px] font-bold uppercase tracking-[0.22em] text-[#247f3c]">
                Food in motion
              </span>
              <h2 className="impact-heading text-4xl font-normal leading-[0.92] tracking-[-0.045em] md:text-5xl lg:text-[66px]">
                See what each food type
                <span className="block text-[#559c48]">can become.</span>
              </h2>
            </div>
            <p className="impact-intro max-w-2xl border-l-2 border-[#65a832]/45 pb-1 pl-6 text-base leading-7 text-[#173a2b]/65 md:text-[17px]">
              Explore each food type to see how many donors contributed, how much food was rescued, and the total community impact created across ReServe.
            </p>
          </div>
        )}

        <div>
          {selected ? (
            <DetailView
              item={selected}
              index={selectedIndex!}
              onClose={closeDetail}
              onPrevious={() => selectRelative(-1)}
              onNext={() => selectRelative(1)}
            />
          ) : (
            <ShelfView
              onSelect={(index, trigger) => {
                lastTrigger.current = trigger;
                setSelectedIndex(index);
              }}
            />
          )}
        </div>

      </div>
    </section>
  );
}

function ShelfView({ onSelect }: { onSelect: (index: number, trigger: HTMLButtonElement) => void }) {
  return (
    <div className="relative min-h-[700px] overflow-x-auto overflow-y-hidden min-[1320px]:overflow-visible">
      <div className="relative mx-auto flex min-w-[1250px] max-w-[1350px] items-end justify-between px-5 [perspective:1500px]">
        <Image
          src="/impact-assets/realistic-walnut-table.png"
          alt=""
          width={2149}
          height={732}
          className="pointer-events-none absolute left-0 top-[159px] z-[5] h-auto w-full origin-top scale-x-[1.16] scale-y-[1.4] select-none drop-shadow-[0_40px_34px_rgba(50,29,15,.27)]"
        />

        {FOOD.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={(event) => onSelect(index, event.currentTarget)}
            className="food-object group relative z-10 flex h-[705px] w-[225px] shrink-0 flex-col items-center text-center transition duration-500 hover:z-20 focus-visible:z-20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#173a2b]"
            aria-label={`View the impact of ${item.name}`}
          >
            <div className="relative z-20 min-h-[76px] translate-y-[42px] px-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: item.color }}>{item.category}</p>
              <h3 className="impact-item-title mt-2 text-[25px] font-semibold leading-none tracking-[-0.045em]">{item.name}</h3>
            </div>

            <div className="food-object__visual relative flex h-[330px] w-full items-end justify-center transition duration-500">
              <div className="absolute -bottom-1 h-5 w-[72%] rounded-full bg-[#160d0b]/35 blur-md transition duration-500 group-hover:w-[78%]" />
              <Image
                src={item.image}
                alt=""
                width={520}
                height={520}
                className="relative z-10 h-[260px] w-[260px] max-w-none translate-y-3 object-contain drop-shadow-[0_18px_15px_rgba(23,58,43,.22)] transition duration-500 group-hover:scale-[1.035]"
              />
            </div>

            <div className="absolute bottom-[124px] z-20 flex h-[78px] w-[210px] flex-col items-center justify-center rounded-[20px] border border-[#173a2b]/10 bg-[linear-gradient(145deg,rgba(255,255,255,.98),rgba(247,249,244,.94))] px-3 shadow-[0_16px_36px_rgba(23,58,43,.13)] backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_42px_rgba(23,58,43,.18)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#173a2b]/45">Total donated</p>
              <div className="mt-1 flex w-full items-center justify-center gap-3">
                <strong className="text-sm">{item.donated}</strong>
                <ArrowRight size={15} style={{ color: item.color }} aria-hidden="true" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .food-object__visual { transform: translateY(-4px); }
        .food-object:hover,
        .food-object:focus-visible { transform: translateY(-4px); }
        .food-object:hover .food-object__visual,
        .food-object:focus-visible .food-object__visual { transform: translateY(-8px) scale(1.02); }
        @media (prefers-reduced-motion: reduce) {
          .food-object,
          .food-object__visual { transition: none; }
        }
      `}</style>
    </div>
  );
}

function DetailView({
  item,
  index,
  onClose,
  onPrevious,
  onNext,
}: {
  item: FoodItem;
  index: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative grid min-h-[720px] overflow-hidden lg:min-h-[calc(100svh-74px)] lg:grid-cols-[minmax(360px,.9fr)_minmax(500px,1.1fr)]">

      <button type="button" onClick={onClose} className="absolute left-6 top-6 z-30 grid h-12 w-12 place-items-center rounded-full border border-[#173a2b]/35 transition hover:rotate-90 hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#173a2b]" aria-label="Close impact details">
        <X size={19} />
      </button>

      <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden p-10 md:p-16 lg:min-h-0">
        <div className="absolute bottom-[16%] h-16 w-[70%] rounded-full bg-[#173a2b]/20 blur-2xl" />
        <div className="relative flex h-[540px] w-full max-w-[560px] items-center justify-center [perspective:1200px]">
          <div className="absolute h-[74%] w-[74%] rounded-full bg-white/28 blur-3xl" />
          <Image
            src={item.image}
            alt={`3D presentation of ${item.name}`}
            width={900}
            height={900}
            priority
            className="impact-detail-object relative z-10 h-full w-full object-contain drop-shadow-[0_36px_28px_rgba(23,58,43,.28)]"
          />
        </div>
      </div>

      <div className="relative flex flex-col justify-center px-7 pb-14 pt-20 md:px-14 lg:px-16 lg:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#173a2b]/65">{item.category}</p>
        <h3 className="mt-5 max-w-[620px] text-5xl font-normal leading-[0.88] tracking-[-0.06em] md:text-7xl lg:text-[88px]">{item.name}</h3>
        <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#173a2b]/75 md:text-xl">
          Across {item.donations.toLocaleString()} donations, {item.donors.toLocaleString()} donor partners contributed {item.donated} of {item.name.toLowerCase()}. Together, those rescues supported {item.recipients} community organizations and created an estimated {item.meals.toLocaleString()} meals.
        </p>

        <div className="mt-9 grid gap-x-8 gap-y-6 border-y border-[#173a2b]/20 py-7 sm:grid-cols-2">
          <DetailFact icon={<Users size={17} />} label="Donor network" value={`${item.donors.toLocaleString()} donors · ${item.donations.toLocaleString()} donations`} />
          <DetailFact icon={<HandHeart size={17} />} label="Food rescued" value={`${item.donated} · ${item.pounds.toLocaleString()} lb total`} />
          <DetailFact icon={<Building2 size={17} />} label="Community reach" value={`${item.recipients.toLocaleString()} recipient organizations`} />
          <DetailFact icon={<Utensils size={17} />} label="Total impact" value={`${item.meals.toLocaleString()} meals · ${item.co2.toLocaleString()} lb CO₂e avoided`} />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onPrevious} className="grid h-11 w-11 place-items-center rounded-full border border-[#173a2b]/25 transition hover:bg-white/40" aria-label="Previous food item"><ArrowLeft size={18} /></button>
            <span className="min-w-16 text-center text-xs font-semibold tracking-[0.15em]">{String(index + 1).padStart(2, "0")} / {String(FOOD.length).padStart(2, "0")}</span>
            <button type="button" onClick={onNext} className="grid h-11 w-11 place-items-center rounded-full border border-[#173a2b]/25 transition hover:bg-white/40" aria-label="Next food item"><ArrowRight size={18} /></button>
          </div>
          <Link href="/donate" className="inline-flex items-center gap-2 rounded-full bg-[#173a2b] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#24533d]">
            Donate {item.name} <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes impactFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        .impact-detail-object { animation: impactFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .impact-detail-object { animation: none; }
        }
      `}</style>
    </div>
  );
}

function DetailFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#173a2b]/55">{icon}<p className="text-[10px] font-bold uppercase tracking-[0.16em]">{label}</p></div>
      <p className="mt-2 text-sm font-medium leading-5">{value}</p>
    </div>
  );
}
