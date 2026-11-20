import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { readCampaignSpend } from "@/lib/ad-spend";
import AdSpendForm from "@/components/admin/AdSpendForm";
export const dynamic = "force-dynamic";
const INR = (v:number) => `₹${v.toLocaleString("en-IN",{maximumFractionDigits:2})}`;
export default async function RoasPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [orders,spend] = await Promise.all([listOrders(),readCampaignSpend()]);
  const rows = spend.map(s => {
    const matched = orders.filter(o => {
      if (o.status === "cancelled" || o.acquisition?.source?.toLowerCase() !== s.source || o.acquisition?.campaign?.toLowerCase() !== s.campaign.toLowerCase()) return false;
      const liveCheckout = o.checkout?.status === "paid" && o.checkout.test === false;
      const liveLink = o.pay?.status === "paid" && o.pay.test === false;
      if (!liveCheckout && !liveLink) return false;
      const paidAt = liveCheckout ? o.checkout?.paidAt : o.pay?.paidAt;
      return !!paidAt && paidAt.slice(0,10) >= s.start && paidAt.slice(0,10) <= s.end;
    });
    const revenue = matched.reduce((sum,o)=>sum+(o.checkout?.status === "paid"&&o.checkout.test === false?o.total:Math.min(o.total,o.pay?.amountPaid||0)),0);
    return {...s, orders:matched.length,revenue,roas:s.amount>0?revenue/s.amount:null};
  });
  const totalSpend = rows.reduce((a,x)=>a+x.amount,0);
  const totalRevenue = rows.reduce((a,x)=>a+x.revenue,0);
  return <main style={{maxWidth:1200,margin:"32px auto",padding:"0 20px",fontFamily:"system-ui"}}>
    <Link href="/admin/crm">← CRM</Link>
    <h1>GADDA campaign ROAS — directional</h1>
    <p>Enter actual spend from Meta/Google. Orders must have a matching consented UTM source and campaign and a confirmed live payment within the date window. This is not platform-certified attribution or net profit.</p>
    <p><b>Measured spend:</b> {INR(totalSpend)} · <b>Matched paid revenue:</b> {INR(totalRevenue)} · <b>Directional ROAS:</b> {totalSpend>0?(totalRevenue/totalSpend).toFixed(2)+"×":"n/a"} · <b>Target:</b> 9.1×</p>
    <AdSpendForm/>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%"}}><thead><tr>{["Source","Campaign","From","To","Spend","Paid orders","Paid revenue","ROAS"].map(h=><th key={h} style={{borderBottom:"1px solid #aaa",padding:10,textAlign:"left"}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{[r.source,r.campaign,r.start,r.end,INR(r.amount),r.orders,INR(r.revenue),r.roas===null?"n/a":r.roas.toFixed(2)+"×"].map((v,j)=><td key={j} style={{padding:10,borderBottom:"1px solid #ddd"}}>{v}</td>)}</tr>)}</tbody></table></div>
    <p><small>Rows are campaign spend entries, not imported ad-platform reports. Avoid overlapping dates for the same campaign; they double-count matched revenue. Refunds/chargebacks may not be deducted here. Export and reconcile against Razorpay and ad accounts before making scaling decisions.</small></p>
  </main>;
}
