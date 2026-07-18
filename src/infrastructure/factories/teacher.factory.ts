import { AxiosClassroomRepository } from '../adapters/axios-classroom.repository';
import { AxiosResourceRepository } from '../adapters/axios-resource.repository';
import { AxiosLiveSessionRepository } from '../adapters/axios-live-session.repository';
import { AxiosMessageRepository } from '../adapters/axios-message.repository';
import { AxiosCourseRepository } from '../adapters/axios-course.repository';

import {
  GetTeacherClassroomsUseCase,
  GetClassroomByIdUseCase,
  GetClassroomStudentsUseCase,
  CreateClassroomUseCase,
  UpdateClassroomUseCase,
  DeleteClassroomUseCase,
  ApproveStudentUseCase,
  RejectStudentUseCase,
  RemoveStudentUseCase,
} from '@/application/use-cases/teacher/classroom.use-cases';
import {
  GetTeacherResourcesUseCase,
  UploadResourceUseCase,
  DeleteResourceUseCase,
} from '@/application/use-cases/teacher/resource.use-cases';
import {
  GetTeacherLiveSessionsUseCase,
  CreateLiveSessionUseCase,
  UpdateLiveSessionUseCase,
  CancelLiveSessionUseCase,
  DeleteLiveSessionUseCase,
} from '@/application/use-cases/teacher/live-session.use-cases';
import {
  GetContactsUseCase,
  GetMessagesUseCase,
  SendMessageUseCase,
} from '@/application/use-cases/teacher/message.use-cases';

// Repositories
const classroomRepo = new AxiosClassroomRepository();
const resourceRepo = new AxiosResourceRepository();
const liveSessionRepo = new AxiosLiveSessionRepository();
const messageRepo = new AxiosMessageRepository();
export const courseRepo = new AxiosCourseRepository();

// Classroom use cases
export const getTeacherClassroomsUseCase = new GetTeacherClassroomsUseCase(classroomRepo);
export const getClassroomByIdUseCase = new GetClassroomByIdUseCase(classroomRepo);
export const getClassroomStudentsUseCase = new GetClassroomStudentsUseCase(classroomRepo);
export const createClassroomUseCase = new CreateClassroomUseCase(classroomRepo);
export const updateClassroomUseCase = new UpdateClassroomUseCase(classroomRepo);
export const deleteClassroomUseCase = new DeleteClassroomUseCase(classroomRepo);
export const approveStudentUseCase = new ApproveStudentUseCase(classroomRepo);
export const rejectStudentUseCase = new RejectStudentUseCase(classroomRepo);
export const removeStudentUseCase = new RemoveStudentUseCase(classroomRepo);

// Resource use cases
export const getTeacherResourcesUseCase = new GetTeacherResourcesUseCase(resourceRepo);
export const uploadResourceUseCase = new UploadResourceUseCase(resourceRepo);
export const deleteResourceUseCase = new DeleteResourceUseCase(resourceRepo);

// Live session use cases
export const getTeacherLiveSessionsUseCase = new GetTeacherLiveSessionsUseCase(liveSessionRepo);
export const createLiveSessionUseCase = new CreateLiveSessionUseCase(liveSessionRepo);
export const updateLiveSessionUseCase = new UpdateLiveSessionUseCase(liveSessionRepo);
export const cancelLiveSessionUseCase = new CancelLiveSessionUseCase(liveSessionRepo);
export const deleteLiveSessionUseCase = new DeleteLiveSessionUseCase(liveSessionRepo);

// Message use cases
export const getContactsUseCase = new GetContactsUseCase(messageRepo);
export const getMessagesUseCase = new GetMessagesUseCase(messageRepo);
export const sendMessageUseCase = new SendMessageUseCase(messageRepo);
