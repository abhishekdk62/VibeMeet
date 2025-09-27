"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cors_io_adapter_1 = require("./modules/invites/cors-io.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new cors_io_adapter_1.CorsIoAdapter(app));
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
//# sourceMappingURL=main.js.map