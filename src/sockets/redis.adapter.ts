// import { IoAdapter } from "@nestjs/platform-socket.io";
// import { ServerOptions } from "socket.io";
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from "redis";

// export class RedisIoAdapter extends IoAdapter {
//     private adapterContructor: ReturnType<typeof createAdapter>;

//     async connectToRedis(): Promise<void> {
//       const pubClient = createClient({
//         url: 'redis://default:VeQJ9Fwr6H9x74Nq5oTjgNRIS9p1gtuY@redis-18665.c8.us-east-1-3.ec2.redns.redis-cloud.com:18665'
//       });

//       const subClient = pubClient.duplicate();
//       await Promise.all([pubClient.connect(), subClient.connect()]);

//       this.adapterContructor = createAdapter(pubClient, subClient);
//     }
    
//     createIOServer(port: number, options?: ServerOptions): any {
//         const server = super.createIOServer(port, options);
//         server.adapter(this.adapterContructor);
//         return server;
//     }

// }
