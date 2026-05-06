import logo from "../../assets/logo.png";
import heroImage from "../../assets/hero.jpg";

function PublicHero({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  subtitle,
  image = heroImage,
}) {
  return (
    <section className="relative overflow-hidden pt-24" style={{ minHeight: "22rem" }}>
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" aria-hidden="true" />

      {/* Centered content */}
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">

        {/* ONMM logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20">
            <img src={logo} alt="Logo ONMM" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Page badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80">
          <BadgeIcon size={12} aria-hidden="true" />
          {badgeText}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          {title}
        </h1>

        {/* Accent rule */}
        <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-teal-400/70" aria-hidden="true" />

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70">
          {subtitle}
        </p>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" aria-hidden="true" />
    </section>
  );
}

export default PublicHero;
