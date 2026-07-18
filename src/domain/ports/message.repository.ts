import type { Contact, Message } from '../entities/message.entity';

export interface MessageRepository {
  getContacts(userId: number): Promise<Contact[]>;
  getMessagesWithContact(userId: number, contactId: number): Promise<Message[]>;
  sendMessage(data: Partial<Message>): Promise<Message>;
}
