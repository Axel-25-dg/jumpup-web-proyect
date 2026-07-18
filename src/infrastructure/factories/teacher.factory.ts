import { AxiosClassroomRepository } from '../adapters/axios-classroom.repository';
import { AxiosResourceRepository } from '../adapters/axios-resource.repository';
import { AxiosLiveSessionRepository } from '../adapters/axios-live-session.repository';
import { AxiosMessageRepository } from '../adapters/axios-message.repository';
import { AxiosCourseRepository } from '../adapters/axios-course.repository';

import { GetTeacherClassroomsUseCase, GetClassroomStudentsUseCase } from '@/application/use-cases/teacher/classroom.use-cases';
import { GetTeacherResourcesUseCase } from '@/application/use-cases/teacher/resource.use-cases';
import { GetTeacherLiveSessionsUseCase } from '@/application/use-cases/teacher/live-session.use-cases';
import { GetContactsUseCase, GetMessagesUseCase } from '@/application/use-cases/teacher/message.use-cases';

const classroomRepo = new AxiosClassroomRepository();
const resourceRepo = new AxiosResourceRepository();
const liveSessionRepo = new AxiosLiveSessionRepository();
const messageRepo = new AxiosMessageRepository();
export const courseRepo = new AxiosCourseRepository();

export const getTeacherClassroomsUseCase = new GetTeacherClassroomsUseCase(classroomRepo);
export const getClassroomStudentsUseCase = new GetClassroomStudentsUseCase(classroomRepo);

export const getTeacherResourcesUseCase = new GetTeacherResourcesUseCase(resourceRepo);

export const getTeacherLiveSessionsUseCase = new GetTeacherLiveSessionsUseCase(liveSessionRepo);

export const getContactsUseCase = new GetContactsUseCase(messageRepo);
export const getMessagesUseCase = new GetMessagesUseCase(messageRepo);
