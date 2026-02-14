import ghostCar from "@/assets/ghost-loader.png";

const UploadSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="relative mx-auto mb-4 w-[220px] h-[120px]">
        <img
          src={ghostCar}
          alt=""
          className="w-full h-full object-contain opacity-40 animate-pulse"
          style={{ filter: "grayscale(1) brightness(1.2)" }}
        />
        {/* Speed lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 120">
          <style>{`
            @keyframes ghost-fade {
              0%,100% { opacity: 0.1; transform: translateX(0); }
              50%     { opacity: 0.35; transform: translateX(-14px); }
            }
          `}</style>
          <g stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.3">
            <line x1="8" y1="58" x2="30" y2="58" style={{ animation: "ghost-fade 1.4s ease-in-out infinite" }} />
            <line x1="12" y1="68" x2="36" y2="68" style={{ animation: "ghost-fade 1.4s ease-in-out infinite .2s" }} />
            <line x1="10" y1="78" x2="38" y2="78" style={{ animation: "ghost-fade 1.4s ease-in-out infinite .4s" }} />
          </g>
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading photos...</p>
    </div>
  </div>
);

export default UploadSkeleton;
