import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage() {
    return {
      status: 'online',
      message: 'IT Asset Management API is running',
      version: '1.0.0',
      database: 'connected',
    };
  }
}