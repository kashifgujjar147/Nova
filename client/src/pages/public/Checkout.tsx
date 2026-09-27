import React,{useEffect,useState}from"react";
import{useNavigate}from"react-router-dom";
import{request,apiError}from"../../api";
import{money}from"../../components/Layout";
import type{
  CartResponse,
  CheckoutPreview,
  CheckoutPreviewItem,
  CreatedOrderResponse,
  PaymentMethod
}from"../../types";

export function Checkout(){
  const[c,setC]=useState<CartResponse>();
  const[methods,setM]=useState<PaymentMethod[]>([]);
  const[summary,setSummary]=useState<CheckoutPreview>();
  const[f,setF]=useState<Record<string,string>>({
    country:"Pakistan"
  });
  const[coupon,setCoupon]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[loggedIn]=useState(Boolean(localStorage.token));
  const nav=useNavigate();

  const preview=async()=>{
    try{
      const url=loggedIn
        ?"/checkout/preview"
        :"/checkout/guest/preview";

      const r=await request<CheckoutPreview>(
        "get",
        url
      );

      setSummary(r.data);
      setErr("");
    }catch(e){
      setErr(apiError(e));
      setSummary(undefined);
    }
  };

  useEffect(()=>{
    Promise.all([
      request<CartResponse>(
        "get",
        loggedIn?"/cart":"/cart/guest"
      ),
      request<PaymentMethod[]>(
        "get",
        "/payment-methods"
      )
    ])
    .then(([a,b])=>{
      setC(a.data);
      setM(b.data);
      return preview();
    })
    .catch(e=>setErr(apiError(e)));
  },[]);

  const submit=async(e:any)=>{
    e.preventDefault();

    setLoading(true);

    try{
      const url=loggedIn
        ?"/checkout"
        :"/checkout/guest";

      const r=await request<CreatedOrderResponse>(
        "post",
        url,
        {
          paymentMethod:f.paymentMethod,
          address:f,
          couponCode:loggedIn
            ?(coupon||undefined)
            :undefined
        },
        {
          "Idempotency-Key":crypto.randomUUID()
        }
      );

      nav("/payment/"+r.data._id);
    }catch(e){
      setErr(apiError(e));
    }finally{
      setLoading(false);
    }
  };

  return (
    <main className="page checkout">
      <div>
        <h1>Checkout</h1>

        {!loggedIn&&(
          <div className="card">
            <strong>Guest checkout</strong>
            <p>
              No account is required. You can create one later
              to access order history and saved addresses.
            </p>
          </div>
        )}

        {err&&<div className="error">{err}</div>}

        <form onSubmit={submit}>
          <h2>Customer & address</h2>

          <input
            required
            placeholder="Full name"
            value={f.fullName||""}
            onChange={e=>setF({...f,fullName:e.target.value})}
          />

          <input
            required
            placeholder="Phone"
            value={f.phone||""}
            onChange={e=>setF({...f,phone:e.target.value})}
          />

          <input
            type="email"
            placeholder="Email (optional)"
            value={f.email||""}
            onChange={e=>setF({...f,email:e.target.value})}
          />

          <input
            required
            placeholder="Street / full address"
            value={f.address||""}
            onChange={e=>setF({...f,address:e.target.value})}
          />

          <input
            required
            placeholder="City"
            value={f.city||""}
            onChange={e=>setF({...f,city:e.target.value})}
          />

          <input
            placeholder="Province"
            value={f.province||""}
            onChange={e=>setF({...f,province:e.target.value})}
          />

          <input
            placeholder="Postal code"
            value={f.postalCode||""}
            onChange={e=>setF({...f,postalCode:e.target.value})}
          />

          <h2>Payment</h2>

          <select
            required
            value={f.paymentMethod||""}
            onChange={e=>
              setF({...f,paymentMethod:e.target.value})
            }
          >
            <option value="">Select payment method</option>
            {methods.map(m=>
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            )}
          </select>

          {loggedIn&&(
            <div className="coupon-row">
              <input
                value={coupon}
                placeholder="Coupon code (optional)"
                onChange={e=>setCoupon(e.target.value)}
              />
              <button
                type="button"
                className="btn ghost"
                onClick={preview}
              >
                Apply
              </button>
            </div>
          )}

          <button
            className="btn"
            disabled={loading||!summary||!c?.items?.length}
          >
            {loading
              ?"Creating order…"
              :"Place order securely"}
          </button>
        </form>
      </div>

      <aside className="card">
        <h2>Order summary</h2>

        {summary?.items?.map(
          (x:CheckoutPreviewItem)=>
            <div className="line" key={x.product}>
              <span>
                {x.name} × {x.quantity}
                <small>{x.sku||""}</small>
              </span>
              <b>{money(x.lineTotal)}</b>
            </div>
        )}

        <p>
          Subtotal <b>{money(summary?.subtotal??0)}</b>
        </p>

        <p>
          Discount <b>-{money(summary?.discount??0)}</b>
        </p>

        <p>
          Shipping <b>{money(summary?.shipping??0)}</b>
        </p>

        <h2>
          Total {money(summary?.total??0)}
        </h2>

        {summary?.coupon&&
          <small>Coupon {summary.coupon} applied.</small>
        }
      </aside>
    </main>
  );
}
