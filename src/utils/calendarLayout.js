// src/utils/calendarLayout.js

const DEFAULT_HOUR_HEIGHT = 60; // Altura base en píxeles por hora

/**
 * Calcula el desplazamiento vertical en píxeles desde el inicio del día (00:00).
 * @param {Date|string|number} date 
 * @param {number} hourHeight Altura de una hora en píxeles
 * @returns {number} Offset en píxeles
 */
const getVerticalOffset = (date, hourHeight) => {
  const d = new Date(date);
  const minutes = d.getHours() * 60 + d.getMinutes();
  return (minutes / 60) * hourHeight;
};

/**
 * Calcula la altura en píxeles basada en la duración.
 * @param {number} durationMs Duración en milisegundos
 * @param {number} hourHeight Altura de una hora en píxeles
 * @returns {number} Altura en píxeles
 */
const getDurationHeight = (durationMs, hourHeight) => {
  const durationMinutes = durationMs / (1000 * 60);
  return (durationMinutes / 60) * hourHeight;
};

/**
 * Procesa una lista de eventos planos y calcula su posición visual (top, height, left, width)
 * para que no se superpongan visualmente si coinciden en hora.
 * Adapta el algoritmo "Smart Slotting" para visualización tipo calendario.
 * @param {Array} events Lista de eventos
 * @param {number} hourHeight Altura de una hora en píxeles (para zoom)
 */
export const calculateEventLayouts = (events, hourHeight = DEFAULT_HOUR_HEIGHT) => {
  if (!events || events.length === 0) return [];

  // 1. Ordenar eventos por hora de inicio
  // Aseguramos que start/end sean objetos Date para las comparaciones
  const sortedEvents = events.map(e => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end)
  })).sort((a, b) => a.start - b.start);

  const columns = [];

  sortedEvents.forEach(event => {
    // 2. Encontrar una columna donde quepa el evento sin chocar
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const lastInCol = col[col.length - 1];
      
      // Si el evento empieza después o igual que el final del último evento de la columna
      if (event.start >= lastInCol.end) {
        col.push(event);
        event.colIndex = i;
        placed = true;
        break;
      }
    }

    // 3. Si no cabe en ninguna, crear nueva columna
    if (!placed) {
      columns.push([event]);
      event.colIndex = columns.length - 1;
    }
  });

  // 4. Calcular anchos y posiciones finales
  return sortedEvents.map(event => {
    const colCount = columns.length;
    // Width básico: 100% / número de columnas
    // Left: índice de columna * width
    
    return {
      ...event,
      style: {
        top: getVerticalOffset(event.start, hourHeight),
        height: getDurationHeight(event.end - event.start, hourHeight),
        left: `${(event.colIndex / colCount) * 100}%`,
        width: `${(1 / colCount) * 100}%`,
        position: 'absolute'
      }
    };
  });
};
