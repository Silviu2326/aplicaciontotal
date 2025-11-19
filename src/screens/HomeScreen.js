import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardSummary from '../components/home/DashboardSummary';
import AIInsight from '../components/home/AIInsight';
import CriticalWeek from '../components/home/CriticalWeek';
import FocusMode from '../components/home/FocusMode';
import InboxShortcut from '../components/home/InboxShortcut';
import NotificationPreview from '../components/home/NotificationPreview';
import HabitRow from '../components/home/HabitRow';
import NextUp from '../components/home/NextUp';
import FinanceSnippet from '../components/home/FinanceSnippet';
import DailyQuote from '../components/home/DailyQuote';
import ProjectProgress from '../components/home/ProjectProgress';
import QuickGrid from '../components/home/QuickGrid';
import WellnessStats from '../components/home/WellnessStats';
import MiniPlayer from '../components/home/MiniPlayer';

export default function HomeScreen() {
  // 1. Dashboard Data (Resumen del día, widgets, clima)
  const [dashboardData] = useState({
    user: { name: 'Xarly', avatar: 'https://i.pravatar.cc/150?u=xarly' },
    date: 'Martes, 18 Nov',
    weather: { icon: 'partly-sunny', color: '#FDB813', temp: '22°', condition: 'Soleado' },
    widgets: [
      { id: 'events', title: 'Eventos', value: '3', icon: 'calendar', color: '#2563EB', bg: '#EFF6FF' },
      { id: 'tasks', title: 'Tareas', value: '12', icon: 'checkbox', color: '#DC2626', bg: '#FEF2F2' },
      { id: 'expenses', title: 'Gastos', value: '-45€', icon: 'card', color: '#059669', bg: '#ECFDF5' },
      { id: 'habit', title: 'Racha', value: '5 días', icon: 'flame', color: '#D97706', bg: '#FFFBEB' },
    ]
  });

  // 2. Critical Week Data
  const [weekData] = useState([
    { day: 'L', date: '17', status: 'normal' },
    { day: 'M', date: '18', status: 'busy', isToday: true },
    { day: 'X', date: '19', status: 'warning' },
    { day: 'J', date: '20', status: 'normal' },
    { day: 'V', date: '21', status: 'busy' },
    { day: 'S', date: '22', status: 'free' },
    { day: 'D', date: '23', status: 'free' },
  ]);

  // 3. Focus Mode Data
  const [focusData] = useState({
    active: false,
    timer: '25:00',
    tasks: [
      { id: 1, title: 'Estudiar Matemáticas', duration: '45min', completed: false },
      { id: 2, title: 'Enviar reporte mensual', duration: '30min', completed: false },
      { id: 3, title: 'Llamar al seguro', duration: '10min', completed: false },
    ],
    nextAction: 'Descanso de 5 min'
  });

  // 4. Habit Data
  const [habitData] = useState([
    { id: 'h1', title: 'Agua', icon: 'water-outline', completed: true },
    { id: 'h2', title: 'Leer', icon: 'book-outline', completed: false },
    { id: 'h3', title: 'Meditación', icon: 'flower-outline', completed: false },
    { id: 'h4', title: 'Andar', icon: 'walk-outline', completed: true },
  ]);

  // 5. Next Event Data
  const [nextEvent] = useState({
    title: 'Reunión de Equipo',
    time: '10:00',
    duration: '45m',
    location: 'Sala B / Zoom',
    attendees: ['AL', 'MJ', 'CR'],
    totalAttendees: 5
  });

  // 6. Finance Data
  const [financeData] = useState({
    spent: 20,
    limit: 50,
    currency: '€'
  });

  // 7. Quote Data
  const [quoteData] = useState({
    text: "La disciplina es hacer lo que tienes que hacer, incluso si no tienes ganas.",
    author: "Anónimo"
  });

  // 8. Project Data
  const [projectData] = useState({
    title: 'Lanzamiento Web',
    subtitle: 'Fase 2: Desarrollo',
    progress: 75,
    dueDate: '24 Nov',
    members: [1, 2, 3] // Placeholders
  });

  // 9. Inbox Data
  const inboxTypes = ['Tarea', 'Evento', 'Gasto', 'Nota', 'Archivo'];

  // 10. Notifications Data
  const [notifications] = useState([
    { id: 1, title: 'Pagar recibo de luz', subtitle: 'Venció ayer', type: 'urgent', action: 'Pagar' },
    { id: 2, title: 'Reunión con cliente', subtitle: 'En 30 min', type: 'warning', action: 'Ver' },
    { id: 3, title: 'Meta de ahorro alcanzada', subtitle: 'Felicidades', type: 'info', action: 'Abrir' },
  ]);

  // 11. Wellness Data
  const [wellnessData] = useState({
    sleep: { hours: 7.2, quality: '85%' },
    steps: { current: 8430, goal: 10000 }
  });

  // 12. Media Data
  const [mediaData] = useState({
    title: 'Deep Focus Playlist',
    artist: 'Spotify • Electronic',
    progress: 40,
    cover: ''
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardSummary data={dashboardData} />
        <AIInsight />
        <CriticalWeek days={weekData} />
        <WellnessStats data={wellnessData} />
        <HabitRow habits={habitData} />
        <ProjectProgress project={projectData} />
        <FocusMode data={focusData} />
        <NextUp event={nextEvent} />
        <QuickGrid />
        <MiniPlayer data={mediaData} />
        <InboxShortcut inputTypes={inboxTypes} />
        <FinanceSnippet data={financeData} />
        <DailyQuote quote={quoteData.text} author={quoteData.author} />
        <NotificationPreview notifications={notifications} />
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 20,
  }
});
