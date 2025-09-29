import { BrandLogo } from "./brand-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-8 sm:gap-12 lg:gap-16 items-center">
      <h1 className="sr-only">FIRST Tech Challenge Scrimmages and Events</h1>
      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl !leading-tight mx-auto max-w-xl text-center font-bold">This is</p>
      <div className="-mt-4 sm:-mt-6 lg:-mt-8">
        <BrandLogo logoSize={48} textSize="text-3xl sm:text-4xl md:text-5xl font-bold" />
      </div>
      <p 
        className="text-lg sm:text-xl md:text-2xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center font-bold"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        The all in one FTC robotics scrimmage and event coordinator.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-4 sm:my-6 lg:my-8" />
    </div>
  );
}
