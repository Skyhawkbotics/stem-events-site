import Image from "next/image";

interface BrandLogoProps {
    logoSize?: number;
    textSize?: string;
    className?: string;
}

export function BrandLogo({ logoSize = 20, textSize = "font-semibold", className = "" }: BrandLogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Image src="/favicon.ico" alt="logo" width={logoSize} height={logoSize} />
            <span className={textSize}>
                <span style={{ color: 'var(--primary)' }}>FIRST</span>
                <span style={{ color: 'var(--secondary)' }}>Finder.org</span>
            </span>
        </div>
    );
}
