import * as s from "../services/withdrawals.service";import{ok}from"../utils/response";
export const mine=async(q:any,r:any)=>ok(r,await s.mine(q.user.id));
export const request=async(q:any,r:any)=>ok(r,await s.requestWithdrawal(q.user.id,q.body),"Withdrawal request submitted",201);
export const adminList=async(q:any,r:any)=>ok(r,await s.listAdmin(q.query));
export const transition=async(q:any,r:any)=>ok(r,await s.transition(q.params.id,q.body.status,q.user.id,q.body.note,q.body.paymentReference));
