export const PRODUCTION = process.env.ENV === "production";
export const SECURE = process.env.CARBON.protocol === "https";
export const DOMAIN = process.env.CARBON.domain;