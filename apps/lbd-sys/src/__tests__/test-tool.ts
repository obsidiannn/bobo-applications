import "dotenv/config";
import app from '@/app';

export const buildRequest = async (route: string) => {
    return await app.request(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}