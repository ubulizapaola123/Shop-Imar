"use client";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";

function Payment() {
  const [adminName, setAdminName] = useState("Shoppa Admin");
  const [phone, setPhone] = useState("+1 234 567 8900");
  const [email, setEmail] = useState("info@shoppa.com");

  const handleSave = () => {
    alert("Changes saved successfully ✅");
  };

  return (
    <div className="p-6 max-w-full">
      <h2 className="text-2xl font-semibold mb-2">System Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Configure system admin preferences
      </p>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-1">Admin Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Basic information about admin
        </p>

        <div className="p-6 border rounded-md space-y-6">
          <div>
            <Label className="mb-2 block">Admin Name</Label>
            <Input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Phone</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-success text-white hover:bg-success/90 mt-2"
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Payment;
