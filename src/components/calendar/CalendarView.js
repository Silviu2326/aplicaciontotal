import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuración de locale para español (opcional, pero recomendado)
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ],
  monthNamesShort: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom.','Lun.','Mar.','Mié.','Jue.','Vie.','Sáb.'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarView({ selectedDate, onDayPress, markedDates }) {
  return (
    <View style={styles.container}>
      <Calendar
        // Fecha actualmente visible
        current={selectedDate}
        // Fecha seleccionada
        onDayPress={(day) => onDayPress(day.dateString)}
        // Marcas en el calendario (puntos de eventos)
        markedDates={{
            ...markedDates,
            [selectedDate]: { 
                ...markedDates[selectedDate], 
                selected: true, 
                disableTouchEvent: true, 
                selectedDotColor: 'orange',
                selectedColor: '#007AFF' // Color de selección azul iOS
            }
        }}
        // Estilos del tema
        theme={{
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            monthTextColor: '#333',
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
});
