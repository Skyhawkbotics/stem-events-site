import { BrandLogo } from "./brand-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="sr-only">FIRST Tech Challenge Scrimmages and Events</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center font-bold">This is</p>
      <div className="-mt-8">
        <BrandLogo logoSize={48} textSize="text-4xl font-bold" />
      </div>
      <p 
        className="text-2xl lg:text-3xl !leading-tight mx-auto max-w-xl text-center font-bold"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        The all in one FTC robotics scrimmage and event coordinator.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
