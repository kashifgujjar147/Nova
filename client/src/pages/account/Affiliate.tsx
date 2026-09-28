import{useEffect,useState}from"react";import{request,apiError}from"../../api";import{money}from"../../components/Layout";

export function Affiliate(){
 const[d,setD]=useState<any>(),[withdrawals,setWithdrawals]=useState<any[]>([]),[err,setErr]=useState(""),[range,setRange]=useState("30"),[customFrom,setCustomFrom]=useState(""),[customTo,setCustomTo]=useState(""),[loading,setLoading]=useState(false);
 const[w,setW]=useState<any>({method:"EASYPAISA",accountTitle:"",accountNumber:"",bankName:"",amount:"",note:""});
 const load=()=>{
   setErr("");
   const now=new Date();let qs="";
   if(range==="custom"){
     if(!customFrom||!customTo){setErr("Select both custom dates.");return}
     qs=`?from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`
   }else if(range!=="all"){
     const from=new Date(now);from.setDate(now.getDate()-Number(range));
     qs=`?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(now.toISOString())}`
   }
   Promise.all([
     request("get",`/affiliates/dashboard${qs}`),
     request("get","/withdrawals/mine")
   ]).then(([a,b])=>{setD(a.data);setWithdrawals(b.data||[])}).catch(e=>setErr(apiError(e)));
 };
 useEffect(load,[range]);
 const share=()=>{
   const url=location.origin+"/products?ref="+d.code;
   navigator.clipboard?.writeText(url);
   if(navigator.share)navigator.share({url}).catch(()=>{});
 };
 const submitWithdrawal=async(e:any)=>{
   e.preventDefault();setLoading(true);setErr("");
   try{
     await request("post","/withdrawals",{...w,amount:Number(w.amount)});
     setW({method:"EASYPAISA",accountTitle:"",accountNumber:"",bankName:"",amount:"",note:""});
     load();
   }catch(e){setErr(apiError(e))}finally{setLoading(false)}
 };
 return <main className="page">
  <div className="section-head"><div><span className="eyebrow">RESELLER CENTER</span><h1>Reseller dashboard</h1></div><div><select value={range}onChange={e=>setRange(e.target.value)}><option value="1">Today</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="all">All time</option><option value="custom">Custom</option></select>{range==="custom"&&<><input type="date"value={customFrom}onChange={e=>setCustomFrom(e.target.value)}/><input type="date"value={customTo}onChange={e=>setCustomTo(e.target.value)}/><button className="btn ghost"onClick={load}>Apply</button></>}<button className="btn"onClick={share}>Share catalogue link</button></div></div>
  {err&&<div className="error">{err} <button onClick={load}>Retry</button></div>}
  <div className="card"><p>Your reseller code</p><h2>{d?.code||"Loading…"}</h2><p>Share <code>?ref={d?.code}</code>. Attribution is validated server-side.</p></div>
  <div className="stats">{[["Clicks",d?.clicks],["Unique visitors",d?.uniqueVisitors],["Conversions",d?.conversions],["Conversion rate",`${d?.conversionRate??0}%`],["Orders",d?.orders],["Sales",money(d?.sales)],["Pending",money(d?.pending)],["Approved",money(d?.approved)],["Paid",money(d?.paid)],["Reversed",money(d?.reversedCommission)],["Recovery due",money(d?.recoveryDue)],["Balance",money(d?.balance)]].map(x=><div key={x[0]}><span>{x[0]}</span><strong>{x[1]??"…"}</strong></div>)}</div>
  <section className="section">
   <h2>Commission withdrawal</h2>
   <div className="card"><p>Available commission: <strong>{money(d?.balance??0)}</strong></p><form onSubmit={submitWithdrawal} className="form-grid">
    <label><span>Amount</span><input required type="number" min="0.01" step="0.01" max={d?.balance||0} value={w.amount} onChange={e=>setW({...w,amount:e.target.value})}/></label>
    <label><span>Withdrawal method</span><select value={w.method} onChange={e=>setW({...w,method:e.target.value})}><option value="EASYPAISA">Easypaisa</option><option value="JAZZCASH">JazzCash</option><option value="BANK_TRANSFER">Bank Transfer</option></select></label>
    <label><span>Account title</span><input required value={w.accountTitle} onChange={e=>setW({...w,accountTitle:e.target.value})}/></label>
    <label><span>Account / IBAN</span><input required value={w.accountNumber} onChange={e=>setW({...w,accountNumber:e.target.value})}/></label>
    {w.method==="BANK_TRANSFER"&&<label><span>Bank name</span><input required value={w.bankName} onChange={e=>setW({...w,bankName:e.target.value})}/></label>}
    <label><span>Note (optional)</span><input value={w.note} onChange={e=>setW({...w,note:e.target.value})}/></label>
    <button className="btn" disabled={loading||!Number(w.amount)||Number(w.amount)>Number(d?.balance||0)}>{loading?"Submitting…":"Request withdrawal"}</button>
   </form></div>
   <h2>Withdrawal history</h2>
   {withdrawals.length?withdrawals.map(x=><div className="line"key={x._id}><span>{money(x.amount)}<small>{x.method} · {new Date(x.createdAt).toLocaleString()}</small></span><b>{x.status}</b><span>{x.paymentReference||x.adminNote||""}</span></div>):<div className="empty">No withdrawal requests yet.</div>}
   <h2>Performance overview</h2><div className="chart-grid">{[["Clicks",d?.charts?.clicks?.map((x:any)=>x.value)||[]],["Conversions",d?.charts?.conversions?.map((x:any)=>x.orders)||[]],["Sales",d?.charts?.sales?.map((x:any)=>Number(x.value)||0)||[]],["Commission",d?.charts?.commission?.map((x:any)=>Number(x.value)||0)||[]]].map(([label,values]:any)=><div className="chart-card"key={label}><strong>{label}</strong><div className="bars">{values.length?values.map((v:number,i:number)=><i key={i}style={{height:`${Math.max(4,Math.min(100,(v/Math.max(...values,1))*100))}%`}}/>):<span>No data</span>}</div></div>)}</div>
   <h2>Recent activity</h2>{d?.recentClicks?.map((x:any)=><div className="line"key={x._id}><span>{x.product?.name||"Product"}<small>{new Date(x.createdAt).toLocaleString()}</small></span><span>{x.userAgent?.slice(0,60)||"Visitor"}</span></div>)}
   <h2>Recent Conversions</h2>{d?.recentConversions?.map((x:any)=><div className="line"key={x._id}><span>{x.order?.orderNumber||"Order"}<small>{new Date(x.createdAt).toLocaleDateString()}</small></span><span>{money(x.validSales||x.grossSales)}</span><b>{x.status}</b></div>)}
   <h2>Reseller orders</h2>{d?.referredOrders?.slice(0,20).map((x:any)=><div className="line"key={x._id}><span>{x.orderNumber}<small>{new Date(x.createdAt).toLocaleDateString()}</small></span><span>{money(x.total)}</span><b>{x.status}</b></div>)}
   <h2>Earnings & commission history</h2>{d?.commissions?.length?d.commissions.map((c:any)=><div className="line"key={c._id}><span>{c.order?.orderNumber||"Order"}<small>{new Date(c.createdAt).toLocaleDateString()}</small></span><b>{money(c.amount)}</b><span>{c.status}</span></div>):<div className="empty">No commissions yet.</div>}
  </section>
 </main>
}
