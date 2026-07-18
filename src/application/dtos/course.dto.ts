import type { DifficultyLevel } from '@/domain/entities/course.entity'

export interface CreateCourseDto {
  language: number
  title: string
  description: string
  difficulty_level: DifficultyLevel
  image?: File | null
}

export type UpdateCourseDto = Partial<CreateCourseDto>
