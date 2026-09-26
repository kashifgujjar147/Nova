import {SiteSettings} from '../models'; export const get=()=>SiteSettings.findOne(); export const update=(d:any)=>SiteSettings.findOneAndUpdate({},d,{new:true,upsert:true});
