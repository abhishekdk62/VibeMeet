import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsIoAdapter } from './modules/invites/cors-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useWebSocketAdapter(new IoAdapter(app));
  app.useWebSocketAdapter(new CorsIoAdapter(app));

  app.enableCors({
    origin: [
      process.env.NODE_ENV == 'dev'
        ? process.env.FRONTEND_URL_DEV
        : process.env.FRONTEND_URL_PROD,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

const port = process.env.PORT ?? 4000;
await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
console.log(`📋 API endpoints available at http://localhost:${port}/api`);

}
bootstrap();
