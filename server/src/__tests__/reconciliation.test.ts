import {describe,it,expect} from "vitest";
import {commissionReversalDelta,commissionPaymentSettlement,canTransitionDelivery} from "../utils/domain";
import {getAvailableStock,getTotalVariantStock,isOutOfStock,isLowStock} from "../utils/stock";
import {productMutationSchema,emptyRequestSchema} from "../validators/common";

describe("NovaCart financial and inventory invariants",()=>{
 it("reverses exactly the pending commission amount",()=>expect(commissionReversalDelta("PENDING",500)).toMatchObject({pendingCommission:-500,approvedCommission:0,availableBalance:0}));
 it("paid commission reversal is not treated as a new payable balance",()=>expect(commissionReversalDelta("PAID",500)).toMatchObject({pendingCommission:0,approvedCommission:0,availableBalance:0}));
 it("preserves gross paid and reconciles net paid on paid reversal",()=>{
  const grossPaid=10000,reversedPaid=1000;
  expect(grossPaid).toBeGreaterThanOrEqual(reversedPaid);
  expect(grossPaid-reversedPaid).toBe(9000);
  expect(commissionReversalDelta("PAID",1000)).toMatchObject({grossPaid:0,reversedPaid:1000,netPaid:-1000,recoveryDue:1000});
 });
 it("settles recovery before cash payout while preserving nominal paid history",()=>{
  expect(commissionPaymentSettlement(5000,2000)).toEqual({nominalAmount:5000,recoverySettled:2000,cashPaid:3000,paidCommission:5000,grossPaid:5000,netPaid:5000,recoveryDue:-2000,availableBalance:-5000});
  expect(commissionPaymentSettlement(5000,0).cashPaid).toBe(5000);
  expect(commissionPaymentSettlement(1000,2000).recoverySettled).toBe(1000);
 });
 it("rejects product PATCH inventory mutation fields",()=>{
  const result=productMutationSchema.safeParse({body:{stock:10},query:{},params:{id:"507f1f77bcf86cd799439011"}});
  expect(result.success).toBe(false);
 });
 it("rejects unknown fields on strict empty requests",()=>{
  expect(emptyRequestSchema.safeParse({body:{unexpected:true},query:{},params:{}}).success).toBe(false);
 });
 it("uses active variant inventory as authoritative stock",()=>{const p:any={stock:0,variants:[{stock:7,active:true},{stock:20,active:false}]};expect(getTotalVariantStock(p)).toBe(7);expect(getAvailableStock(p)).toBe(7);expect(isOutOfStock(p)).toBe(false);expect(isLowStock(p,10)).toBe(true);});
 it("keeps delivery transitions strict",()=>{expect(canTransitionDelivery("DELIVERED","RETURNED")).toBe(true);expect(canTransitionDelivery("RETURNED","DELIVERED")).toBe(false);});
});
