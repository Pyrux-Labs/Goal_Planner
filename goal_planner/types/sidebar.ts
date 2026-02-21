export type SidebarView = 
  | { type: 'closed' }
  | { type: 'day-info'; date: Date }
  | { type: 'daily-analytics' }
  | { type: 'weekly-stats' }
  | { type: 'add-task' }
  | { type: 'add-habit' }
  | { type: 'edit-task'; taskId: string }
  | { type: 'edit-habit'; habitId: string };