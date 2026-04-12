import { Car, FileCheck, Camera, Video, Lock } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { Badge } from "@/components/ui/badge";
import AppSwitcher from "./AppSwitcher";

const ICON_MAP: Record<string, React.ElementType> = {
  Car,
  FileCheck,
  Camera,
  Video,
};

interface PlatformHeaderProps {
  dealerName?: string;
}

const PlatformHeader = ({ dealerName }: PlatformHeaderProps) => {
  const { products, hasProduct, subscription, bundles } = usePlatform();

  const currentBundle = bundles.find((b) => b.id === subscription?.bundle_id);

  return (
    <div className="relative z-[60] w-full h-8 bg-[#0f0f12] border-b border-white/[0.06] select-none">
      {/* Subtle gradient shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative h-full px-3 flex items-center justify-between gap-4">
        {/* Left — Platform logo + App switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 shrink-0 hidden md:inline">
            Autocurb
          </span>
          <div className="hidden md:block h-3.5 w-px bg-white/10" />
          <AppSwitcher currentApp="autocurb" />
        </div>

        {/* Center — Inline product tabs (desktop only) */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {products
            .filter((p) => p.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((product) => {
              const Icon = ICON_MAP[product.icon_name] || Car;
              const isActive = hasProduct(product.id);
              const isCurrent = product.id === "autocurb";

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    if (isActive && !isCurrent) {
                      window.location.href = product.base_url;
                    }
                  }}
                  disabled={!isActive}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150
                    ${isCurrent
                      ? "bg-white/10 text-white shadow-sm"
                      : isActive
                        ? "text-white/50 hover:text-white/80 hover:bg-white/[0.05] cursor-pointer"
                        : "text-white/20 cursor-default"
                    }
                  `}
                >
                  <Icon className="w-3 h-3" />
                  <span>{product.name}</span>
                  {!isActive && <Lock className="w-2.5 h-2.5 ml-0.5 opacity-50" />}
                </button>
              );
            })}
        </nav>

        {/* Right — Dealer name + plan badge */}
        <div className="flex items-center gap-2 shrink-0">
          {dealerName && (
            <span className="text-[10px] text-white/40 font-medium truncate max-w-[120px] hidden sm:inline">
              {dealerName}
            </span>
          )}
          {currentBundle && (
            <Badge
              variant="outline"
              className="text-[9px] h-4 px-1.5 font-semibold border-white/10 text-white/50 bg-white/[0.04]"
            >
              {currentBundle.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformHeader;
