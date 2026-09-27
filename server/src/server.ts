import {app} from './app';
import {connectDatabase} from './database/mongo';
import {env} from './config/env';
import {PaymentMethod} from './models';

async function ensurePaymentMethods(){
  const methods = [
    {
      name:"Cash on Delivery",
      type:"COD",
      requiresTransactionId:false,
      requiresReceipt:false,
      requiresManualReview:false,
      active:true,
      ordering:1,
      instructions:"Pay cash when your order is delivered."
    },
    {
      name:"JazzCash",
      type:"WALLET",
      requiresTransactionId:true,
      requiresReceipt:false,
      requiresManualReview:true,
      active:true,
      ordering:2,
      instructions:"Pay through JazzCash. Enter the transaction ID after payment."
    },
    {
      name:"Easypaisa",
      type:"WALLET",
      requiresTransactionId:true,
      requiresReceipt:false,
      requiresManualReview:true,
      active:true,
      ordering:3,
      instructions:"Pay through Easypaisa. Enter the transaction ID after payment."
    },
    {
      name:"Bank Transfer",
      type:"BANK_TRANSFER",
      requiresTransactionId:true,
      requiresReceipt:true,
      requiresManualReview:true,
      active:true,
      ordering:4,
      instructions:"Transfer the order amount to the configured bank account and submit the transaction details."
    }
  ];

  for(const method of methods){
    await PaymentMethod.updateOne(
      {name:method.name},
      {$setOnInsert:method},
      {upsert:true}
    );
  }

  console.log("Payment methods verified.");
}

connectDatabase()
  .then(async()=>{
    await ensurePaymentMethods();
    app.listen(env.PORT,()=>console.log(`NovaCart API listening on ${env.PORT}`));
  })
  .catch((e:any)=>{
    console.error(e);
    process.exit(1);
  });
