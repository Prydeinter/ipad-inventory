import { Link } from "react-router-dom";

export function Brand({ variant = "blue", className = "", to = "/" }) {
  const src = variant === "white" ? "/logo-white.png" : "/logo-blue.png";
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`} data-testid="brand-logo">
      <img src={src} alt="Al Azhar IIBS" className="h-11 w-auto" />
    </Link>
  );
}
