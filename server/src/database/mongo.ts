import mongoose from 'mongoose'; import {env} from '../config/env'; export const connectDatabase=()=>mongoose.connect(env.MONGODB_URI);
