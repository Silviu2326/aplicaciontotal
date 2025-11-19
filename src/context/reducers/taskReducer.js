import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initial state adhering to the SQL schema from analysis_tasks.md.
 * The 'tasks' array will contain objects mirroring the 'tasks' table columns.
 * 
 * @typedef {Object} Task
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Task title
 * @property {string} notes - Optional description or notes
 * @property {string} status - 'active' | 'completed' | 'migrated' | 'cancelled'
 * @property {string} priority - 'p1' (High) | 'p2' (Medium) | 'p3' (Low) | 'none'
 * @property {string} energy_level - 'high' | 'medium' | 'low'
 * @property {string} due_date - ISO Date string
 * @property {string|null} completed_at - ISO Date string or null
 * @property {string|null} parent_id - ID of parent task if subtask
 * @property {string|null} project_id - ID of associated project
 * @property {string[]} context_tags - Array of tags e.g. ['work', 'home']
 * 
 * @typedef {Object} Habit
 * @property {string} id - Unique identifier
 * @property {string} title - Habit name
 * @property {number} currentProgress - Daily progress count
 * @property {number} target - Daily target count
 * @property {number} streak - Current day streak
 * @property {Array} history - History of completion
 */
export const initialTaskState = {
  /** @type {Task[]} */
  tasks: [], 
  /** @type {Habit[]} */
  habits: [
    { id: 'h1', title: 'Beber Agua', currentProgress: 3, target: 8, streak: 12, history: [] },
    { id: 'h2', title: 'Meditar', currentProgress: 0, target: 1, streak: 5, history: [] },
    { id: 'h3', title: 'Leer 30 min', currentProgress: 10, target: 30, streak: 45, history: [] },
  ],
};

/**
 * Task Reducer
 * Handles complex actions for task management.
 * 
 * Supported Actions:
 * - ADD_TASK: Adds a new task with default fields.
 * - COMPLETE_TASK: Marks a task as completed and sets timestamp.
 * - DELETE_TASK: Removes a single task by ID.
 * - DELETE_TASKS: Removes multiple tasks by ID array.
 * - UPDATE_TASK: Updates specific fields of a task.
 * - SNOOZE_TASK: Moves due date to the next day.
 * - MIGRATE_TASKS: Moves tasks to a new date or status.
 * - INCREMENT_HABIT: Increments progress for a specific habit.
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object { type, payload }
 * @returns {Object} New state
 */
export const taskReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT_HABIT': {
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload
            ? { ...habit, currentProgress: habit.currentProgress + 1 }
            : habit
        ),
      };
    }

    case 'ADD_TASK': {
      // Payload should contain partial task info. We fill in defaults.
      const newTask = {
        id: action.payload.id || uuidv4(),
        title: action.payload.title,
        notes: action.payload.notes || '',
        status: action.payload.status || 'active',
        priority: action.payload.priority || 'none',
        energy_level: action.payload.energy_level || 'medium',
        due_date: action.payload.due_date || new Date().toISOString(),
        completed_at: null,
        parent_id: action.payload.parent_id || null,
        project_id: action.payload.project_id || null,
        context_tags: action.payload.context_tags || [],
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'COMPLETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                status: 'completed',
                completed_at: new Date().toISOString(),
              }
            : task
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    }

    case 'DELETE_TASKS': {
      // Payload: string[] (array of task IDs)
      return {
        ...state,
        tasks: state.tasks.filter((task) => !action.payload.includes(task.id)),
      };
    }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      };
    }

    case 'SNOOZE_TASK': {
      // Payload is task ID. Moves due_date +1 day.
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload) {
            const currentDue = task.due_date ? new Date(task.due_date) : new Date();
            const nextDay = new Date(currentDue);
            nextDay.setDate(currentDue.getDate() + 1);
            return { ...task, due_date: nextDay.toISOString() };
          }
          return task;
        }),
      };
    }

    case 'MIGRATE_TASKS': {
      // Payload: { taskIds: string[], targetDate?: string, targetStatus?: string }
      const { taskIds, targetDate, targetStatus } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (taskIds.includes(task.id)) {
            const updates = {};
            if (targetDate) updates.due_date = targetDate;
            if (targetStatus) updates.status = targetStatus;
            // Common migration logic: if moving to future, ensure status is active or migrated
            if (!targetStatus && task.status === 'completed') {
               // Typically don't migrate completed tasks unless explicit
            }
            return { ...task, ...updates };
          }
          return task;
        }),
      };
    }

    default:
      return state;
  }
};
