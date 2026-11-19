import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminAccount, isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders, paymentLabel } from "@/lib/orders";
import { readLeads } from "@/lib/leads";
import { money } from "@/lib/catalog";
import NotificationStatusPanel from "@/components/admin/NotificationStatusPanel";

export const dynamic = "force-dynamic";
const cell = { padding: "12px 14px", borderBottom: "1px solid #ddd", textAlign: "left" as const, verticalAlign: "top" as const };
const rupees = (n: number) => money(n);

export default async function CRMPage() {
  if (!(await hasAdminAccount())) redirect("/admin/setup");
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [orders, callbacks, subscribers] = await Promise.all([
    listOrders(), readLeads("callbacks"), readLeads("subscribers"),
  ]);
  const paid = orders.filter(o => (o.checkout?.status === "paid" && !o.checkout.test) || (o.pay?.status === "paid" && !o.pay.test));
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const entries = [
    ...orders.map(o => ({ id: o.id, at: o.createdAt, type: "ORDER", name: o.customer.name,
      contact: o.customer.phone, detail: `${paymentLabel(o)} · ${rupees(o.total)}`,
      source: o.acquisition?.source || "unattributed", campaign: o.acquisition?.campaign || "" })),
    ...callbacks.map((c,i) => { const a = c.acquisition as {source?:string;campaign?:string}|undefined;return {
      id: `callback-${i}`, at: String(c.at||""),type:"ENQUIRY",name:String(c.name||""),
      contact:String(c.phone||""),detail:String(c.message||c.when||"Callback requested"),
      source: a?.source || "unattributed",campaign:a?.campaign || "" };}),
    ...subscribers.map((c,i) => ({id:`subscriber-${i}`,at:String(c.at||""),type:"SUBSCRIBER",
      name:"Newsletter",contact:String(c.email||""),detail:"Email signup",source:"unattributed",campaign:""})),
  ].sort((a,b) => b.at.localeCompare(a.at));
  return <main style={{padding:"32px 5vw",maxWidth:1500,margin:"auto",fontFamily:"system-ui",color:"#232323"}}>
    <nav style={{display:"flex",gap:16,marginBottom:24}}><Link href="/admin">← Admin</Link><Link href="/admin/orders">Orders</Link><Link href="/ops">Operations</Link></nav>
    <h1>GADDA Customer &amp; Lead Inbox</h1>
    <p>Website orders, callback requests and newsletter signups. Verified payment status only — no assumed conversions.</p>
    <section style={{display:"flex",gap:20,flexWrap:"wrap",margin:"24px 0"}}>
      {[ ["Orders",orders.length], ["Verified paid orders",paid.length], ["Live captured order value (before refunds)",rupees(revenue)], ["Enquiries",callbacks.length], ["Subscribers",subscribers.length] ].map(([k,v])=><div key={String(k)} style={{padding:20,border:"1px solid #ddd",borderRadius:10,minWidth:160}}><strong style={{fontSize:24}}>{v}</strong><div>{k}</div></div>)}
    </section>
    <NotificationStatusPanel />
    <p>ROAS requires actual ad spend by campaign. UTM attribution is captured only after marketing consent; unattributed is not assumed organic.</p>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%"}}><thead><tr>{["When (IST)","Type","Customer","Phone / Email","Detail","Source","Campaign"].map(x=><th key={x} style={cell}>{x}</th>)}</tr></thead>
      <tbody>{entries.slice(0,500).map(x=><tr key={x.id}><td style={cell}>{x.at ? new Date(x.at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}):""}</td><td style={cell}>{x.type}</td><td style={cell}>{x.name}</td><td style={cell}>{x.contact}</td><td style={cell}>{x.detail}</td><td style={cell}>{x.source}</td><td style={cell}>{x.campaign}</td></tr>)}</tbody>
    </table></div>
    <p><Link href="/api/admin/orders">Download orders CSV</Link> · <Link href="/api/admin/leads?type=callbacks">Download enquiries CSV</Link></p>
  </main>;
}
