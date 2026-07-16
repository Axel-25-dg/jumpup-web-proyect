export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Language {
  id: number;
  name: string;
  code: string;
  flag_icon_url?: string;
}

export interface Course {
  id: number;
  language: number;
  language_name: string;
  title: string;
  description: string;
  difficulty_level: DifficultyLevel;
  image_url: string;
}

export interface Module {
  id: number;
  course: number;
  course_title: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: number;
  module: number;
  module_title: string;
  title: string;
  content_type: 'video' | 'text' | 'interactive' | 'audio';
  order: number;
  xp_reward: number;
}
