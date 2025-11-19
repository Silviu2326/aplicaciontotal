import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  Pressable
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- THEME ---
const THEME_COLOR = '#84CC16'; // Lime Green
const BG_COLOR = '#F8FAFC';
const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const TARGET_MACROS = {
  calories: 2200,
  protein: 160,
  carbs: 250,
  fat: 70,
};

const INITIAL_MEALS_DATA = [
  {
    id: 'breakfast',
    title: 'Desayuno',
    items: [
      { name: 'Avena con proteína', cal: 350, protein: 30, carbs: 45, fat: 6 },
      { name: 'Café negro', cal: 5, protein: 0, carbs: 1, fat: 0 },
      { name: 'Manzana', cal: 95, protein: 0, carbs: 25, fat: 0 },
    ]
  },
  {
    id: 'lunch',
    title: 'Almuerzo',
    items: [
      { name: 'Pechuga de pollo', cal: 300, protein: 50, carbs: 0, fat: 5 },
      { name: 'Arroz integral', cal: 250, protein: 5, carbs: 50, fat: 2 },
      { name: 'Ensalada mixta', cal: 100, protein: 2, carbs: 10, fat: 5 },
      { name: 'Aceite de oliva', cal: 100, protein: 0, carbs: 0, fat: 11 },
    ]
  },
  {
    id: 'snack',
    title: 'Snack',
    items: [
      { name: 'Yogur griego', cal: 150, protein: 15, carbs: 8, fat: 0 },
      { name: 'Almendras (15g)', cal: 100, protein: 4, carbs: 3, fat: 9 },
    ]
  },
  {
    id: 'dinner',
    title: 'Cena',
    items: [] 
  }
];

const WEEKLY_MENU = [
  { day: 'L', date: '18', active: false, label: 'Rest Day' },
  { day: 'M', date: '19', active: true, label: 'High Carb' },
  { day: 'X', date: '20', active: false, label: 'Low Carb' },
  { day: 'J', date: '21', active: false, label: 'Regular' },
  { day: 'V', date: '22', active: false, label: 'Regular' },
  { day: 'S', date: '23', active: false, label: 'Cheat Meal' },
  { day: 'D', date: '24', active: false, label: 'Prep' },
];

const SUPPLEMENTS_DATA = [
  { id: '1', name: 'Creatina Monohidrato', dose: '5g', taken: true },
  { id: '2', name: 'Multivitamínico', dose: '1 cap', taken: false },
  { id: '3', name: 'Omega 3', dose: '2 caps', taken: false },
];

const SUGGESTED_RECIPES = [
  { 
    id: '1', 
    title: 'Tortitas de Avena', 
    time: '15 min', 
    cal: 350, 
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    tags: ['Desayuno', 'Alto Proteína'] 
  },
  { 
    id: '2', 
    title: 'Bowl de Atún Picante', 
    time: '20 min', 
    cal: 420, 
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    tags: ['Cena', 'Low Carb'] 
  },
];

// --- NEW COMPONENTS ---

const WeeklyPlan = () => {
  return (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionHeader}>Tu Semana</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weeklyScroll}>
        {WEEKLY_MENU.map((day, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.dayCard, day.active && styles.dayCardActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, day.active && styles.dayTextActive]}>{day.day}</Text>
            <View style={[styles.dateBadge, day.active && styles.dateBadgeActive]}>
              <Text style={[styles.dateTextCard, day.active && styles.dateTextActive]}>{day.date}</Text>
            </View>
            <Text style={[styles.dayLabel, day.active && styles.dayLabelActive]}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const SupplementItem = ({ item, onToggle }) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={styles.supplementRow}>
    <View style={styles.supplementInfo}>
      <View style={[styles.checkbox, item.taken && styles.checkboxChecked]}>
        {item.taken && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
      </View>
      <View>
        <Text style={[styles.supplementName, item.taken && styles.supplementNameChecked]}>{item.name}</Text>
        <Text style={styles.supplementDose}>{item.dose}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const SupplementTracker = () => {
  const [supplements, setSupplements] = useState(SUPPLEMENTS_DATA);

  const toggleSupplement = (id) => {
    setSupplements(prev => prev.map(s => 
      s.id === id ? { ...s, taken: !s.taken } : s
    ));
  };

  return (
    <View style={styles.supplementContainer}>
      <Text style={styles.sectionHeader}>Suplementación</Text>
      <View style={styles.supplementCard}>
        {supplements.map((item, index) => (
          <View key={item.id}>
            <SupplementItem item={item} onToggle={() => toggleSupplement(item.id)} />
            {index < supplements.length - 1 && <View style={styles.supplementDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
};

const RecipeCard = ({ recipe }) => (
  <TouchableOpacity style={styles.recipeCard} activeOpacity={0.9}>
    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
    <View style={styles.recipeOverlay}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.recipeGradient}
      >
        <View style={styles.recipeContent}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.recipeMetaRow}>
            <View style={styles.recipeBadge}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#fff" />
              <Text style={styles.recipeBadgeText}>{recipe.time}</Text>
            </View>
            <Text style={styles.recipeCal}>{recipe.cal} kcal</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  </TouchableOpacity>
);

const RecipeList = () => {
  return (
    <View style={styles.recipeContainer}>
      <Text style={styles.sectionHeader}>Sugerencias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeScroll}>
        {SUGGESTED_RECIPES.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>
    </View>
  );
};

// --- COMPONENTS ---

const Header = ({ title }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity style={styles.scannerButtonSmall}>
         <MaterialCommunityIcons name="barcode-scan" size={20} color="#1E293B" />
      </TouchableOpacity>
    </View>
  );
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const MacroBar = ({ label, current, target, unit, fromColor, toColor, delay }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const widthPercent = Math.min((current / target) * 100, 100);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: widthPercent,
      duration: 1000,
      delay: delay,
      useNativeDriver: false,
    }).start();
  }, [widthPercent]);

  return (
    <View style={styles.macroContainer}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {current} <Text style={styles.macroTarget}>/ {target}{unit}</Text>
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <AnimatedLinearGradient
          colors={[fromColor, toColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressBarFill, 
            { 
              width: progress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const MealSection = ({ section, isExpanded, onToggle, onAddFood }) => {
  const totalCalories = useMemo(() => {
    return section.items.reduce((acc, item) => acc + item.cal, 0);
  }, [section.items]);

  return (
    <View style={[styles.mealCard, isExpanded && styles.mealCardExpanded]}>
      <TouchableOpacity 
        style={styles.mealHeader} 
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.mealTitleRow}>
          <LinearGradient
            colors={isExpanded ? [THEME_COLOR, '#65A30D'] : ['#F1F5F9', '#E2E8F0']}
            style={styles.mealIcon}
          >
            <MaterialCommunityIcons 
              name={isExpanded ? "food-apple" : "food-apple-outline"} 
              size={20} 
              color={isExpanded ? "#fff" : "#64748B"} 
            />
          </LinearGradient>
          <View>
            <Text style={styles.mealTitle}>{section.title}</Text>
            <Text style={styles.mealSubtitle}>{totalCalories} kcal</Text>
          </View>
        </View>
        <MaterialCommunityIcons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#94A3B8" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.mealContent}>
          {section.items.length > 0 ? (
            section.items.map((item, index) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.foodName}>{item.name}</Text>
                <View style={styles.foodMacros}>
                    <Text style={styles.foodMacroText}>P:{item.protein}g C:{item.carbs}g F:{item.fat}g</Text>
                </View>
                <Text style={styles.foodCal}>{item.cal} kcal</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyFood}>No hay alimentos registrados</Text>
          )}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => onAddFood(section.id)}
          >
            <LinearGradient
              colors={[THEME_COLOR, '#65A30D']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Añadir Alimento</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const HydrationGlass = ({ current, target }) => {
  const fillAnim = useRef(new Animated.Value(current / target)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: Math.min(current / target, 1),
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [current, target]);

  return (
    <View style={styles.glassContainer}>
      <View style={styles.glassBody}>
        <View style={styles.glassReflection} />
        <Animated.View 
          style={[
            styles.waterFill, 
            { 
              height: fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) 
            }
          ]}
        >
           <LinearGradient
            colors={['#60A5FA', '#3B82F6']}
            style={{ flex: 1 }}
          />
          {/* Bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
        </Animated.View>
      </View>
      <View style={styles.glassBase} />
    </View>
  );
};

const WaterCounter = () => {
  const [glasses, setGlasses] = useState(4);
  const target = 8;

  const handleAdd = () => setGlasses(prev => Math.min(prev + 1, 15));
  const handleRemove = () => setGlasses(prev => Math.max(prev - 1, 0));

  return (
    <View style={styles.waterCard}>
      <View style={styles.waterInfo}>
        <View style={styles.waterHeader}>
          <MaterialCommunityIcons name="water" size={24} color="#3B82F6" />
          <Text style={styles.waterTitle}>Hidratación</Text>
        </View>
        <Text style={styles.waterCount}>
          {glasses} <Text style={styles.waterTarget}>/ {target} vasos</Text>
        </Text>
        <View style={styles.waterControls}>
          <TouchableOpacity onPress={handleRemove} style={styles.controlBtn}>
            <MaterialCommunityIcons name="minus" size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAdd} style={[styles.controlBtn, styles.addBtn]}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Pressable onPress={handleAdd} style={styles.glassWrapper}>
         <HydrationGlass current={glasses} target={target} />
      </Pressable>
    </View>
  );
};

const ScanFAB = () => (
  <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8}>
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.fabGradient}
    >
      <View style={styles.cameraLensOuter}>
        <View style={styles.cameraLensInner}>
           <MaterialCommunityIcons name="barcode-scan" size={24} color="#fff" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// --- MAIN SCREEN ---

export default function DietScreen() {
  const [expandedMeal, setExpandedMeal] = useState('breakfast');
  const [meals, setMeals] = useState(INITIAL_MEALS_DATA);

  const [macros, setMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Calculate totals whenever meals change
  useEffect(() => {
    let newCalories = 0;
    let newProtein = 0;
    let newCarbs = 0;
    let newFat = 0;

    meals.forEach(meal => {
      meal.items.forEach(item => {
        newCalories += item.cal;
        newProtein += item.protein;
        newCarbs += item.carbs;
        newFat += item.fat;
      });
    });

    setMacros({
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat
    });
  }, [meals]);

  const toggleMeal = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMeal(expandedMeal === id ? null : id);
  };

  const addFoodItem = (mealId) => {
    // Mock functionality: Add a random food item
    const newFoods = [
        { name: 'Manzana', cal: 52, protein: 0, carbs: 14, fat: 0 },
        { name: 'Huevo Duro', cal: 78, protein: 6, carbs: 0, fat: 5 },
        { name: 'Batido Proteína', cal: 120, protein: 24, carbs: 3, fat: 1 },
        { name: 'Tostada Integral', cal: 80, protein: 3, carbs: 15, fat: 1 }
    ];
    const randomFood = newFoods[Math.floor(Math.random() * newFoods.length)];

    setMeals(prevMeals => prevMeals.map(meal => {
        if (meal.id === mealId) {
            return {
                ...meal,
                items: [...meal.items, randomFood]
            };
        }
        return meal;
    }));
  };

  return (
    <View style={styles.container}>
      <Header title="Nutrición" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.caloriesRow}>
            <View>
              <Text style={styles.summaryTitle}>Resumen Diario</Text>
              <Text style={styles.dateText}>Hoy, 19 Nov</Text>
            </View>
            <View style={styles.calCircle}>
               <Text style={styles.calValue}>{macros.calories}</Text>
               <Text style={styles.calLabel}>kcal</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <MacroBar 
            label="Proteína" 
            current={macros.protein} 
            target={TARGET_MACROS.protein} 
            unit="g"
            fromColor="#3B82F6"
            toColor="#60A5FA"
            delay={300}
          />
          <MacroBar 
            label="Carbohidratos" 
            current={macros.carbs} 
            target={TARGET_MACROS.carbs} 
            unit="g"
            fromColor="#F59E0B"
            toColor="#FBBF24" 
            delay={500}
          />
          <MacroBar 
            label="Grasas" 
            current={macros.fat} 
            target={TARGET_MACROS.fat} 
            unit="g"
            fromColor="#EF4444"
            toColor="#F87171"
            delay={700}
          />
        </View>

        <WeeklyPlan />
        <SupplementTracker />

        {/* Water Section */}
        <WaterCounter />

        {/* Meals Section */}
        <Text style={styles.sectionHeader}>Comidas</Text>
        <View style={styles.mealsContainer}>
          {meals.map(meal => (
            <MealSection 
              key={meal.id} 
              section={meal} 
              isExpanded={expandedMeal === meal.id} 
              onToggle={() => toggleMeal(meal.id)}
              onAddFood={addFoodItem}
            />
          ))}
        </View>

        <RecipeList />

        <View style={{ height: 80 }} />
      </ScrollView>

      <ScanFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scannerButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  calCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  calLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  // Macros
  macroContainer: {
    marginBottom: 16,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  macroTarget: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Water Card
  waterCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  waterInfo: {
    flex: 1,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  waterCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
    marginLeft: 32,
    marginBottom: 12,
  },
  waterTarget: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 32,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#3B82F6',
  },
  // Glass Animation
  glassWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  glassContainer: {
    alignItems: 'center',
  },
  glassBody: {
    width: 60,
    height: 90,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
  glassBase: {
    width: 50,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginTop: 2,
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  glassReflection: {
    position: 'absolute',
    top: 10,
    right: 8,
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    zIndex: 10,
  },
  bubble1: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  bubble2: {
    position: 'absolute',
    bottom: 25,
    right: 15,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  // Meals
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginLeft: 4,
  },
  mealsContainer: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealCardExpanded: {
    borderColor: THEME_COLOR,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  mealSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  mealContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  foodName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  foodMacros: {
    marginRight: 12,
  },
  foodMacroText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  foodCal: {
    fontSize: 14,
    color: '#94A3B8',
    width: 60,
    textAlign: 'right',
  },
  emptyFood: {
    paddingVertical: 12,
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 14,
    fontStyle: 'italic',
  },
  addButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLensOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  cameraLensInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  // --- NEW STYLES ---
  weeklyContainer: {
    marginBottom: 24,
  },
  weeklyScroll: {
    paddingRight: 20,
  },
  dayCard: {
    width: 60,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayCardActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayTextActive: {
    color: '#fff',
  },
  dateBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dateTextCard: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateTextActive: {
    color: '#fff',
  },
  dayLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dayLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  // Supplement Styles
  supplementContainer: {
    marginBottom: 24,
  },
  supplementCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  supplementRow: {
    paddingVertical: 8,
  },
  supplementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  supplementName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  supplementNameChecked: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  supplementDose: {
    fontSize: 12,
    color: '#94A3B8',
  },
  supplementDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginLeft: 36,
  },
  // Recipe Styles
  recipeContainer: {
    marginBottom: 24,
  },
  recipeScroll: {
    paddingRight: 20,
  },
  recipeCard: {
    width: 200,
    height: 140,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: '#ccc', // Placeholder
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  recipeGradient: {
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  recipeContent: {
    gap: 4,
  },
  recipeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recipeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  recipeCal: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});