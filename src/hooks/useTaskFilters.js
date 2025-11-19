import React, { useMemo } from 'react';

const useTaskFilters = (tasks, filterConfig) => {
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let runnableTasks = [...tasks];

    // 1. Filtering Logic
    if (filterConfig) {
      // Filter by time
      if (filterConfig.time === 'today') {
        const today = new Date().toISOString().split('T')[0];
        runnableTasks = runnableTasks.filter(task => task.dueDate === today);
      } else if (filterConfig.time === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        runnableTasks = runnableTasks.filter(task => task.dueDate >= today);
      }

      // Filter by energy
      if (filterConfig.energy && filterConfig.energy !== 'all') {
        runnableTasks = runnableTasks.filter(task => task.energy === filterConfig.energy);
      }

      // Filter by context (assuming 'context' is a tag or category)
      if (filterConfig.context && filterConfig.context !== 'all') {
        runnableTasks = runnableTasks.filter(task => task.context === filterConfig.context);
      }
    }

    // 2. Sorting Logic (Priority then Status)
    runnableTasks.sort((a, b) => {
      // Priority: High > Medium > Low
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // Status: Pending > In Progress > Completed
      const statusOrder = { 'pending': 3, 'in_progress': 2, 'completed': 1 };
      const aStatus = statusOrder[a.status] || 0;
      const bStatus = statusOrder[b.status] || 0;
      
      return bStatus - aStatus; // Higher status (more urgent) first
    });

    return runnableTasks;
  }, [tasks, filterConfig]);

  return filteredAndSortedTasks;
};

export default useTaskFilters;
