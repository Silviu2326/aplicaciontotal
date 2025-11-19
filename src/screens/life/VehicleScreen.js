import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#EC4899'; // Pink/Magenta technical theme for the app
const DASHBOARD_BG = ['#0F172A', '#1E293B']; // Dark gradient for dashboard area

// --- DATA MOCK ---
const VEHICLE_INFO = {
  model: 'Audi Q3 Sportback',
  plate: '4582 LMD',
  mileage: 45230, // km
  maxMileage: 240000, // For gauge scale
  nextServiceKm: 50000,
  nextServiceDate: '15 Ene 2026',
  fuelLevel: 65, // %
  range: 450, // km estimated
  status: 'Optimal',
};

const MAINTENANCE_ALERTS = [
  { id: 'a1', title: 'Presión Baja', message: 'Neumático Delantero Izquierdo', severity: 'critical', icon: 'car-tire-alert' },
  { id: 'a2', title: 'Líquido de Frenos', message: 'Revisar nivel en 500km', severity: 'warning', icon: 'alert-circle-outline' }
];

const NEARBY_SERVICES = [
  { id: 's1', type: 'gas', name: 'Repsol', distance: '1.2km', lat: 20, long: 30 },
  { id: 's2', type: 'mechanic', name: 'Talleres Paco', distance: '3.5km', lat: 60, long: 70 },
  { id: 's3', type: 'parking', name: 'Parking Centro', distance: '0.5km', lat: 40, long: 10 },
];

const DOCUMENTS = [
  { id: 'd1', title: 'Permiso de Circulación', expiry: 'N/A', icon: 'file-document-outline', color: '#3B82F6' },
  { id: 'd2', title: 'Seguro (Mapfre)', expiry: '12 Ago 2025', icon: 'shield-check-outline', color: '#10B981' },
  { id: 'd3', title: 'ITV', expiry: '15 Ene 2026', icon: 'clipboard-check-outline', color: '#F59E0B' },
];

const TRIP_LOGS = [
  { id: 't1', destination: 'Madrid - Valencia', km: 350, consumption: '6.2L/100', date: '12 Nov' },
  { id: 't2', destination: 'Valencia - Alicante', km: 180, consumption: '5.8L/100', date: '10 Nov' },
  { id: 't3', destination: 'Madrid - Sierra', km: 120, consumption: '7.1L/100', date: '05 Nov' },
];

const TIRE_PRESSURE = {
  frontLeft: { current: 2.1, recommended: 2.4, status: 'warning' }, // bar - Simulated low pressure
  frontRight: { current: 2.4, recommended: 2.4, status: 'ok' },
  rearLeft: { current: 2.4, recommended: 2.4, status: 'ok' },
  rearRight: { current: 2.4, recommended: 2.4, status: 'ok' },
};

// --- COMPONENTS ---

const DashboardGauge = ({ value, maxValue, label, unit, icon, color = THEME_COLOR, isFuel = false, range }) => {
  // Calculate rotation for needle. -135deg to 135deg (270deg total span)
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const rotation = -135 + (percentage * 270);

  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeOuter}>
        {/* Ticks (Simulated with minimal visual cues) */}
        <View style={[styles.tick, { transform: [{ rotate: '-135deg' }] }]} />
        <View style={[styles.tick, { transform: [{ rotate: '0deg' }] }]} />
        <View style={[styles.tick, { transform: [{ rotate: '135deg' }] }]} />
        
        {/* Center Info */}
        <View style={styles.gaugeInner}>
           <MaterialCommunityIcons name={icon} size={24} color={color} style={{opacity: 0.8, marginBottom: 4}} />
           <Text style={styles.gaugeValue}>{isFuel ? `${value}%` : (value / 1000).toFixed(1) + 'k'}</Text>
           <Text style={styles.gaugeLabel}>{label}</Text>
        </View>

        {/* Needle */}
        <View style={[styles.needleContainer, { transform: [{ rotate: `${rotation}deg` }] }]}>
           <View style={[styles.needle, { backgroundColor: color }]} />
        </View>
        
        {/* Cap */}
        <View style={styles.needleCap} />
      </View>
      {isFuel && <Text style={styles.rangeText}>Est. {range}km</Text>}
    </View>
  );
};

const AlertCard = ({ alert }) => {
  const isCritical = alert.severity === 'critical';
  const bgColor = isCritical ? '#FEF2F2' : '#FFFBEB';
  const borderColor = isCritical ? '#EF4444' : '#F59E0B';
  const iconColor = isCritical ? '#DC2626' : '#D97706';

  return (
    <View style={[styles.alertCard, { backgroundColor: bgColor, borderColor: borderColor }]}>
      <View style={[styles.alertIconBox, { backgroundColor: isCritical ? '#FECACA' : '#FDE68A' }]}>
         <MaterialCommunityIcons name={alert.icon} size={24} color={iconColor} />
      </View>
      <View style={{flex: 1, marginLeft: 12}}>
        <Text style={[styles.alertTitle, { color: iconColor }]}>{alert.title}</Text>
        <Text style={styles.alertMsg}>{alert.message}</Text>
      </View>
      <TouchableOpacity style={styles.alertAction}>
         <MaterialCommunityIcons name="chevron-right" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const DocumentCard = ({ doc }) => (
  <View style={styles.docCard}>
    <View style={[styles.docIcon, { backgroundColor: doc.color + '20' }]}>
      <MaterialCommunityIcons name={doc.icon} size={24} color={doc.color} />
    </View>
    <View style={styles.docContent}>
      <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
      <Text style={styles.docExpiry}>{doc.expiry === 'N/A' ? 'Vigente' : `Expira: ${doc.expiry}`}</Text>
    </View>
    <TouchableOpacity>
      <MaterialCommunityIcons name="dots-vertical" size={20} color="#94A3B8" />
    </TouchableOpacity>
  </View>
);

const TripRow = ({ trip }) => (
  <View style={styles.tripRow}>
    <View style={styles.tripIcon}>
      <MaterialCommunityIcons name="map-marker-path" size={20} color="#64748B" />
    </View>
    <View style={styles.tripInfo}>
      <Text style={styles.tripDest}>{trip.destination}</Text>
      <Text style={styles.tripDate}>{trip.date}</Text>
    </View>
    <View style={styles.tripStats}>
      <Text style={styles.tripKm}>{trip.km} km</Text>
      <Text style={styles.tripCons}>{trip.consumption}</Text>
    </View>
  </View>
);

const TirePressureVisual = () => {
  const renderTire = (position, data) => {
    const isLeft = position.includes('Left');
    const isFront = position.includes('Front');
    const statusColor = data.status === 'critical' ? '#EF4444' : data.status === 'warning' ? '#F59E0B' : '#10B981';
    
    return (
      <View style={[
        styles.tireIndicator, 
        isFront ? { top: 0 } : { bottom: 0 },
        isLeft ? { left: 0 } : { right: 0 }
      ]}>
        <View style={[styles.tireRect, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.tireValue, { color: statusColor }]}>{data.current}</Text>
          <Text style={styles.tireUnit}>bar</Text>
        </View>
        {data.status !== 'ok' && (
           <View style={[styles.tireWarningBadge, { backgroundColor: statusColor }]}>
             <MaterialCommunityIcons name="alert" size={10} color="#fff" />
           </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.tireContainer}>
      <View style={styles.carBodyOutline}>
        {/* Stylized Car Chassis */}
        <View style={styles.carChassis} />
        <View style={styles.carCabin} />
      </View>

      {renderTire('frontLeft', TIRE_PRESSURE.frontLeft)}
      {renderTire('frontRight', TIRE_PRESSURE.frontRight)}
      {renderTire('rearLeft', TIRE_PRESSURE.rearLeft)}
      {renderTire('rearRight', TIRE_PRESSURE.rearRight)}
      
      <View style={styles.tireLegend}>
        <Text style={styles.legendText}>Recomendado: 2.4 bar</Text>
      </View>
    </View>
  );
};

const MapPlaceholder = () => {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapBackground}>
        {/* Pseudo-Map Elements */}
        <View style={[styles.mapRoad, { top: '40%', width: '100%', height: 20 }]} />
        <View style={[styles.mapRoad, { left: '40%', height: '100%', width: 20 }]} />
        
        {/* Current Location */}
        <View style={styles.mapCurrentLoc}>
           <View style={styles.mapPulse} />
           <FontAwesome5 name="location-arrow" size={16} color="#fff" />
        </View>

        {/* Points of Interest */}
        {NEARBY_SERVICES.map((service, i) => (
          <View key={service.id} style={[styles.mapPoi, { top: `${service.lat}%`, left: `${service.long}%` }]}>
             <MaterialCommunityIcons 
                name={service.type === 'gas' ? 'gas-station' : service.type === 'mechanic' ? 'wrench' : 'parking'} 
                size={14} 
                color="#fff" 
             />
          </View>
        ))}
      </View>
      
      <LinearGradient 
        colors={['transparent', 'rgba(15, 23, 42, 0.8)']} 
        style={styles.mapOverlay}
      >
        <View style={styles.mapHeader}>
           <Text style={styles.mapTitle}>Servicios Cercanos</Text>
           <View style={styles.mapTags}>
              <View style={styles.mapTag}><Text style={styles.mapTagText}>Gasolineras</Text></View>
              <View style={styles.mapTag}><Text style={styles.mapTagText}>Talleres</Text></View>
           </View>
        </View>
        <TouchableOpacity style={styles.mapFab}>
           <MaterialCommunityIcons name="navigation" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default function VehicleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // State for Vehicle Data
  const [vehicleInfo, setVehicleInfo] = useState(VEHICLE_INFO);
  
  // State for Maintenance History
  const [maintenanceHistory, setMaintenanceHistory] = useState([
     { id: 'm1', title: 'Cambio de Aceite', date: '10 Oct 2024', km: 40000, cost: 120, type: 'routine' },
     { id: 'm2', title: 'Neumáticos Traseros', date: '05 Ago 2024', km: 38000, cost: 350, type: 'repair' }
  ]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'mileage' | 'maintenance'
  
  // Input State
  const [inputMileage, setInputMileage] = useState('');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintCost, setMaintCost] = useState('');

  const openMileageModal = () => {
    setModalType('mileage');
    setInputMileage(vehicleInfo.mileage.toString());
    setModalVisible(true);
  };

  const openMaintenanceModal = () => {
    setModalType('maintenance');
    setMaintTitle('');
    setMaintCost('');
    setModalVisible(true);
  };

  const handleSaveMileage = () => {
    const newKm = parseInt(inputMileage);
    if (isNaN(newKm)) {
      Alert.alert("Error", "Introduce un número válido");
      return;
    }
    if (newKm < vehicleInfo.mileage) {
      Alert.alert("Aviso", "El nuevo kilometraje es menor al actual. ¿Es correcto?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, corregir", onPress: () => updateMileage(newKm) }
      ]);
    } else {
      updateMileage(newKm);
    }
  };

  const updateMileage = (km) => {
    setVehicleInfo(prev => ({ ...prev, mileage: km }));
    setModalVisible(false);
  };

  const handleSaveMaintenance = () => {
    if (!maintTitle || !maintCost) {
      Alert.alert("Error", "Completa título y coste");
      return;
    }
    
    const newEntry = {
      id: Date.now().toString(),
      title: maintTitle,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      km: vehicleInfo.mileage,
      cost: parseFloat(maintCost),
      type: 'routine' 
    };

    setMaintenanceHistory(prev => [newEntry, ...prev]);
    
    // Auto-update next service if it's a routine service (simplified logic)
    // Assuming 15,000km interval
    const nextService = vehicleInfo.mileage + 15000;
    setVehicleInfo(prev => ({
        ...prev,
        nextServiceKm: nextService,
        nextServiceDate: 'Calculando...' // In a real app, calculate date based on usage
    }));

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* --- MODAL FOR INPUTS --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                    {modalType === 'mileage' ? 'Actualizar Kilometraje' : 'Nuevo Mantenimiento'}
                </Text>

                {modalType === 'mileage' ? (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kilometraje Actual (km)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={inputMileage}
                            onChangeText={setInputMileage}
                            placeholder="Ej: 45300"
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Concepto</Text>
                            <TextInput
                                style={styles.input}
                                value={maintTitle}
                                onChangeText={setMaintTitle}
                                placeholder="Ej: Cambio de Pastillas"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Coste (€)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={maintCost}
                                onChangeText={setMaintCost}
                                placeholder="0.00"
                            />
                        </View>
                    </>
                )}

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.btn, styles.btnCancel]} 
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.btnTextCancel}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.btn, styles.btnConfirm]} 
                        onPress={modalType === 'mileage' ? handleSaveMileage : handleSaveMaintenance}
                    >
                        <Text style={styles.btnTextConfirm}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- DASHBOARD HEADER SECTION --- */}
      <LinearGradient
        colors={DASHBOARD_BG}
        style={[styles.dashboardHeader, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
             <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Dashboard</Text>
           <TouchableOpacity style={styles.iconBtn}>
             <MaterialCommunityIcons name="cog" size={24} color="#fff" />
           </TouchableOpacity>
        </View>

        {/* 3D Car Placeholder & Info */}
        <View style={styles.carSection}>
           <FontAwesome5 name="car" size={64} color="#E2E8F0" style={styles.carIcon} />
           <Text style={styles.carModel}>{vehicleInfo.model}</Text>
           <View style={styles.plateBadge}>
             <Text style={styles.plateText}>{vehicleInfo.plate}</Text>
           </View>
        </View>

        {/* Gauges */}
        <View style={styles.gaugeCluster}>
           <TouchableOpacity onPress={openMileageModal} activeOpacity={0.7}>
               <DashboardGauge 
                 value={vehicleInfo.mileage} 
                 maxValue={vehicleInfo.maxMileage} 
                 label="ODOMETER" 
                 icon="speedometer"
                 color="#38BDF8" // Cyan
               />
           </TouchableOpacity>
           <DashboardGauge 
             value={vehicleInfo.fuelLevel} 
             maxValue={100} 
             label="FUEL" 
             icon="gas-station" 
             isFuel
             range={vehicleInfo.range}
             color={vehicleInfo.fuelLevel < 20 ? '#EF4444' : '#34D399'} // Red if low, Green otherwise
           />
        </View>
      </LinearGradient>

      {/* --- SCROLLABLE CONTENT --- */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Alerts */}
        <View style={styles.section}>
           {MAINTENANCE_ALERTS.map(alert => (
             <AlertCard key={alert.id} alert={alert} />
           ))}
        </View>

        {/* Document Wallet */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cartera de Documentos</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Ver todo</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docScroll}>
            {DOCUMENTS.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
          </ScrollView>
        </View>

        {/* Tire Pressure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presión de Neumáticos</Text>
          <TirePressureVisual />
        </View>

        {/* Service Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mapa de Servicios</Text>
          <MapPlaceholder />
        </View>

        {/* Maintenance History */}
        <View style={styles.section}>
           <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionTitle}>Historial de Mantenimiento</Text>
               <TouchableOpacity onPress={openMaintenanceModal}>
                   <MaterialCommunityIcons name="plus-circle" size={24} color={THEME_COLOR} />
               </TouchableOpacity>
           </View>
           <View style={styles.tableCard}>
             {maintenanceHistory.length === 0 ? (
                 <Text style={{padding: 20, color: '#64748B', textAlign: 'center'}}>No hay registros.</Text>
             ) : (
                 maintenanceHistory.map((item, index) => (
                   <View key={item.id}>
                     <View style={styles.tripRow}>
                        <View style={[styles.tripIcon, { backgroundColor: item.type === 'routine' ? '#E0F2FE' : '#FEF2F2' }]}>
                          <MaterialCommunityIcons name={item.type === 'routine' ? 'wrench-clock' : 'car-wrench'} size={20} color={item.type === 'routine' ? '#0284C7' : '#DC2626'} />
                        </View>
                        <View style={styles.tripInfo}>
                          <Text style={styles.tripDest}>{item.title}</Text>
                          <Text style={styles.tripDate}>{item.date}</Text>
                        </View>
                        <View style={styles.tripStats}>
                          <Text style={styles.tripKm}>€{item.cost}</Text>
                          <Text style={styles.tripCons}>{item.km.toLocaleString()} km</Text>
                        </View>
                     </View>
                     {index < maintenanceHistory.length - 1 && <View style={styles.separator} />}
                   </View>
                 ))
             )}
           </View>
        </View>

        {/* Trip Log */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Registro de Viajes</Text>
           <View style={styles.tableCard}>
             {TRIP_LOGS.map((trip, index) => (
               <View key={trip.id}>
                 <TripRow trip={trip} />
                 {index < TRIP_LOGS.length - 1 && <View style={styles.separator} />}
               </View>
             ))}
           </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
           <View style={styles.statCard}>
              <Text style={styles.statLabel}>Próx. Servicio</Text>
              <Text style={styles.statValue}>{vehicleInfo.nextServiceDate}</Text>
              <Text style={styles.statSub}>en {(vehicleInfo.nextServiceKm - vehicleInfo.mileage).toLocaleString()} km</Text>
           </View>
           <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gasto Mensual</Text>
              <Text style={styles.statValue}>€145.20</Text>
              <Text style={styles.statSub}>+12% vs mes ant.</Text>
           </View>
        </View>

      </ScrollView>
    </View>
  );
}

const GAUGE_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  dashboardHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  carSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  carIcon: {
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  carModel: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  plateBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  plateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1,
  },
  gaugeCluster: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  gaugeOuter: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gaugeInner: {
    alignItems: 'center',
    zIndex: 2,
  },
  gaugeValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  gaugeLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rangeText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  needleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  needle: {
    width: 4,
    height: GAUGE_SIZE / 2 - 10,
    borderRadius: 2,
    position: 'absolute',
    top: 10, 
  },
  needleCap: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 3,
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 0,
  },
  contentScroll: {
    flex: 1,
    marginTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  seeAllText: {
    color: THEME_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertMsg: {
    fontSize: 13,
    color: '#4B5563',
  },
  alertAction: {
    padding: 4,
  },
  docScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docContent: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  docExpiry: {
    fontSize: 11,
    color: '#64748B',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDest: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  tripDate: {
    fontSize: 12,
    color: '#64748B',
  },
  tripStats: {
    alignItems: 'flex-end',
  },
  tripKm: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  tripCons: {
    fontSize: 11,
    color: '#64748B',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 60,
  },
  tireContainer: {
    height: 220,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  carBodyOutline: {
    width: 80,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carChassis: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  carCabin: {
    position: 'absolute',
    width: '80%',
    height: '50%',
    backgroundColor: '#CBD5E1',
    borderRadius: 12,
    top: '25%',
  },
  tireIndicator: {
    position: 'absolute',
    width: 120, // Broad enough to hold info
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tireRect: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  tireValue: {
    fontWeight: '800',
    fontSize: 14,
  },
  tireUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  tireWarningBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  tireLegend: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#CBD5E1', // Map color
    position: 'relative',
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  mapCurrentLoc: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    backgroundColor: THEME_COLOR,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapPoi: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  mapHeader: {
    flex: 1,
  },
  mapTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  mapTags: {
    flexDirection: 'row',
    gap: 8,
  },
  mapTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  mapFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#10B981', // Green trend
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
  },
  btnConfirm: {
    backgroundColor: THEME_COLOR,
  },
  btnTextCancel: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },
  btnTextConfirm: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }
});
