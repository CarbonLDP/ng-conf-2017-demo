export const PRODUCTION = process.env.ENV === "production";
export const SECURE = process.env.CARBON.protocol === "https";
export const DOMAIN = process.env.CARBON.domain;
export const APP_SLUG:string = process.env.CARBON.slug;
export const CARBON_USER:string = process.env.CARBON.user;
export const CARBON_PASS:string = process.env.CARBON.pass;

export const WS_HOST = process.env.WS.host;
