import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- DATA MOCK ---
const ACCOUNTS = [
  { id: '1', type: 'Main', name: 'Cuenta Principal', balance: 12540.50, number: '**** 4582', color: '#1E293B', icon: 'wallet' },
  { id: '2', type: 'Savings', name: 'Ahorros', balance: 8200.00, number: '**** 9921', color: '#059669', icon: 'piggy-bank' },
  { id: '3', type: 'Credit', name: 'Visa Platinum', balance: -450.20, number: '**** 1122', color: '#7C3AED', icon: 'credit-card-chip' },
];

const WEEKLY_SPEND = [
  { day: 'Lun', fullDay: 'Lunes', amount: 45, height: 40 },
  { day: 'Mar', fullDay: 'Martes', amount: 120, height: 90 },
  { day: 'Mié', fullDay: 'Miércoles', amount: 30, height: 30 },
  { day: 'Jue', fullDay: 'Jueves', amount: 65, height: 55 },
  { day: 'Vie', fullDay: 'Viernes', amount: 210, height: 100 }, 
  { day: 'Sáb', fullDay: 'Sábado', amount: 150, height: 80 },
  { day: 'Dom', fullDay: 'Domingo', amount: 90, height: 60 },
];

const INSIGHT = {
  type: 'alert',
  title: 'Gasto inusual detectado',
  message: 'Has gastado un 25% más en Ocio esta semana comparado con la media.',
  action: 'Ver detalles'
};

const UPCOMING_BILLS = [
  { id: 'b1', title: 'Alquiler Piso', date: '01 Dic', amount: 850.00, status: 'pending', icon: 'home-city' },
  { id: 'b2', title: 'Electricidad', date: '04 Dic', amount: 45.20, status: 'pending', icon: 'lightning-bolt' },
  { id: 'b3', title: 'Internet Fibra', date: '20 Nov', amount: 39.90, status: 'overdue', icon: 'wifi' },
];

const CATEGORIES_BREAKDOWN = [
  { id: 'c1', name: 'Alimentación', spent: 450, limit: 600, color: '#F59E0B', icon: 'food-apple' },
  { id: 'c2', name: 'Transporte', spent: 120, limit: 200, color: '#3B82F6', icon: 'car' },
];

const SAVINGS_GOALS = [
  { id: 'g1', name: 'Viaje a Japón', current: 2500, target: 4000, icon: 'airplane-takeoff', color: '#F43F5E' },
  { id: 'g2', name: 'MacBook Pro', current: 1200, target: 2500, icon: 'laptop', color: '#10B981' },
];

const TRANSACTIONS = [
  { id: '1', title: 'Supermercado Mercadona', category: 'food', amount: -85.40, date: 'Hoy', icon: 'cart' },
  { id: '2', title: 'Nómina Empresa S.L.', category: 'income', amount: 2400.00, date: 'Ayer', icon: 'cash' },
];

const SUBSCRIPTIONS = [
  { id: 's1', name: 'Netflix', cost: 12.99, nextDate: '15 Dic', icon: 'netflix', color: '#E50914' },
  { id: 's2', name: 'Spotify', cost: 9.99, nextDate: '20 Dic', icon: 'spotify', color: '#1DB954' },
  { id: 's3', name: 'Gimnasio', cost: 29.90, nextDate: '01 Dic', icon: 'dumbbell', color: '#3B82F6' },
  { id: 's4', name: 'iCloud', cost: 2.99, nextDate: '28 Nov', icon: 'cloud', color: '#0EA5E9' },
];

const TransactionItem = ({ item }) => {
  const isExpense = item.amount < 0;
  return (
    <TouchableOpacity style={styles.transItem} activeOpacity={0.7}>
      <View style={[styles.transIconContainer, { backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5' }]}>
        <MaterialCommunityIcons 
          name={item.icon} 
          size={22} 
          color={isExpense ? '#EF4444' : '#10B981'} 
        />
      </View>
      <View style={styles.transContent}>
        <Text style={styles.transTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.transMeta}>{item.date} • <Text style={{textTransform: 'capitalize'}}>{item.category}</Text></Text>
      </View>
      <Text style={[styles.transAmount, { color: isExpense ? '#1E293B' : '#10B981' }]}>
        {isExpense ? '' : '+'}{Math.abs(item.amount).toFixed(2)} €
      </Text>
    </TouchableOpacity>
  );
};

const AccountCard = ({ item }) => (
  <View style={[styles.accountCard, { backgroundColor: item.color }]}>
    <View style={[styles.decorCircle, { right: -20, top: -20 }]} />
    <View style={[styles.decorCircle, { left: -30, bottom: -40, width: 100, height: 100 }]} />
    
    <View style={styles.accountTop}>
      <MaterialCommunityIcons name={item.icon} size={24} color="rgba(255,255,255,0.8)" />
      <Text style={styles.accountType}>{item.type}</Text>
    </View>
    
    <View>
      <Text style={styles.accountBalance}>€{item.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Text>
      <Text style={styles.accountName}>{item.name}</Text>
    </View>

    <View style={styles.accountFooter}>
      <Text style={styles.accountNumber}>{item.number}</Text>
      <MaterialCommunityIcons name="contactless-payment" size={24} color="rgba(255,255,255,0.6)" />
    </View>
  </View>
);

const ChartBar = ({ item, max, onPress, isSelected }) => (
  <Pressable style={styles.chartCol} onPress={onPress}>
    <View style={styles.barContainer}>
      <View 
        style={[
          styles.barFill, 
          { 
            height: `${item.height}%`, 
            backgroundColor: isSelected ? '#10B981' : (item.height > 80 ? '#EF4444' : '#CBD5E1'),
            opacity: isSelected ? 1 : 0.7
          }
        ]} 
      />
    </View>
    <Text style={[styles.chartLabel, isSelected && styles.chartLabelActive]}>{item.day}</Text>
  </Pressable>
);

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: '#fff', borderColor: '#E2E8F0' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const InsightWidget = () => (
  <View style={styles.insightCard}>
    <View style={styles.insightIcon}>
      <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#F59E0B" />
    </View>
    <View style={styles.insightContent}>
      <Text style={styles.insightTitle}>{INSIGHT.title}</Text>
      <Text style={styles.insightMsg}>{INSIGHT.message}</Text>
      <TouchableOpacity onPress={() => Alert.alert('Insight', 'Aquí se mostrarían los detalles completos del análisis de gastos.')}>
        <Text style={styles.insightAction}>{INSIGHT.action}</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.insightClose}>
      <MaterialCommunityIcons name="close" size={16} color="#94A3B8" />
    </TouchableOpacity>
  </View>
);

const BillRow = ({ item }) => {
  const isOverdue = item.status === 'overdue';
  return (
    <View style={styles.billRow}>
      <View style={styles.billLeft}>
        <View style={[styles.billDateBox, isOverdue && styles.billDateOverdue]}>
          <Text style={[styles.billDateDay, isOverdue && {color: '#EF4444'}]}>{item.date.split(' ')[0]}</Text>
          <Text style={[styles.billDateMonth, isOverdue && {color: '#EF4444'}]}>{item.date.split(' ')[1]}</Text>
        </View>
        <View>
          <Text style={styles.billTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, isOverdue ? styles.statusOverdue : styles.statusPending]}>
            <Text style={[styles.statusText, isOverdue ? {color: '#EF4444'} : {color: '#F59E0B'}]}>
              {isOverdue ? 'Vencido' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.billAmount}>-€{item.amount.toFixed(2)}</Text>
    </View>
  );
};

export default function FinanceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(WEEKLY_SPEND[4]); // Default to Friday

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mis Finanzas</Text>
      <TouchableOpacity style={styles.menuButton} onPress={() => Alert.alert('Notificaciones', 'No tienes notificaciones nuevas')}>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#1E293B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.bgHeader, { height: insets.top + 60 }]} />
      
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        {renderHeader()}

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Accounts Carousel */}
          <View style={styles.carouselContainer}>
            <FlatList 
              data={ACCOUNTS}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              snapToInterval={width * 0.8 + 16}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ width: width * 0.8 }} 
                  activeOpacity={0.9}
                  onPress={() => Alert.alert('Cuenta', `Detalles de ${item.name}`)}
                >
                  <AccountCard item={item} />
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <QuickAction 
              icon="arrow-up" 
              label="Ingresar" 
              color="#10B981" 
              onPress={() => navigation.navigate('TransactionForm', { type: 'income' })}
            />
            <QuickAction 
              icon="arrow-down" 
              label="Gastar" 
              color="#EF4444" 
              onPress={() => navigation.navigate('TransactionForm', { type: 'expense' })}
            />
            <QuickAction 
              icon="swap-horizontal" 
              label="Mover" 
              color="#3B82F6" 
              onPress={() => navigation.navigate('TransactionForm', { type: 'transfer' })}
            />
            <QuickAction 
              icon="file-document" 
              label="Facturas" 
              color="#8B5CF6" 
              onPress={() => navigation.navigate('FinanceList', { type: 'bills' })}
            />
          </View>

          <InsightWidget />

          {/* Interactive Chart */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gasto Semanal</Text>
              <View style={styles.selectedDayTag}>
                <Text style={styles.selectedDayText}>{selectedDay.fullDay}: </Text>
                <Text style={styles.selectedDayAmount}>€{selectedDay.amount}</Text>
              </View>
            </View>
            <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                {WEEKLY_SPEND.map((day, index) => (
                   <ChartBar 
                     key={index} 
                     item={day} 
                     isSelected={selectedDay.day === day.day}
                     onPress={() => setSelectedDay(day)}
                   />
                ))}
              </View>
            </View>
          </View>

          {/* Upcoming Bills */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Recibos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FinanceList', { type: 'bills' })}>
                <Text style={styles.seeAll}>Calendario</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {UPCOMING_BILLS.map((bill, index) => (
                <React.Fragment key={bill.id}>
                  <BillRow item={bill} />
                  {index < UPCOMING_BILLS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Category & Goals Split */}
          <View style={styles.rowSplit}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
               <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                  <Text style={styles.sectionTitleSmall}>Presupuestos</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Editar', 'Editor de presupuestos')}>
                    <MaterialCommunityIcons name="pencil" size={16} color="#64748B" />
                  </TouchableOpacity>
               </View>
               <View style={styles.miniCard}>
                 {CATEGORIES_BREAKDOWN.map(cat => (
                    <View key={cat.id} style={{marginBottom: 12}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                         <Text style={{fontSize: 12, fontWeight: '600'}}>{cat.name}</Text>
                         <Text style={{fontSize: 12, color: '#64748B'}}>{Math.round((cat.spent/cat.limit)*100)}%</Text>
                      </View>
                      <View style={{height: 6, backgroundColor: '#F1F5F9', borderRadius: 3}}>
                        <View style={{width: `${(cat.spent/cat.limit)*100}%`, backgroundColor: cat.color, height: '100%', borderRadius: 3}} />
                      </View>
                    </View>
                 ))}
               </View>
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
               <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                  <Text style={styles.sectionTitleSmall}>Metas</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Nueva Meta', 'Crear meta de ahorro')}>
                    <MaterialCommunityIcons name="plus" size={16} color="#64748B" />
                  </TouchableOpacity>
               </View>
               <View style={styles.miniCard}>
                 {SAVINGS_GOALS.map(goal => (
                    <View key={goal.id} style={{marginBottom: 12}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                         <Text style={{fontSize: 12, fontWeight: '600'}}>{goal.name}</Text>
                         <MaterialCommunityIcons name={goal.icon} size={12} color={goal.color} />
                      </View>
                      <View style={{height: 6, backgroundColor: '#F1F5F9', borderRadius: 3}}>
                        <View style={{width: `${(goal.current/goal.target)*100}%`, backgroundColor: goal.color, height: '100%', borderRadius: 3}} />
                      </View>
                    </View>
                 ))}
               </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Movimientos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FinanceList', { type: 'transactions' })}>
                <Text style={styles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {TRANSACTIONS.map((t, index) => (
                <React.Fragment key={t.id}>
                  <TransactionItem item={t} />
                  {index < TRANSACTIONS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Subscriptions */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suscripciones</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subsScroll}>
              {SUBSCRIPTIONS.map((sub, index) => (
                <TouchableOpacity 
                   key={sub.id} 
                   style={[styles.subCard, { backgroundColor: sub.color }]} 
                   activeOpacity={0.9}
                   onPress={() => Alert.alert(sub.name, `Renovación: ${sub.nextDate}`)}
                >
                   <MaterialCommunityIcons name={sub.icon} size={100} color="rgba(255,255,255,0.1)" style={styles.subWatermark} />
                   
                   <View style={styles.subHeader}>
                     <View style={styles.subIconBubble}>
                        <MaterialCommunityIcons name={sub.icon} size={20} color={sub.color} />
                     </View>
                     <Text style={styles.subCost}>€{sub.cost}</Text>
                   </View>
                   
                   <View>
                     <Text style={styles.subName}>{sub.name}</Text>
                     <Text style={styles.subDate}>Renueva: {sub.nextDate}</Text>
                   </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bgHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  menuButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Carousel
  carouselContainer: {
    marginVertical: 20,
  },
  accountCard: {
    height: 180,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  decorCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  accountTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  accountBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  accountName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  // Insight
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFBEB', // Amber 50
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  insightMsg: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 8,
  },
  insightAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    textDecorationLine: 'underline',
  },
  insightClose: {
    padding: 4,
  },
  // Section
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Chart
  selectedDayTag: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedDayText: {
    fontSize: 12,
    color: '#64748B',
  },
  selectedDayAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  chartCol: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barContainer: {
    height: 110,
    width: 8,
    borderRadius: 4,
    justifyContent: 'flex-end',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
    width: '100%',
  },
  chartLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartLabelActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  // Bills
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billDateBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billDateOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  billDateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  billDateMonth: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusOverdue: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  // Split Row
  rowSplit: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  miniCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  // Net Worth
  netWorthContainer: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  netWorthLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  netWorthChange: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  // Transactions List
  transItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  transIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transContent: {
    flex: 1,
  },
  transTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  transMeta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  transAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Subscriptions
  subsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subCard: {
    width: 150,
    height: 160,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  subWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.2,
    transform: [{ rotate: '-20deg' }],
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCost: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  subName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
