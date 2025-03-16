
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Lead } from "./LeadsTable";

interface LeadsChartProps {
  leads: Lead[];
}

const statusColors = {
  pending: "#f59e0b",
  done: "#10b981",
  talk_done: "#3b82f6",
  deal_final: "#8b5cf6",
  quotation_sent: "#ec4899",
};

const LeadsChart: React.FC<LeadsChartProps> = ({ leads }) => {
  const chartData = useMemo(() => {
    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "Pending", value: statusCounts.pending || 0, color: statusColors.pending },
      { name: "Done", value: statusCounts.done || 0, color: statusColors.done },
      { name: "Talk Done", value: statusCounts.talk_done || 0, color: statusColors.talk_done },
      { name: "Deal Final", value: statusCounts.deal_final || 0, color: statusColors.deal_final },
      { name: "Quotation Sent", value: statusCounts.quotation_sent || 0, color: statusColors.quotation_sent },
    ];
  }, [leads]);

  const totalLeads = leads.length;
  const pendingLeads = leads.filter(lead => lead.status === "pending").length;
  const completedLeads = leads.filter(lead => lead.status === "done").length;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lead Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lead Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-lg font-semibold">{totalLeads}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-500 text-lg font-semibold">{pendingLeads}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-500 text-lg font-semibold">{completedLeads}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsChart;
