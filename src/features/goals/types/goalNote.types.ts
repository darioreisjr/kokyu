/** A free-form note attached to a goal — no rich editor, just text, date and optional tags. */
export interface GoalNote {
  id: string;
  goalId: string;
  text: string;
  tags?: string[];
  createdAt: string;
}
