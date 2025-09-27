import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    console.log('🔧 Custom CorsIoAdapter being used!');
    console.log('🌐 CORS Origin:', process.env.NODE_ENV === 'dev' ? process.env.FRONTEND_URL_DEV : process.env.FRONTEND_URL_PROD);
    
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.NODE_ENV === 'dev' 
          ? process.env.FRONTEND_URL_DEV 
          : process.env.FRONTEND_URL_PROD,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    return server;
  }
}
