import "dotenv/config";

interface EnvConfig {
    PORT: number;
    APP_URL: string;
}

export const Config: EnvConfig = {
    PORT: parseInt(process.env.PORT as string),
    APP_URL: process.env.APP_URL as string
}