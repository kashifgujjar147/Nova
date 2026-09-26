export const ORDER_STATUSES=["PENDING","PAYMENT_REVIEW","PAYMENT_APPROVED","PROCESSING","PACKED","SHIPPED","IN_TRANSIT","DELIVERED","COMPLETED","CANCELLED","REFUNDED"] as const;
export const PAYMENT_STATUSES=["PENDING","UNDER_REVIEW","APPROVED","REJECTED","REFUNDED"] as const;
export const COMMISSION_STATUSES=["PENDING","APPROVED","PAID","REVERSED","REJECTED"] as const;
export const percentageCommission=(base:number,rate:number)=>Math.max(0,base)*Math.max(0,rate)/100;
export const isSelfReferral=(affiliateUser:string,customerUser:string)=>affiliateUser===customerUser;
export const validQuantity=(q:unknown)=>typeof q==="number"&&Number.isInteger(q)&&q>=1;
export const roundMoney=(value:number)=>Math.round((Number(value)+Number.EPSILON)*100)/100;
export const percentMoney=(base:number,rate:number)=>roundMoney(base*rate/100);
const orderTransitions:Record<string,string[]>={PENDING:["PAYMENT_REVIEW","PAYMENT_APPROVED","CANCELLED"],PAYMENT_REVIEW:["PAYMENT_APPROVED","PENDING","CANCELLED"],PAYMENT_APPROVED:["PROCESSING","CANCELLED"],PROCESSING:["PACKED","CANCELLED"],PACKED:["SHIPPED"],SHIPPED:["IN_TRANSIT"],IN_TRANSIT:["DELIVERED"],DELIVERED:["COMPLETED"]};
export const canTransitionOrder=(from:string,to:string)=>Boolean(orderTransitions[from]?.includes(to));
const paymentTransitions:Record<string,string[]>={PENDING:["UNDER_REVIEW","APPROVED","REJECTED"],UNDER_REVIEW:["APPROVED","REJECTED"],REJECTED:["UNDER_REVIEW"],APPROVED:["REFUNDED"]};
export const canTransitionPayment=(from:string,to:string)=>Boolean(paymentTransitions[from]?.includes(to));
export const commissionReversalDelta=(status:"PENDING"|"APPROVED"|"PAID",amount:number)=>({
  pendingCommission:status==="PENDING"?-amount:0,
  approvedCommission:status==="APPROVED"?-amount:0,
  paidCommission:0,
  availableBalance:status==="APPROVED"?-amount:0,
  grossPaid:0,
  reversedPaid:status==="PAID"?amount:0,
  netPaid:status==="PAID"?-amount:0,
  recoveryDue:status==="PAID"?amount:0,
  reversedAmount:amount
});
export const commissionPaymentSettlement=(amount:number,recoveryDue:number)=>{
  const nominal=Math.max(0,roundMoney(amount));
  const recoverySettled=Math.min(nominal,Math.max(0,roundMoney(recoveryDue)));
  const cashPaid=roundMoney(nominal-recoverySettled);
  return {nominalAmount:nominal,recoverySettled,cashPaid,paidCommission:nominal,grossPaid:nominal,netPaid:nominal,recoveryDue:-recoverySettled,availableBalance:-nominal};
};
export const deliveryTransitions:Record<string,string[]>={PENDING:["PACKED","SHIPPED","FAILED"],PACKED:["SHIPPED","FAILED"],SHIPPED:["IN_TRANSIT","FAILED","RETURNED"],IN_TRANSIT:["OUT_FOR_DELIVERY","FAILED","RETURNED"],OUT_FOR_DELIVERY:["DELIVERED","FAILED"],DELIVERED:["RETURNED"],FAILED:["RETURNED"],RETURNED:[]};
export const canTransitionDelivery=(from:string,to:string)=>Boolean(deliveryTransitions[from]?.includes(to));
