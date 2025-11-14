"use client";

import { Card } from "./ui/card";
import { MoreVertical } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", users: 4200 },
  { month: "Feb", users: 4600 },
  { month: "Mar", users: 5200 },
  { month: "Apr", users: 4800 },
  { month: "May", users: 5800 },
  { month: "Jun", users: 6000 },
  { month: "Jul", users: 6400 },
  { month: "Aug", users: 6800 },
  { month: "Sep", users: 6600 },
  { month: "Oct", users: 6900 },
  { month: "Nov", users: 7200 },
  { month: "Dec", users: 7600 },
];

export function AdminPayment() {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">User Graph</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">6,379</span>
            <span className="text-sm text-destructive">
              ↓ 4.3% from last period
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Users
          </button>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--success))"
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
