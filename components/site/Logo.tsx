import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="LinguaLink home">
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-gray-800">Lingua</span>
        <span className="bg-gradient-to-r from-[#FF8201] to-[#FF6B00] bg-clip-text text-transparent">Link</span>
      </span>
    </Link>
  );
}
