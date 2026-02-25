import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, PhoneCall, FileText, Handshake } from "lucide-react";
import { Lead } from "./LeadsTable";

interface DashboardStatsProps {
  leads: Lead[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ leads }) => {
  const total = leads.length;
  const pending = leads.filter(l => l.status === "pending").length;
  const talkDone = leads.filter(l => l.status === "talk_done").length;
  const quotationSent = leads.filter(l => l.status === "quotation_sent").length;
  const dealFinal = leads.filter(l => l.status === "deal_final").length;
  const done = leads.filter(l => l.status === "done").length;

  const todayCallsDue = leads.filter(l => {
    if (!l.next_call_date) return false;
    const callDate = new Date(l.next_call_date);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    { label: "Total Leads", value: total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Talk Done", value: talkDone, icon: PhoneCall, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Quotation Sent", value: quotationSent, icon: FileText, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Deal Final", value: dealFinal, icon: Handshake, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Done", value: done, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {todayCallsDue > 0 && (
        <Card className="hover:shadow-md transition-shadow border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <PhoneCall className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-amber-700">{todayCallsDue}</p>
                <p className="text-xs text-amber-600 mt-1 truncate">Calls Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;
