"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class CorsIoAdapter extends platform_socket_io_1.IoAdapter {
    createIOServer(port, options) {
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
exports.CorsIoAdapter = CorsIoAdapter;
//# sourceMappingURL=cors-io.adapter.js.map