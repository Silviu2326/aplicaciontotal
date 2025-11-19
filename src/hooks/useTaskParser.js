
import { useMemo } from 'react';

const useTaskParser = () => {
  const parseTaskString = (taskString) => {
    const parsedTask = {
      description: taskString,
      date: null,
      priority: null,
      tags: [],
    };

    // Regex for date (simple examples: "hoy", "mañana", "lunes", "24/12", "next monday")
    const dateRegex = /(hoy|mañana|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|\d{1,2}\/\d{1,2}|next\s+\w+)/i;
    const dateMatch = taskString.match(dateRegex);
    if (dateMatch) {
      parsedTask.date = dateMatch[0].toLowerCase();
      parsedTask.description = parsedTask.description.replace(dateMatch[0], '').trim();
    }

    // Regex for priority (!alta, !media, !baja)
    const priorityRegex = /!(alta|media|baja)/i;
    const priorityMatch = taskString.match(priorityRegex);
    if (priorityMatch) {
      parsedTask.priority = priorityMatch[1].toLowerCase();
      parsedTask.description = parsedTask.description.replace(priorityMatch[0], '').trim();
    }

    // Regex for tags (#tag)
    const tagsRegex = /#(\w+)/g;
    let tagMatch;
    while ((tagMatch = tagsRegex.exec(taskString)) !== null) {
      parsedTask.tags.push(tagMatch[1].toLowerCase());
      parsedTask.description = parsedTask.description.replace(tagMatch[0], '').trim();
    }

    // Clean up extra spaces in description
    parsedTask.description = parsedTask.description.replace(/\s+/g, ' ').trim();

    return parsedTask;
  };

  return useMemo(() => ({ parseTaskString }), []);
};

export default useTaskParser;
