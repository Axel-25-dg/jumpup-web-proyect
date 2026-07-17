export interface CreateCategoryDto {
  name: string
  description: string
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>
