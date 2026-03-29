import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello() {
    // คืนค่าเป็น Object ซึ่ง NestJS จะแปลงเป็น JSON ให้เองอัตโนมัติครับ
    return this.appService.getWelcomeMessage();
  }
}