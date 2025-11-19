import { useState, useEffect } from 'react';

/**
 * Hook to simulate fetching context info (weather, travel time).
 * Returns weather conditions and estimated travel time based on the date provided.
 * 
 * @param {Date|string} date - The event date.
 * @returns {Object} { temperature, condition, travelTime, loading }
 */
export const useContextInfo = (date) => {
  const [info, setInfo] = useState({
    temperature: null,
    condition: null, // 'sunny', 'rainy', 'cloudy', 'storm'
    travelTime: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSimulatedData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (!isMounted) return;

      const d = new Date(date);
      const hour = d.getHours();
      
      // Mock logic based on hour
      // Rain in the evening (after 18:00)
      // Sunny in the afternoon (12:00 - 18:00)
      // Cloudy in the morning
      
      let condition = 'sunny';
      let temperature = '22°';
      let travelTime = '15 min';

      if (hour < 11) {
        condition = 'cloudy';
        temperature = '16°';
        travelTime = '25 min'; // Morning traffic
      } else if (hour >= 18) {
        condition = 'rainy';
        temperature = '14°';
        travelTime = '30 min'; // Rain + traffic
      }

      // Random override for 'storm' occasionally based on date
      // Use date number to be deterministic per day
      if (d.getDate() % 5 === 0 && hour > 16) { 
        condition = 'storm';
        temperature = '12°';
      }

      setInfo({
        temperature,
        condition,
        travelTime,
        loading: false,
      });
    };

    fetchSimulatedData();

    return () => {
      isMounted = false;
    };
  }, [date]);

  return info;
};
