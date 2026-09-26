export type CommissionStatus="PENDING"|"APPROVED"|"PAID"|"REVERSED"|"REJECTED";
export type OrderStatus="PENDING"|"PAYMENT_REVIEW"|"PAYMENT_APPROVED"|"PROCESSING"|"PACKED"|"SHIPPED"|"IN_TRANSIT"|"DELIVERED"|"COMPLETED"|"CANCELLED"|"REFUNDED";
export type VariantAttributes=Record<string,string>;
export type ProductVariant={_id:string;sku:string;name:string;attributes:VariantAttributes;color?:string;size?:string;price:number;compareAtPrice?:number;stock:number;active:boolean;images:string[];weight?:number;commissionType:"default"|"percentage"|"fixed";commissionValue?:number};
export type CartVariant=Pick<ProductVariant,"_id"|"sku"|"name"|"attributes"> & {color?:string;size?:string};
export type OrderItemVariant=Pick<ProductVariant,"sku"|"name"|"attributes"> & {variantId?:string;color?:string;size?:string};
export type CommissionType="percentage"|"fixed"|"mixed";
export type InventoryReason="INITIAL_STOCK"|"SALE"|"ORDER_CANCELLATION"|"CUSTOMER_REFUND"|"RETURN"|"MANUAL_ADJUSTMENT"|"DAMAGED"|"LOST"|"RESTOCK"|"CORRECTION";
