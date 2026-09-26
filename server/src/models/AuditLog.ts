import {Schema,model} from 'mongoose';
const schema=new Schema({actor:{type:Schema.Types.ObjectId,ref:'User'},action:String,entity:String,entityId:String,metadata:Schema.Types.Mixed,ip:String},{timestamps:true});
schema.index({createdAt:-1});schema.index({actor:1,createdAt:-1});schema.index({entity:1,entityId:1,createdAt:-1});
export const AuditLog=model('AuditLog',schema);
