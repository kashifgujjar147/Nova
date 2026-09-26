import{describe,it,expect}from"vitest";import{percentageCommission,isSelfReferral,validQuantity,roundMoney,canTransitionOrder,canTransitionPayment,commissionReversalDelta,canTransitionDelivery}from"../utils/domain";
describe("NovaCart core business rules",()=>{
 it("calculates percentage commission from a historical line base",()=>expect(percentageCommission(2500,5)).toBe(125));
 it("blocks self referral identity matches",()=>expect(isSelfReferral("u1","u1")).toBe(true));
 it("accepts only positive integer quantities",()=>{expect(validQuantity(1)).toBe(true);expect(validQuantity(0)).toBe(false);expect(validQuantity(1.5)).toBe(false);expect(validQuantity("1")).toBe(false)});
 it("rounds money deterministically",()=>expect(roundMoney(10.005)).toBe(10.01));
 it("enforces order state transitions",()=>{expect(canTransitionOrder("PENDING","PAYMENT_REVIEW")).toBe(true);expect(canTransitionOrder("COMPLETED","PROCESSING")).toBe(false);expect(canTransitionOrder("REFUNDED","SHIPPED")).toBe(false)});
 it("enforces payment state transitions",()=>{expect(canTransitionPayment("UNDER_REVIEW","APPROVED")).toBe(true);expect(canTransitionPayment("REFUNDED","APPROVED")).toBe(false)});
});
describe("financial and delivery invariants",()=>{
 it("subtracts only the reversed pending/approved commission",()=>{expect(commissionReversalDelta("PENDING",300)).toMatchObject({pendingCommission:-300,approvedCommission:0,paidCommission:0,availableBalance:0,reversedAmount:300});expect(commissionReversalDelta("APPROVED",300).availableBalance).toBe(-300);expect(commissionReversalDelta("PAID",300).paidCommission).toBe(0)});
 it("does not allow invalid delivery transitions",()=>{expect(canTransitionDelivery("SHIPPED","IN_TRANSIT")).toBe(true);expect(canTransitionDelivery("DELIVERED","PROCESSING")).toBe(false);});
});

