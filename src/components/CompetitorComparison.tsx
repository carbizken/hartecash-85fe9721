import { useEffect, useState } from "react";
import { Check, X, Minus } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";

interface ComparisonFeature {
  label: string;
  values: (boolean | "partial")[];
}

const CompetitorComparison = () => {
  const { config } = useSiteConfig();
  const name = config.dealership_name || "Harte Auto Group";
  const shortName = name.split(" ")[0];

  const [columns, setColumns] = useState<string[]>(["CarMax", "Carvana", "Private Sale"]);
  const [features, setFeatures] = useState<ComparisonFeature[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("site_config")
      .select("competitor_columns, comparison_features")
      .eq("dealership_id", "default")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          if (d.competitor_columns) setColumns(d.competitor_columns);
          if (d.comparison_features) setFeatures(d.comparison_features);
        }
        setLoaded(true);
      });
  }, []);

  if (!loaded || features.length === 0) return null;

  const CellIcon = ({ value }: { value: boolean | string }) => {
    if (value === true) return <Check className="w-5 h-5 text-success mx-auto" />;
    if (value === "partial") return <Minus className="w-5 h-5 text-muted-foreground mx-auto" />;
    return <X className="w-5 h-5 text-destructive/60 mx-auto" />;
  };

  const colWidth = `${Math.floor(60 / (columns.length + 1))}%`;

  return (
    <section className="bg-background px-5 py-14" id="compare">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground text-center mb-2">
          Why {shortName} Wins
        </h2>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          See how we stack up against the competition.
        </p>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-[40%]">Feature</th>
                  <th className="text-center px-3 py-3 font-bold text-accent" style={{ width: colWidth }}>
                    <span className="block text-xs uppercase tracking-wider">{shortName}</span>
                  </th>
                  {columns.map((col, i) => (
                    <th key={i} className="text-center px-3 py-3 font-semibold text-muted-foreground" style={{ width: colWidth }}>
                      <span className="block text-xs uppercase tracking-wider">{col}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground text-[13px]">{f.label}</td>
                    <td className="px-3 py-3 bg-accent/5"><CellIcon value={f.values[0]} /></td>
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-3 py-3"><CellIcon value={f.values[cIdx + 1] ?? false} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Minus className="w-3 h-3 inline mr-1" /> = Sometimes / Varies
        </p>
      </div>
    </section>
  );
};

export default CompetitorComparison;
