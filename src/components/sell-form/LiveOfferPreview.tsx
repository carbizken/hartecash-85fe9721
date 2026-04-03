import { TrendingUp } from "lucide-react";
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
}

const LiveOfferPreview = ({ formData, bbVehicle, selectedAddDeducts = [], offerSettings, offerRules = [] }: Props) => {
  const estimate = useMemo(() => {
    if (!bbVehicle?.tradein?.avg) return null;
    return calculateOffer(bbVehicle, formData, selectedAddDeducts, offerSettings, offerRules);
  }, [formData, bbVehicle, selectedAddDeducts, offerSettings, offerRules]);

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
      <p className="text-[11px] text-muted-foreground mt-1">Updates as you answer · final offer may vary</p>
    </div>
  );
};

export default LiveOfferPreview;
