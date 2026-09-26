import {list} from '../services/audit.service'; import {ok} from '../utils/response'; export const all=async(q:any,r:any)=>ok(r,await list(q.query));
