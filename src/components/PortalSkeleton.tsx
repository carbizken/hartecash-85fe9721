const PortalSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100" className="mx-auto mb-4">
        <style>{`
          @keyframes hc-spin { to { transform: rotate(360deg); } }
          @keyframes hc-dash { to { stroke-dashoffset: -60; } }
          @keyframes hc-fade {
            0%,100% { opacity:.12; transform: translateX(0); }
            50%     { opacity:.35; transform: translateX(-12px); }
          }
          @keyframes hc-glow {
            0%,100% { opacity:.3; }
            50%     { opacity:.7; }
          }
        `}</style>
        <g fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Car body */}
          <path d="M30,62 L30,56 L34,50 Q36,46 42,46 L58,46 L68,34 Q70,32 74,32 L116,32 Q122,32 124,34 L134,46 Q136,46 140,46 L152,46 Q158,46 160,50 L164,56 L168,58 L168,62" opacity=".15" />
          <path d="M30,62 L30,56 L34,50 Q36,46 42,46 L58,46 L68,34 Q70,32 74,32 L116,32 Q122,32 124,34 L134,46 Q136,46 140,46 L152,46 Q158,46 160,50 L164,56 L168,58 L168,62" strokeDasharray="24 24" style={{ animation: "hc-dash 1.4s linear infinite" }} />
          {/* Roof / window line */}
          <path d="M70,34 L74,32 L116,32 L124,34" opacity=".2" />
          {/* Windshield */}
          <line x1="68" y1="34" x2="60" y2="46" opacity=".2" />
          {/* Rear window */}
          <line x1="124" y1="34" x2="132" y2="46" opacity=".2" />
          {/* Window divider */}
          <line x1="97" y1="34" x2="97" y2="46" opacity=".12" />
          {/* Door line */}
          <line x1="97" y1="46" x2="97" y2="62" opacity=".1" />
          {/* Bumper details */}
          <line x1="30" y1="62" x2="168" y2="62" opacity=".15" />
          {/* Headlight */}
          <path d="M164,54 L168,56" stroke="hsl(var(--primary))" opacity=".3" strokeWidth="3" style={{ animation: "hc-glow 1.6s ease-in-out infinite" }} />
          {/* Taillight */}
          <path d="M30,56 L34,54" stroke="hsl(var(--accent))" opacity=".5" strokeWidth="3" style={{ animation: "hc-glow 1.6s ease-in-out infinite .4s" }} />
          {/* Side mirror */}
          <path d="M60,44 L56,42 L56,44" opacity=".15" />
          {/* Door handle */}
          <line x1="88" y1="52" x2="94" y2="52" opacity=".12" />
          {/* Front wheel */}
          <circle cx="56" cy="66" r="10" opacity=".15" />
          <circle cx="56" cy="66" r="6" opacity=".1" />
          <circle cx="56" cy="66" r="10" strokeDasharray="16 48" style={{ animation: "hc-spin .9s linear infinite", transformOrigin: "56px 66px" }} />
          {/* Rear wheel */}
          <circle cx="142" cy="66" r="10" opacity=".15" />
          <circle cx="142" cy="66" r="6" opacity=".1" />
          <circle cx="142" cy="66" r="10" strokeDasharray="16 48" style={{ animation: "hc-spin .9s linear infinite", transformOrigin: "142px 66px" }} />
          {/* Ground line */}
          <line x1="42" y1="76" x2="156" y2="76" opacity=".08" />
          {/* Speed lines */}
          <line x1="2" y1="50" x2="20" y2="50" strokeWidth="1.5" style={{ animation: "hc-fade 1.4s ease-in-out infinite" }} />
          <line x1="6" y1="58" x2="22" y2="58" strokeWidth="1.5" style={{ animation: "hc-fade 1.4s ease-in-out infinite .2s" }} />
          <line x1="4" y1="66" x2="24" y2="66" strokeWidth="1.5" style={{ animation: "hc-fade 1.4s ease-in-out infinite .4s" }} />
        </g>
      </svg>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading your submission...</p>
    </div>
  </div>
);

export default PortalSkeleton;
