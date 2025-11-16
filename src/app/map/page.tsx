import { AdminLayout } from "@/components/AdminLayout";
import ShopMap from "@/components/ShopMap";

export default function MapsPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <ShopMap />
      </div>
    </AdminLayout>
  );
}

