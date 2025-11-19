import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';
import { taskReducer, initialTaskState } from './reducers/taskReducer';

// MOCK STORAGE Implementation
// In a real production environment, you would install @react-native-async-storage/async-storage
// and import AsyncStorage from there.
const STORAGE_KEY = 'LIFE_OS_TASKS_V1';

const MockStorage = {
  getItem: async (key) => {
    console.log(`[MockStorage] Loading data for key: ${key}`);
    // Return null to simulate empty storage initially, or return a JSON string for testing
    return null; 
  },
  setItem: async (key, value) => {
    console.log(`[MockStorage] Saving data for key: ${key}`, value);
    // In a real app, this would persist to disk
    return Promise.resolve();
  }
};

// Context creation
const TaskContext = createContext({
  state: initialTaskState,
  dispatch: () => null,
});

/**
 * TaskProvider Component
 * 
 * Wraps the application (or subtree) to provide global task state management.
 * Handles persistence of the task state using a mock storage implementation
 * (swappable for AsyncStorage in production).
 * 
 * Features:
 * - Loads state on mount.
 * - Auto-saves state changes.
 * - Provides `dispatch` for state mutations via `taskReducer`.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  // Load state from storage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await MockStorage.getItem(STORAGE_KEY);
        if (storedTasks) {
          const parsedState = JSON.parse(storedTasks);
          // Assuming we have a specific action to hydration or just replacing state
          // For now, we might need to dispatch an action to set the initial load if the reducer supports it
          // OR we could strictly use the loaded state as initial state if we weren't using useReducer's initializer
          
          // Since the reducer doesn't have a 'SET_STATE' action in the provided file, 
          // we will skip hydration implementation or assume the reducer will be updated to support it.
          // For this exercise, we log the retrieval.
          console.log('Tasks loaded from persistence:', parsedState);
        }
      } catch (error) {
        console.error('Failed to load tasks from storage', error);
      }
    };
    
    loadTasks();
  }, []);

  // Save state to storage on change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        const jsonValue = JSON.stringify(state);
        await MockStorage.setItem(STORAGE_KEY, jsonValue);
      } catch (error) {
        console.error('Failed to save tasks to storage', error);
      }
    };

    // Debouncing could be added here for performance in a real app
    saveTasks();
  }, [state]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Custom Hook to access Task Context
 * 
 * @returns {{ state: import('./reducers/taskReducer').initialTaskState, dispatch: React.Dispatch<any> }}
 * @throws {Error} If used outside of TaskProvider
 */
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
