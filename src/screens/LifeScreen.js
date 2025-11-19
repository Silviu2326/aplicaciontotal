import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions, 
  Animated, 
  TextInput,
  Pressable 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- DATA ---
const ALL_MODULES = [
  // Main
  { id: 'finance', title: 'Finanzas', category: 'Gestión', icon: 'finance', color: '#10B981', description: 'Activos y gastos' },
  { id: 'work', title: 'Trabajo', category: 'Profesional', icon: 'briefcase-variant', color: '#3B82F6', description: 'Proyectos y CRM' },
  { id: 'university', title: 'Universidad', category: 'Profesional', icon: 'school', color: '#F59E0B', description: 'Exámenes y notas' },
  { id: 'gym', title: 'Gimnasio', category: 'Salud', icon: 'dumbbell', color: '#6366F1', description: 'Rutinas y PRs' },
  { id: 'diet', title: 'Dieta', category: 'Salud', icon: 'food-apple', color: '#84CC16', description: 'Nutrición' },
  { id: 'home', title: 'Hogar', category: 'Gestión', icon: 'home-variant', color: '#8B5CF6', description: 'Inventario' },
  { id: 'vehicle', title: 'Vehículo', category: 'Gestión', icon: 'car-sports', color: '#EC4899', description: 'Mantenimiento' },
  { id: 'travel', title: 'Viajes', category: 'Ocio', icon: 'airplane', color: '#06B6D4', description: 'Itinerarios' },
  // Support
  { id: 'documents', title: 'Vault', category: 'Gestión', icon: 'file-document-outline', color: '#64748B', description: 'Docs seguros' },
  { id: 'goals', title: 'Metas', category: 'Personal', icon: 'target', color: '#EF4444', description: 'Objetivos' },
  { id: 'health', title: 'Salud', category: 'Salud', icon: 'heart-pulse', color: '#F43F5E', description: 'Bio-datos' },
  { id: 'entertainment', title: 'Ocio', category: 'Ocio', icon: 'gamepad-variant-outline', color: '#A855F7', description: 'Media list' },
  { id: 'shopping', title: 'Compras', category: 'Gestión', icon: 'shopping-outline', color: '#F97316', description: 'Wishlist' },
  { id: 'events', title: 'Eventos', category: 'Personal', icon: 'gift-outline', color: '#D946EF', description: 'Fechas' },
  { id: 'notes', title: 'Notas', category: 'Personal', icon: 'notebook-outline', color: '#EAB308', description: 'Diario' },
];

const CATEGORIES = ['Todo', 'Gestión', 'Profesional', 'Salud', 'Ocio', 'Personal'];

// --- COMPONENTS ---

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ModuleCard = ({ item, width, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 30, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 6, tension: 50, delay: index * 30, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { 
          width, 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }, { translateY }],
          shadowColor: item.color, // Colored glow
        }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Subtle Tint Background */}
      <View style={[styles.cardTint, { backgroundColor: item.color }]} />
      
      {/* Top Row */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
      </View>

      {/* Bottom Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
      </View>

      {/* Decorative Watermark */}
      <MaterialCommunityIcons 
        name={item.icon} 
        size={60} 
        color={item.color} 
        style={styles.watermark} 
      />
    </AnimatedPressable>
  );
};

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.chip, active && styles.chipActive]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function LifeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todo');
  
  // Filter Logic
  const filteredModules = ALL_MODULES.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = activeCategory === 'Todo' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Cálculo corregido para 2 columnas respetando el gap
  // Width total - Padding Horizontal (20*2) - Gap entre columnas (16) / 2
  const cardWidth = (width - 40 - 16) / 2; 

  const handleModulePress = (id) => {
    switch (id) {
      case 'finance':
        navigation.navigate('Finance');
        break;
      case 'work':
        navigation.navigate('Work');
        break;
      case 'university':
        navigation.navigate('University');
        break;
      case 'gym':
        navigation.navigate('Gym');
        break;
      case 'diet':
        navigation.navigate('Diet');
        break;
      case 'home':
        navigation.navigate('HomeManage');
        break;
      case 'vehicle':
        navigation.navigate('Vehicle');
        break;
      case 'travel':
        navigation.navigate('Travel');
        break;
      case 'documents':
        navigation.navigate('Vault');
        break;
      case 'goals':
        navigation.navigate('Goals');
        break;
      case 'health':
        navigation.navigate('Health');
        break;
      case 'entertainment':
        navigation.navigate('Entertainment');
        break;
      case 'shopping':
        navigation.navigate('Shopping');
        break;
      case 'events':
        navigation.navigate('Events');
        break;
      case 'notes':
        navigation.navigate('Notes');
        break;
      default:
        break;
    }
  };

  // Date formatting
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <View style={styles.container}>
      
      {/* --- HEADER --- */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerDate}>{formattedDate}</Text>
            <Text style={styles.headerGreeting}>Hola, Usuario</Text>
          </View>
          <View style={styles.profileImage}>
             <Text style={{fontSize: 18}}>👤</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar módulo..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
             <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
             </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScroll}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map(cat => (
            <FilterChip 
              key={cat} 
              label={cat} 
              active={activeCategory === cat} 
              onPress={() => setActiveCategory(cat)} 
            />
          ))}
        </ScrollView>
      </View>

      {/* --- CONTENT --- */}
      <ScrollView 
        contentContainerStyle={styles.gridScroll} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredModules.map((item, index) => (
            <ModuleCard 
              key={item.id} 
              item={item} 
              width={cardWidth} 
              index={index}
              onPress={() => handleModulePress(item.id)}
            />
          ))}
        </View>
        
        {filteredModules.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="text-search" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No se encontraron módulos</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerDate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerGreeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    height: '100%',
  },
  // Categories
  categoriesScroll: {
    paddingRight: 20,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#fff',
  },
  // Grid
  gridScroll: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  // Card
  card: {
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    // marginBottom removido para usar gap correctamente
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, // Stronger glow
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  watermark: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    opacity: 0.08,
    transform: [{ rotate: '-10deg' }],
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
