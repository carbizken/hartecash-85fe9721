import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { Submission, Appointment } from "@/lib/adminConstants";

interface TodayActionSummaryProps {
  submissions: Submission[];
  appointments: Appointment[];
  onNavigate: (section: string) => void;
}

const TodayActionSummary = ({ submissions, appointments, onNavigate }: TodayActionSummaryProps) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const needsFollowUp = submissions.filter((s) => {
      if (s.offered_price && s.offered_price > 0) return false;
      const hoursSince = (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60);
      return hoursSince > 24;
    }).length;

    const acceptedNoAppt = submissions.filter(
      (s) => s.offered_price && s.offered_price > 0 && !s.appointment_set
    ).length;

    const newToday = submissions.filter((s) => s.created_at.slice(0, 10) === todayStr).length;

    const pipelineValue = submissions.reduce((sum, s) => {
      const val = s.offered_price || s.estimated_offer_high || 0;
      return sum + val;
    }, 0);

    return { needsFollowUp, acceptedNoAppt, newToday, pipelineValue };
  }, [submissions, todayStr]);

  const chips = [
    { emoji: "🔴", label: "Needs Follow-Up", value: stats.needsFollowUp, onClick: () => onNavigate("submissions") },
    { emoji: "🟡", label: "Accepted, No Appt", value: stats.acceptedNoAppt, onClick: () => onNavigate("offer-accepted") },
    { emoji: "🟢", label: "New Today", value: stats.newToday, onClick: () => onNavigate("submissions") },
    { emoji: "💰", label: "Pipeline", value: `$${stats.pipelineValue.toLocaleString()}`, onClick: undefined },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((c) => (
        <Badge
          key={c.label}
          variant="outline"
          className={`text-xs font-medium px-2.5 py-1 gap-1.5 ${c.onClick ? "cursor-pointer hover:bg-muted/60 transition-colors" : ""}`}
          onClick={c.onClick}
        >
          <span>{c.emoji}</span>
          <span className="text-muted-foreground">{c.label}:</span>
          <span className="font-semibold text-card-foreground">{c.value}</span>
        </Badge>
      ))}
    </div>
  );
};

export default TodayActionSummary;
