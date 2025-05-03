// sirv.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { readFileSync } from 'fs';

@Injectable()
export class SirvService {
  private clientId = process.env.SIRV_CLIENT_ID;
  private clientSecret = process.env.SIRV_CLIENT_SECRET;
  private sirvDomain = process.env.SIRV_DOMAIN;

  private accessToken: string;
  private tokenExpiry: number;

  async authenticate() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken; // already valid
    }

    const response = await axios.post('https://api.sirv.com/v2/token', {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000; // minus 1 min buffer

    return this.accessToken;
  }

  async uploadFile(localFilePath: string, remotePath: string) {
    const token = await this.authenticate();

    const formData = new FormData();
    formData.append('file', readFileSync(localFilePath));

    const response = await axios.post(
      `https://api.sirv.com/v2/files/upload?filename=${remotePath}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      },
    );

    return `${this.sirvDomain}/${remotePath}`;
  }
}
