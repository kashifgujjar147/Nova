export const roundMoney = (value:number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export const percentMoney = (base:number, rate:number) => roundMoney(base * rate / 100);
