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
    <div className="space-y-6 p-2">
      <h2 className="text-2xl font-semibold mb-2">System Settings</h2>
      <p className="text-sm text-muted-foreground ">
        Configure system admin preferences
      </p>

      <Card className="pt-7 pb-9 px-6 h-[400px] gap-4">
        <h3 className="text-lg font-semibold mb-1">Admin Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Basic information about admin
        </p>

        <div className="p-5 border rounded-md space-y-4">
          <div>
            <Label className="mb-1 block">Admin Name</Label>
            <Input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <Label className="mb-1 block">Phone</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-success text-white mt-4"
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Payment;
