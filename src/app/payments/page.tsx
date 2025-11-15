import  {AdminLays}  from "@/components/AdminLays";
import  Payment  from "@/components/Payment";


export default function payments(){
    return(
        <AdminLays>
            <div className="bg-white">
                <Payment/>
            </div>
        </AdminLays>
    )
}