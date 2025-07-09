import "dotenv/config";

interface EnvConfig {
    PORT: number;
    APP_URL: string;
    E2B_API_KEY: string
}

export const Config: EnvConfig = {
    PORT: parseInt(process.env.PORT as string),
    APP_URL: process.env.APP_URL as string,
    E2B_API_KEY: process.env.E2B_API_KEY as string
}