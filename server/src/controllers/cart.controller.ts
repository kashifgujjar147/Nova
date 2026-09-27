import {Cart,Product} from "../models";
import {ok} from "../utils/response";
import {guestHash} from "../middleware/guestSession";

async function normalizeItems(input:any[]){
  const items:any[]=[];

  for(const x of input){
    const p:any=await Product.findOne({_id:x.product,active:true,availability:true});

    if(!p)throw Object.assign(new Error("Invalid product"),{status:400});

    if(!Number.isInteger(x.quantity)||x.quantity<1)
      throw Object.assign(new Error("Quantity must be a positive integer"),{status:400});

    let variant:any=null;

    if(p.variants?.length){
      if(!x.variant?.variantId)
        throw Object.assign(new Error(`Please select a variant for ${p.name}`),{status:400});

      variant=p.variants.id(x.variant.variantId);

      if(!variant||variant.active===false)
        throw Object.assign(new Error(`Invalid variant for ${p.name}`),{status:400});

      if(variant.stock<x.quantity)
        throw Object.assign(new Error(`Insufficient variant stock for ${p.name}`),{status:409});
    }else{
      if(p.stock<x.quantity)
        throw Object.assign(new Error(`Insufficient stock for ${p.name}`),{status:409});
    }

    items.push({
      product:p._id,
      quantity:x.quantity,
      variant:variant
        ? {
            variantId:variant._id,
            sku:variant.sku,
            name:variant.name,
            attributes:Object.fromEntries(variant.attributes||[])
          }
        : x.variant||{}
    });
  }

  return items;
}

function sameLine(a:any,b:any){
  return String(a.product)===String(b.product)
    && String(a.variant?.variantId||"")===String(b.variant?.variantId||"");
}

async function mergeGuestIntoUser(userId:string,guestTokenHash:string){
  const guest:any=await Cart.findOne({guestTokenHash});

  if(!guest?.items?.length)return;

  const userCart:any=await Cart.findOne({user:userId});

  if(!userCart){
    await Cart.create({
      user:userId,
      items:guest.items
    });
    await Cart.deleteOne({_id:guest._id});
    return;
  }

  const merged:any[]=Array.isArray(userCart.items)
    ? userCart.items.map((x:any)=>x.toObject?x.toObject():x)
    : [];

  for(const item of guest.items){
    const found=merged.find(x=>sameLine(x,item));

    if(found){
      found.quantity=Math.min(999,Number(found.quantity||0)+Number(item.quantity||0));
    }else{
      merged.push(item.toObject?item.toObject():item);
    }
  }

  const safe=await normalizeItems(merged);

  await Cart.updateOne(
    {_id:userCart._id},
    {$set:{items:safe}}
  );

  await Cart.deleteOne({_id:guest._id});
}

export async function get(req:any,res:any){
  if(req.user){
    if(req.guestTokenHash)
      await mergeGuestIntoUser(req.user.id,req.guestTokenHash);

    let c=await Cart.findOne({user:req.user.id}).populate("items.product");

    if(!c)c=await Cart.create({user:req.user.id,items:[]});

    return ok(res,c);
  }

  let c=await Cart.findOne({guestTokenHash:req.guestTokenHash}).populate("items.product");

  if(!c)c=await Cart.create({
    guestTokenHash:req.guestTokenHash,
    items:[]
  });

  return ok(res,c);
}

export async function save(req:any,res:any){
  const items=await normalizeItems(req.body.items);

  if(req.user){
    if(req.guestTokenHash)
      await mergeGuestIntoUser(req.user.id,req.guestTokenHash);

    return ok(res,await Cart.findOneAndUpdate(
      {user:req.user.id},
      {$set:{items}},
      {new:true,upsert:true}
    ).populate("items.product"));
  }

  return ok(res,await Cart.findOneAndUpdate(
    {guestTokenHash:req.guestTokenHash},
    {$set:{items}},
    {new:true,upsert:true}
  ).populate("items.product"));
}
