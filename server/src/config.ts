import { config as configDotenv } from "dotenv";
import * as path from "path";

switch (process.env.NODE_ENV) {
    case "development":
        configDotenv({
            path: path.resolve(process.cwd(), ".env.development"),
        });
        break;
    case "test":
        configDotenv({
            path: path.resolve(process.cwd(), ".env.test"),
        });
        break;
    case "production":
        configDotenv({
            path: path.resolve(process.cwd(), ".env.production"),
        });
        break;
    default:
        throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled!`);
}

export const REGION = process.env.REGION || "";

export const S3_BUCKET = process.env.S3_BUCKET || "";

export const DYNAMO_TABLE = process.env.DYNAMO_TABLE || "";

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";

export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

export const IS_DEV = process.env.NODE_ENV === "development";

export const TARGET_ACCOUNT_ID = process.env.TARGET_ACCOUNT_ID || "";

export const TARGET_ROLE_NAME = process.env.TARGET_ROLE_NAME || "";
