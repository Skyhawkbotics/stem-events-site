import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
      <p>
        Maintained by{" "}
        <a
          href="https://www.hawkbot1cs.org"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Hawkbot1cs
        </a>
      </p>
      <ThemeSwitcher />
    </footer>
  );
} 