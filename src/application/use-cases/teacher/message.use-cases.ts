import type { MessageRepository } from '@/domain/ports/message.repository';
import type { Contact, Message } from '@/domain/entities/message.entity';

export class GetContactsUseCase {
  private readonly repository: MessageRepository;
  constructor(repository: MessageRepository) {
    this.repository = repository;
  }
  
  async execute(userId: number): Promise<Contact[]> {
    return this.repository.getContacts(userId);
  }
}

export class GetMessagesUseCase {
  private readonly repository: MessageRepository;
  constructor(repository: MessageRepository) {
    this.repository = repository;
  }
  
  async execute(userId: number, contactId: number): Promise<Message[]> {
    return this.repository.getMessagesWithContact(userId, contactId);
  }
}
