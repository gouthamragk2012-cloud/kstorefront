import { ApiClient } from '../client';

export interface SupportMessage {
  message_id: number;
  order_id?: number;
  message_text: string;
  sender: 'customer' | 'admin';
  status: 'pending' | 'replied' | 'closed';
  created_at: string;
}

export interface SendMessageRequest {
  message: string;
  order_id?: number;
}

class SupportService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  async sendMessage(data: SendMessageRequest, token: string): Promise<any> {
    return this.client.post('/support/messages', data, token);
  }

  async getMessages(token: string): Promise<SupportMessage[]> {
    const response = await this.client.get('/support/messages', token);
    return response.data || response;
  }

  async closeMessage(messageId: number, token: string): Promise<any> {
    return this.client.put(`/support/messages/${messageId}/close`, {}, token);
  }
}

export const supportService = new SupportService();
