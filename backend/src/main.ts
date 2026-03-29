import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // 🛡️ ตั้งค่าพิกัดหน้าด่านเป็น /api (เพื่อให้เหมือน server.ts เดิม)
    app.setGlobalPrefix('api');

    app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
      prefix: '/uploads/',
    });

    // 🛡️ เปิดประตูรับสัญญาณจากทุกทิศทาง
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// ⚔️ สำหรับรันในฐานที่มั่น (Local Development)
if (process.env.NODE_ENV !== 'production') {
  const startLocal = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api'); // ต้องมี api เหมือนกัน
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors();
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🛡️ Sentinel Core is running on: http://localhost:${port}/api`);
  };
  startLocal();
}

// ⚔️ สำหรับส่งออกไปยังสมรภูมิ Vercel (Serverless)
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res); 
};
