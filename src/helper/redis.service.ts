// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Redis } from 'ioredis';

// @Injectable()
// export class RedisService {
//   private readonly redis: Redis;
//   constructor(private readonly configService: ConfigService) {
//     this.redis = new Redis(this.configService.get('REDIS_URL'));
//     this.redis.on('connect', () => {
//       console.log('Redis connected');
//     });
//     this.redis.on('error', (error) => {
//       console.log('Redis Error', error);
//     });
//   }
//   async set(key: string, value: string) {
//     return await this.redis.set(key, value);
//   }
//   async get(key: string) {
//     return await this.redis.get(key);
//   }
//   async remove(key: string) {
//     return await this.redis.del(key);
//   }
//   // add to set
//   async sadd(key: string, value: string) {
//     return await this.redis.sadd(key, value);
//   }
//   // return members of set
//   async smembers(key: string) {
//     return await this.redis.smembers(key);
//   }
//   // return length of set
//   async getSetLength(key: string){
//     return await this.redis.scard(key);
//   }
//   // remove member from set
//   async srem(key: string, value: string) {
//     return await this.redis.srem(key, value);
//   }
//   async geoAdd(key: string, lat: number, long: number, value: string) {
//     return await this.redis.geoadd(key, long, lat, value);
//   }
//   async geoRem(key: string, value: string) {
//     return await this.redis.zrem(key, value);
//   }
// //   async enqueueOrder(order: Order) {
// //     return await this.redis.lpush('orders', JSON.stringify(order.toJSON()));
// //   }
//   async dequeueOrder() {
//     return await this.redis.rpop('orders');
//   }
//   async enqueue(key:string,data:any) {
//     return await this.redis.lpush(key, data);
//   }
//   async dequeue(key:string) {
//     return await this.redis.rpop(key);
//   }
//   async geoSearch(
//     key: string,
//     lat: number,
//     long: number,
//     distance: number,
//     unit: string,
//   ) {
//     return await this.redis.geosearch(
//       key,
//       'FROMLONLAT',
//       long,
//       lat,
//       'BYRADIUS',
//       distance,
//       unit,
//       'WITHDIST',
//       'ASC',
//     );
//   }
// }