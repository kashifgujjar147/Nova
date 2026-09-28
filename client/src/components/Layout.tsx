import React,{useEffect,useState}from"react";
import{Link,useLocation,useNavigate}from"react-router-dom";
import{request}from"../api";
import type{CartResponse,NotificationListResponse,StoreSettings}from"../types";

export const money=(n:number)=>`PKR ${Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}`;

export default function Layout({children}:{children:React.ReactNode}){
 const location=useLocation();
 const nav=useNavigate();
 const token=localStorage.getItem("token");
 const[c,setC]=useState<CartResponse>();
 const[unread,setUnread]=useState(0);
 const[settings,setSettings]=useState<StoreSettings>();
 const[menu,setMenu]=useState(false);
 const[q,setQ]=useState("");
 const[isAdmin,setIsAdmin]=useState(false);

 useEffect(()=>{
   setMenu(false);
 },[location.pathname]);

 useEffect(()=>{
   request<StoreSettings>("get","/settings").then(r=>setSettings(r.data)).catch(()=>{});
   if(token){
     request<CartResponse>("get",token?"/cart":"/cart/guest").then(r=>setC(r.data)).catch(()=>{});
     request<NotificationListResponse>("get","/notifications?limit=1")
       .then(r=>setUnread(Number(r.data?.unread||0))).catch(()=>{});
   }
 },[token]);

 useEffect(()=>{
   if(!token){setIsAdmin(false);return}
   request<any>("get","/auth/me")
     .then(r=>setIsAdmin(r.data?.role==="admin"||r.data?.role==="super_admin"))
     .catch(()=>setIsAdmin(false));
 },[token]);

 const logout=async()=>{
   try{await request("post","/auth/logout")}
   finally{
     localStorage.removeItem("token");
     nav("/login");
   }
 };

 const submitSearch=(e:React.FormEvent)=>{
   e.preventDefault();
   const value=q.trim();
   if(value)nav(`/products?search=${encodeURIComponent(value)}`);
 };

 if(location.pathname.startsWith("/admin"))return <>{children}</>;

 return (
  <div className="site-shell">
   <div className="announcement">
    <div>Premium shopping • Secure payments • Reliable delivery</div>
    <div className="announcement-links">
     <Link to="/contact">Need help?</Link>
     <Link to="/products">Shop now</Link>
    </div>
   </div>

   <header className="site-header">
    <div className="header-main"><div className="header-inner">
     <button className="mobile-menu-button"onClick={()=>setMenu(!menu)}aria-label="Menu">
      <span></span><span></span><span></span>
     </button>

     <Link className="logo"to="/">
      {settings?.logo
       ?<img src={settings.logo}alt={settings.storeName||"NovaCart"}/>
       :<><span className="logo-mark">N</span><span>{settings?.storeName||"NovaCart"}</span></>}
     </Link>

     <nav className={`main-nav ${menu?"open":""}`}>
      <Link to="/">Home</Link>
      <Link to="/products">Shop</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/products?newArrival=true">New Arrivals</Link>
      <Link className="nav-offers"to="/products?discounted=true">Offers</Link>
     </nav>

     <form className="header-search"onSubmit={submitSearch}>
      <span>?</span>
      <input
       value={q}
       onChange={e=>setQ(e.target.value)}
       placeholder="Search products..."
       aria-label="Search products"
      />
     </form>

     <div className="header-actions">
      {token&&<Link className="icon-action"to="/account/notifications"aria-label="Notifications">
       <span>?</span>{unread>0&&<b>{unread}</b>}
      </Link>}

      <Link className="icon-action"to="/cart"aria-label="Shopping cart">
       <span>??</span>{c?.items?.length?<b>{c.items.length}</b>:null}
      </Link>

      {token
       ?<div className="account-wrap">
         <Link className="account-action"to="/account">
          <span className="account-icon">?</span>
          <span className="account-label">Account</span>
         </Link>
         <div className="account-dropdown">
          <Link to="/account">My account</Link>
          <Link to="/account/orders">Orders</Link>
          <Link to="/account/addresses">Addresses</Link>
          {isAdmin&&<Link className="admin-dropdown-link"to="/admin">Admin Panel</Link>}
          <button onClick={logout}>Logout</button>
         </div>
        </div>
       :<div className="account-wrap guest-account-links"><Link className="login-link"to="/login">Login</Link><Link className="login-link"to="/register">Create Account</Link></div>}
     </div>
    </div></div>

    <div className="mobile-search">
     <form className="header-search"onSubmit={submitSearch}>
      <span>?</span>
      <input value={q}onChange={e=>setQ(e.target.value)}placeholder="Search products..."/>
     </form>
    </div>
   </header>

   <main>{children}</main>

   <footer className="site-footer">
    <div className="footer-grid">
     <div className="footer-brand">
      <Link className="footer-logo"to="/">{settings?.storeName||"NovaCart"}</Link>
      <p>Premium products, secure checkout and a smooth shopping experience.</p>
      <div className="social-links">
       {settings?.social?.whatsapp&&<a href={String(settings.social.whatsapp)}target="_blank"rel="noreferrer">WhatsApp</a>}
       {settings?.social?.messenger&&<a href={String(settings.social.messenger)}target="_blank"rel="noreferrer">Messenger</a>}
       {settings?.social?.telegram&&<a href={String(settings.social.telegram)}target="_blank"rel="noreferrer">Telegram</a>}
       {settings?.social?.tiktok&&<a href={String(settings.social.tiktok)}target="_blank"rel="noreferrer">TikTok</a>}
      </div>
     </div>

     <div>
      <h4>Shop</h4>
      <Link to="/products">All products</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/products?newArrival=true">New arrivals</Link>
      <Link to="/products?discounted=true">Offers</Link>
     </div>

     <div>
      <h4>Account</h4>
      <Link to="/account">My account</Link>
      <Link to="/cart">Shopping cart</Link>
      <Link to="/contact">Contact us</Link>
     </div>

     <div>
      <h4>Contact</h4>
      <Link to="/contact">Contact support</Link>
      {settings?.contact?.email&&<a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
      {settings?.contact?.phone&&<a href={`tel:${settings.contact.phone}`}>{settings.contact.phone}</a>}
     </div>
    </div>

    <div className="footer-bottom">
     <span>© {new Date().getFullYear()} {settings?.storeName||"NovaCart"}. All rights reserved.</span>
     <span>Secure commerce experience</span>
    </div>
   </footer>
  </div>
 );
}

