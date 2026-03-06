import { announcementText } from "@/data/navigation";

export function AnnouncementBar() {
  return (
    <div className="bg-ink px-4 py-2.5 text-center text-[11px] font-medium leading-relaxed tracking-[0.05em] text-white/90 sm:py-2 motion-safe:animate-slide-down">
      <p>{announcementText}</p>
    </div>
  );
}
