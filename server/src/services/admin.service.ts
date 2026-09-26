import {User,Product,Order,Payment,Commission} from "../models";
export async function dashboard(){
 const valid={$nin:["CANCELLED","REFUNDED"]};
 const [gross,refunded,cancelled,orders,pendingOrders,processingOrders,completedOrders,cancelledOrders,customers,affiliates,products,low,out,pendingPayments,approvedPayments,pendingCommissions,approvedCommissions,paidCommissions,receivedPayments,pendingDeliveries]=await Promise.all([
  Order.aggregate([{$match:{paymentStatus:"APPROVED",status:valid}},{$group:{_id:null,total:{$sum:"$total"}}}]),
  Order.aggregate([{$match:{status:"REFUNDED"}},{$group:{_id:null,total:{$sum:"$total"}}}]),
  Order.aggregate([{$match:{status:"CANCELLED"}},{$group:{_id:null,total:{$sum:"$total"}}}]),
  Order.countDocuments(),Order.countDocuments({status:"PENDING"}),Order.countDocuments({status:{$in:["PAYMENT_APPROVED","PROCESSING","PACKED","SHIPPED","IN_TRANSIT"]}}),Order.countDocuments({status:"COMPLETED"}),Order.countDocuments({status:"CANCELLED"}),User.countDocuments({role:"customer"}),User.countDocuments({affiliateEnabled:true}),
  Product.countDocuments({active:true}),Product.aggregate([{$match:{active:true}},{$project:{available:{$cond:[{$gt:[{$size:{$ifNull:["$variants",[]]}},0]},{$sum:{$map:{input:{$filter:{input:{$ifNull:["$variants",[]]},as:"v",cond:{$ne:["$$v.active",false]}}},as:"v",in:"$$v.stock"}}},"$stock"]}}},{$match:{available:{$gt:0,$lte:5}}},{$count:"count"}]),Product.aggregate([{$match:{active:true}},{$project:{available:{$cond:[{$gt:[{$size:{$ifNull:["$variants",[]]}},0]},{$sum:{$map:{input:{$filter:{input:{$ifNull:["$variants",[]]},as:"v",cond:{$ne:["$$v.active",false]}}},as:"v",in:"$$v.stock"}}},"$stock"]}}},{$match:{available:0}},{$count:"count"}]),
  Payment.countDocuments({status:"UNDER_REVIEW"}),Payment.countDocuments({status:"APPROVED"}),Commission.countDocuments({status:"PENDING"}),Commission.countDocuments({status:"APPROVED"}),Commission.countDocuments({status:"PAID"}),Payment.countDocuments({status:"APPROVED"}),Order.countDocuments({status:{$in:["SHIPPED","IN_TRANSIT"]}})
 ]);
 return {grossSales:gross[0]?.total||0,refundedSales:refunded[0]?.total||0,cancelledSales:cancelled[0]?.total||0,orders,pendingOrders,processingOrders,completedOrders,cancelledOrders,customers,affiliates,products,lowStock:low[0]?.count||0,outOfStock:out[0]?.count||0,pendingPayments,approvedPayments,pendingCommissions,approvedCommissions,paidCommissions,receivedPayments,pendingDeliveries};
}
export const customersList=()=>User.find({role:"customer"}).select("-passwordHash -resetToken -resetExpires");
