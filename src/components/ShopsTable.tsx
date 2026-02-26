import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Search, Filter, MoreVertical, Store } from "lucide-react";
import { Badge } from "./ui/badge";

const branches = [
  { id: 1, name: "Simba — Kicukiro Branch", plan: "Premium", phone: "+250 788 100 001", status: "active" },
  { id: 2, name: "Simba — Remera Branch", plan: "Premium", phone: "+250 788 100 002", status: "active" },
  { id: 3, name: "Simba — Nyamirambo Branch", plan: "Premium", phone: "+250 788 100 003", status: "pending" },
  { id: 4, name: "Simba — Gisozi Branch", plan: "Premium", phone: "+250 788 100 004", status: "active" },
  { id: 5, name: "Simba — Nyabugogo Branch", plan: "Premium", phone: "+250 788 100 005", status: "active" },
  { id: 6, name: "Simba — Musanze Branch", plan: "Standard", phone: "+250 788 100 006", status: "active" },
  { id: 7, name: "Simba — Muhanga Branch", plan: "Standard", phone: "+250 788 100 007", status: "pending" },
  { id: 8, name: "Simba — Huye Branch", plan: "Standard", phone: "+250 788 100 008", status: "active" },
];

export function ShopsTable() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">All Simba Branches</h3>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search branches…"
              className="pl-10 h-9 bg-muted/50 border-0"
            />
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                <Checkbox />
              </th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">NO</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">BRANCH NAME</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">PLAN</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">PHONE NUMBER</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">STATUS</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <Checkbox />
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{branch.id}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {/* Simba brand avatar — no external PNG */}
                    <div className="w-10 h-10 rounded-full bg-[#FF6600] flex items-center justify-center shadow-sm shadow-orange-100 shrink-0">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{branch.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{branch.plan}</td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{branch.phone}</td>
                <td className="py-4 px-4">
                  <Badge
                    variant={branch.status === "active" ? "default" : "secondary"}
                    className={
                      branch.status === "active"
                        ? "bg-[#FF6600]/10 text-[#FF6600] hover:bg-[#FF6600]/20 border-0"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-0"
                    }
                  >
                    ● {branch.status === "active" ? "Active" : "Pending"}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
