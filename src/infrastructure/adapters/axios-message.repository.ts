import { apiClient } from '../http/axios-client';
import type { MessageRepository } from '@/domain/ports/message.repository';
import type { Contact, Message } from '@/domain/entities/message.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosMessageRepository implements MessageRepository {
  async getContacts(userId: number): Promise<Contact[]> {
    try {
      const { data } = await apiClient.get<Contact[]>('/messages/contacts/', { 
        params: { user_id: userId } 
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getMessagesWithContact(userId: number, contactId: number): Promise<Message[]> {
    try {
      const { data } = await apiClient.get<Message[]>(`/messages/conversations/${contactId}/`, {
        params: { user_id: userId }
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async sendMessage(payload: Partial<Message>): Promise<Message> {
    try {
      const { data } = await apiClient.post<Message>('/messages/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
