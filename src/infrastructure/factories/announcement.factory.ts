import { AxiosAnnouncementRepository } from '@/infrastructure/adapters/axios-announcement.repository'
import { AnnouncementUseCase } from '@/application/use-cases/announcement.use-case'

const repository = new AxiosAnnouncementRepository()
export const announcementUseCase = new AnnouncementUseCase(repository)