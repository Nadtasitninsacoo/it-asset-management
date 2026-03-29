import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage() {
    return {
      status: 'Ready',
      system: 'IT Asset Management Systems',
      version: '1.0.0',
      database_status: 'Connected',
      timestamp: new Date().toISOString(),
      author: 'Nadtasit Keng',
    };
  }
}