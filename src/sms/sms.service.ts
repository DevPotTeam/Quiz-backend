// src/sms/sms.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'http://control.yourbulksms.com/api/sendhttp.php';
  private readonly authKey = process.env.YOURBULKSMS_AUTH_KEY || '35306573746d6f37393974';
  private readonly sender = process.env.YOURBULKSMS_SENDER || 'TESTMO'; 
  private readonly route = '2';
  private readonly country = '0';
  private readonly templateId = process.env.YOURBULKSMS_TEMPLATEID || '1707173590027424849'

  async sendSms(mobileNumbers: string, message: string, isUnicode = false): Promise<void> {
    try {
      const params = {
        authkey: this.authKey,
        mobiles: mobileNumbers,
        message,
        sender: this.sender,
        route: this.route,
        country: this.country,
        DLT_TE_ID:this.templateId,
        // ...(isUnicode && { unicode: '1' }), 
      };

      const response = await axios.get(this.apiUrl, { params });
     console.log("response",response)
     console.log("data",response.data)
      if (response.status !== 200 || !response.data) {
        this.logger.error(`SMS API responded with status: ${response.status}`);
        throw new InternalServerErrorException('Failed to send SMS');
      }

      console.log("sms sent to this api",`Sms successfully sent to this number ${mobileNumbers}`)

      this.logger.log(`SMS sent successfully to ${mobileNumbers}. Response: ${response.data}`);
    } catch (error) { 
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error while sending SMS: ${error.message}`, error.stack);
        throw new InternalServerErrorException('SMS service is currently unavailable');
      } else {
        this.logger.error(`Unexpected error: ${error.message}`, error.stack);
        throw new InternalServerErrorException('An unexpected error occurred while sending SMS');
      }
    }
  }
}
