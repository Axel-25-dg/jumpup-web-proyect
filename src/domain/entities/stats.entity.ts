export interface UserStats {
  id: number;
  user: number;
  xp: number;
  level: number;
  streak: number;
  last_activity: string;
  total_lessons_completed: number;
}

export interface AchievementBase {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserAchievement {
  id: number;
  achievement: AchievementBase;
  unlocked_at: string;
}

export type Achievement = UserAchievement;
