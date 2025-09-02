import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"} className="flex items-center gap-2">
                        <Image src="/favicon.ico" alt="logo" width={20} height={20} />
                        <span className="font-semibold">
                            <span style={{ color: 'var(--primary)' }}>FIRST</span>
                            <span style={{ color: 'var(--secondary)' }}>Finder.org</span>
                        </span>
                    </Link>
                    <Link href={"/events"}>Events List</Link>
                    <Link href={"/scrimmage"}>Scrimmages List</Link>
                </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
        </nav>
    );
} 