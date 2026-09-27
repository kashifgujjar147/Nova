import React,{useEffect,useState}from"react";
import{useParams}from"react-router-dom";
import{request,apiError}from"../../api";
import{money}from"../../components/Layout";
import type{
  OrderDetailResponse,
  PaymentMethod
}from"../../types";

export function Payment(){
  const{id}=useParams();

  const[m,setM]=useState<PaymentMethod[]>([]);
  const[f,setF]=useState<Record<string,string>>({});
  const[order,setOrder]=useState<OrderDetailResponse>();
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[done,setDone]=useState(false);

  const loggedIn=Boolean(localStorage.token);

  useEffect(()=>{
    Promise.all([
      request<PaymentMethod[]>(
        "get",
        "/payment-methods"
      ),
      request<OrderDetailResponse>(
        "get",
        loggedIn
          ?"/orders/"+id
          :"/orders/guest/"+id
      )
    ])
    .then(([a,b])=>{
      setM(a.data);
      setOrder(b.data);
    })
    .catch(e=>setErr(apiError(e)));
  },[id]);

  const selected=m.find(x=>x._id===f.method);

  const submit=async(e:any)=>{
    e.preventDefault();

    if(!order){
      setErr("Order details are not available.");
      return;
    }

    setLoading(true);

    try{
      const url=loggedIn
        ?"/payments"
        :"/payments/guest";

      await request(
        "post",
        url,
        {
          order:id,
          method:f.method,
          amount:Number(order.total),
          transactionId:f.transactionId||undefined,
          paymentTime:f.paymentTime||undefined,
          note:f.note||undefined
        },
        {
          "Idempotency-Key":crypto.randomUUID()
        }
      );

      setDone(true);
    }catch(e){
      setErr(apiError(e));
    }finally{
      setLoading(false);
    }
  };

  if(done){
    return (
      <main className="page narrow">
        <div className="card">
          <h1>Order received ✓</h1>
          <p>
            Your order{" "}
            <strong>{order?.orderNumber}</strong>{" "}
            has been received successfully.
          </p>

          {!loggedIn&&order&&(
            <p>
              Save your order number for tracking.
              You can create an account later and continue
              managing your orders from your account.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <h1>
        Payment for {order?.orderNumber||"order"}
      </h1>

      <p>
        Total:
        {" "}
        <strong>{money(order?.total??0)}</strong>
      </p>

      {err&&<div className="error">{err}</div>}

      <form onSubmit={submit}>
        <select
          required
          value={f.method||""}
          onChange={e=>
            setF({...f,method:e.target.value})
          }
        >
          <option value="">Method</option>

          {m.map(x=>
            <option key={x._id} value={x._id}>
              {x.name}
            </option>
          )}
        </select>

        {selected?.instructions&&(
          <div className="card">
            <p>{selected.instructions}</p>
            <p>
              {selected.accountTitle}{" "}
              {selected.accountNumber}
            </p>
          </div>
        )}

        {selected?.requiresTransactionId&&(
          <>
            <input
              required
              placeholder="Transaction ID"
              onChange={e=>
                setF({...f,transactionId:e.target.value})
              }
            />

            <input
              type="datetime-local"
              onChange={e=>
                setF({...f,paymentTime:e.target.value})
              }
            />

            <textarea
              placeholder="Payment note (optional)"
              onChange={e=>
                setF({...f,note:e.target.value})
              }
            />
          </>
        )}

        {selected?.requiresReceipt&&(
          <div className="card">
            <p>
              This payment method requires a receipt upload.
            </p>

            {!loggedIn&&(
              <p>
                Please login to upload the receipt securely,
                or choose another available payment method.
              </p>
            )}
          </div>
        )}

        <button
          className="btn"
          disabled={
            loading||
            !order||
            Boolean(selected?.requiresReceipt&&!loggedIn)
          }
        >
          {loading
            ?"Submitting…"
            :"Submit payment"}
        </button>
      </form>
    </main>
  );
}
