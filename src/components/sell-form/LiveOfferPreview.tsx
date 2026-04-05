import { TrendingUp, Megaphone } from "lucide-react";
import { useMemo } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { calculateOffer, type OfferSettings, type OfferRule } from "@/lib/offerCalculator";
import type { FormData, BBVehicle } from "./types";

interface Props {
  formData: FormData;
  bbVehicle?: BBVehicle | null;
  selectedAddDeducts?: string[];
  offerSettings?: OfferSettings | null;
  offerRules?: OfferRule[];
  promoBonus?: number;
  promoName?: string;
}

const LiveOfferPreview = ({ formData, bbVehicle, selectedAddDeducts = [], offerSettings, offerRules = [], promoBonus = 0, promoName }: Props) => {
  const estimate = useMemo(() => {
    if (!bbVehicle?.tradein?.avg) return null;
    return calculateOffer(bbVehicle, formData, selectedAddDeducts, offerSettings, offerRules, promoBonus);
  }, [formData, bbVehicle, selectedAddDeducts, offerSettings, offerRules, promoBonus]);

  if (!estimate) return null;

  return (
    <div className="bg-success/10 border border-success/25 rounded-xl p-4 mb-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success mb-1">
        <TrendingUp className="w-3.5 h-3.5" />
        Estimated Offer
      </div>
      <div className="text-2xl font-extrabold text-card-foreground tracking-tight">
        <AnimatedCounter target={estimate.high} prefix="$" duration={600} />
      </div>
      {promoBonus > 0 && (
        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-accent mt-1">
          <Megaphone className="w-3 h-3" />
          Includes ${promoBonus.toLocaleString()} bonus{promoName ? ` — ${promoName}` : ""}!
        </div>
      )}
      <p className="text-[11px] text-muted-foreground mt-1">Updates as you answer · final offer may vary</p>
    </div>
  );
};

export default LiveOfferPreview;
