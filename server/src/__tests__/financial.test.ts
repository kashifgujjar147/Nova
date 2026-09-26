import {describe,it,expect} from "vitest";
import {getAvailableStock,hasAvailableStock,getTotalVariantStock} from "../utils/stock";
import {roundMoney,percentMoney} from "../utils/money";
import {calculateDiscountedPrice,effectivePrice} from "../services/products.service";
describe("stock invariants",()=>{
 it("uses active variant stock instead of parent stock",()=>{const p={stock:0,variants:[{stock:10,active:true},{stock:5,active:false}]};expect(getTotalVariantStock(p)).toBe(10);expect(getAvailableStock(p)).toBe(10);expect(hasAvailableStock(p,10)).toBe(true);expect(hasAvailableStock(p,11)).toBe(false);});
 it("uses parent stock for non-variant products",()=>expect(getAvailableStock({stock:7,variants:[] })).toBe(7));
});
describe("money invariants",()=>{it("rounds and calculates percentage consistently",()=>{expect(roundMoney(100.005)).toBe(100.01);expect(percentMoney(1250,8)).toBe(100);});});

describe("product discount rules",()=>{
 it("calculates a 20% discount on Rs. 3000",()=>expect(calculateDiscountedPrice(3000,"percentage",20)).toBe(2400));
 it("calculates a Rs. 500 fixed discount on Rs. 3000",()=>expect(calculateDiscountedPrice(3000,"fixed",500)).toBe(2500));
 it("activates limited-time offers only inside the offer window",()=>{
   const start=new Date("2026-09-10T00:00:00Z"),end=new Date("2026-09-20T00:00:00Z");
   const product={originalPrice:3000,salePrice:3000,discountType:"percentage",discountValue:20,limitedTimeOffer:true,offerStartDate:start,offerEndDate:end};
   expect(effectivePrice(product,undefined,new Date("2026-09-01T00:00:00Z"))).toBe(3000);
   expect(effectivePrice(product,undefined,new Date("2026-09-15T00:00:00Z"))).toBe(2400);
   expect(effectivePrice(product,undefined,new Date("2026-09-21T00:00:00Z"))).toBe(3000);
 });
});
