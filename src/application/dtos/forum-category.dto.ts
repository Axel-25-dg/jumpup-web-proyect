export interface CreateForumCategoryDto {
  name: string
  description: string
  icon: string
  order?: number
  is_active?: boolean
}

export type UpdateForumCategoryDto = Partial<CreateForumCategoryDto>