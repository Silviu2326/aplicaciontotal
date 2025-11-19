import React, { useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  useWindowDimensions,
  Animated,
  ImageBackground
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// --- MOCK DATA ---
const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'movie', label: 'Películas' },
  { id: 'series', label: 'Series' },
  { id: 'book', label: 'Libros' },
  { id: 'game', label: 'Juegos' },
];

const INITIAL_WATCH_LIST = [
  { id: '1', title: 'Dune: Parte 2', type: 'movie', image: 'https://via.placeholder.com/400x600/4B0082/FFFFFF?text=Dune+2', status: 'Pendiente', progress: 0, rating: 0, desc: "Paul Atreides se une a Chani y los Fremen mientras busca venganza..." },
  { id: '2', title: 'The Bear S3', type: 'series', image: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=The+Bear', status: 'Viendo', progress: 0.4, rating: 5, desc: "Carmy se esfuerza más que nunca y exige excelencia a su equipo." },
  { id: '3', title: 'Elden Ring', type: 'game', image: 'https://via.placeholder.com/400x600/8B4513/FFFFFF?text=Elden+Ring', status: 'Jugando', progress: 0.7, rating: 5, desc: "Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder." },
  { id: '4', title: 'Hábitos Atómicos', type: 'book', image: 'https://via.placeholder.com/400x600/D2691E/FFFFFF?text=Habitos', status: 'Leyendo', progress: 0.2, rating: 4, desc: "Cambios pequeños, resultados extraordinarios." },
  { id: '5', title: 'Oppenheimer', type: 'movie', image: 'https://via.placeholder.com/400x600/333333/FFFFFF?text=Oppenheimer', status: 'Pendiente', progress: 0, rating: 0, desc: "La historia del científico estadounidense J. Robert Oppenheimer." },
  { id: '6', title: 'Cyberpunk 2077', type: 'game', image: 'https://via.placeholder.com/400x600/FCEE0A/000000?text=Cyberpunk', status: 'Pendiente', progress: 0, rating: 0, desc: "Una historia de acción y aventura en Night City." },
];

const YEAR_STATS = {
  totalHours: 482,
  moviesWatched: 34,
  seriesCompleted: 5,
  topGenre: 'Ciencia Ficción',
};

const FRIENDS_ACTIVITY = [
  { id: 'f1', name: 'Ana', action: 'viendo', title: 'The Office', avatar: 'https://via.placeholder.com/100x100/FF69B4/FFFFFF?text=A', time: '2h' },
  { id: 'f2', name: 'Carlos', action: 'jugando', title: 'FIFA 24', avatar: 'https://via.placeholder.com/100x100/4169E1/FFFFFF?text=C', time: '5m' },
  { id: 'f3', name: 'Sofia', action: 'leyó', title: '1984', avatar: 'https://via.placeholder.com/100x100/32CD32/FFFFFF?text=S', time: '1d' },
];

const COLLECTIONS = [
  { id: 'c1', title: 'Cyberpunk Essentials', count: 12, image: 'https://via.placeholder.com/300x150/000000/00FF00?text=Cyberpunk' },
  { id: 'c2', title: 'Clásicos de los 80', count: 25, image: 'https://via.placeholder.com/300x150/000080/FF00FF?text=80s' },
  { id: 'c3', title: 'Ghibli Magic', count: 18, image: 'https://via.placeholder.com/300x150/4682B4/FFFFFF?text=Ghibli' },
];

// --- COMPONENTS ---

const StarRating = ({ rating, onRate, size = 16, interactive = true }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => interactive && onRate && onRate(star)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.5 : 1}
        >
          <MaterialCommunityIcons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#F59E0B" : "rgba(255,255,255,0.3)"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const TypeBadge = ({ type }) => {
  let icon = 'movie-open';
  let color = '#EC4899'; 

  switch (type) {
    case 'movie': icon = 'movie-open'; color = '#EC4899'; break;
    case 'series': icon = 'television-classic'; color = '#8B5CF6'; break;
    case 'game': icon = 'controller-classic'; color = '#10B981'; break;
    case 'book': icon = 'book-open-variant'; color = '#F59E0B'; break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '30', borderColor: color + '50' }]}>
      <MaterialCommunityIcons name={icon} size={12} color={color} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color }]}>{type.toUpperCase()}</Text>
    </View>
  );
};

const HeroCard = ({ item, width, onRate }) => {
  return (
    <View style={[styles.heroCard, { width: width - 40 }]}>
      <ImageBackground source={{ uri: item.image }} style={styles.heroImage} imageStyle={{ borderRadius: 24 }}>
        <LinearGradient
          colors={['transparent', 'rgba(15, 7, 22, 0.2)', '#0F0716']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeBadge type={item.type} />
                <StarRating rating={item.rating} onRate={(r) => onRate(item.id, r)} size={20} />
            </View>
            
            <Text style={styles.heroTitle}>{item.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>{item.desc}</Text>
            
            {item.progress > 0 && (
              <View style={styles.heroProgressContainer}>
                <View style={[styles.heroProgressBar, { width: `${item.progress * 100}%` }]} />
                <Text style={styles.heroProgressText}>{Math.round(item.progress * 100)}% Completado</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.heroPlayButton}>
              <MaterialCommunityIcons name="play" size={24} color="#000" />
              <Text style={styles.heroPlayText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const StatsBlock = () => (
  <View style={styles.section}>
     <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>Tu 2025 Wrapped</Text>
     <View style={styles.statsGrid}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statCardLarge}>
           <View>
              <Text style={styles.statValue}>{YEAR_STATS.totalHours}h</Text>
              <Text style={styles.statLabel}>Tiempo Total</Text>
           </View>
           <MaterialCommunityIcons name="clock-time-four-outline" size={40} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
        </LinearGradient>
        <View style={styles.statColumn}>
           <View style={[styles.statCardSmall, { backgroundColor: '#1E1B2E' }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                  <MaterialCommunityIcons name="movie-open" size={20} color="#EC4899" />
              </View>
              <View>
                 <Text style={styles.statValueSmall}>{YEAR_STATS.moviesWatched}</Text>
                 <Text style={styles.statLabelSmall}>Películas</Text>
              </View>
           </View>
           <View style={[styles.statCardSmall, { backgroundColor: '#1E1B2E' }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <MaterialCommunityIcons name="rocket-launch" size={20} color="#F59E0B" />
              </View>
              <View>
                 <Text style={styles.statValueSmall} numberOfLines={1}>{YEAR_STATS.topGenre}</Text>
                 <Text style={styles.statLabelSmall}>Top Género</Text>
              </View>
           </View>
        </View>
     </View>
  </View>
);

const FriendActivityFeed = () => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Actividad de Amigos</Text>
      <TouchableOpacity>
        <Text style={styles.seeAllText}>Ver todos</Text>
      </TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {FRIENDS_ACTIVITY.map(friend => (
        <View key={friend.id} style={styles.friendCard}>
           <View style={styles.friendAvatarContainer}>
             <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
             <View style={styles.onlineIndicator} />
           </View>
           <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
           <Text style={styles.friendAction}>{friend.action}</Text>
           <Text style={styles.friendTitle} numberOfLines={1}>{friend.title}</Text>
           <Text style={styles.friendTime}>{friend.time}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const CollectionsList = () => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Colecciones</Text>
    </View>
    <FlatList 
      data={COLLECTIONS}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.collectionCard}>
           <ImageBackground source={{ uri: item.image }} style={styles.collectionImage} imageStyle={{ borderRadius: 16 }}>
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.collectionGradient}>
                 <Text style={styles.collectionTitle}>{item.title}</Text>
                 <Text style={styles.collectionCount}>{item.count} títulos</Text>
              </LinearGradient>
           </ImageBackground>
        </TouchableOpacity>
      )}
    />
  </View>
);

const HorizontalList = ({ title, data, onRate }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#A855F7" />
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mediaCard} activeOpacity={0.7}>
            <Image source={{ uri: item.image }} style={styles.poster} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.mediaOverlay}>
               <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
               <View style={{ marginTop: 4, alignSelf: 'center' }}>
                    <StarRating rating={item.rating} onRate={(r) => onRate(item.id, r)} size={12} />
               </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      />
    </View>
  );
};

const GridList = ({ data, onRate, width }) => {
    const itemWidth = (width - 40 - 16) / 2; // padding 20*2 + gap 16
    return (
        <View style={styles.gridContainer}>
            {data.map(item => (
                 <TouchableOpacity key={item.id} style={[styles.gridItem, { width: itemWidth }]} activeOpacity={0.7}>
                    <Image source={{ uri: item.image }} style={styles.gridPoster} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.mediaOverlay}>
                        <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={{ marginTop: 4, alignSelf: 'center' }}>
                             <StarRating rating={item.rating} onRate={(r) => onRate(item.id, r)} size={14} />
                        </View>
                    </LinearGradient>
                    <View style={{position: 'absolute', top: 8, right: 8}}>
                        <TypeBadge type={item.type} />
                    </View>
                 </TouchableOpacity>
            ))}
        </View>
    );
};

export default function EntertainmentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  // State
  const [items, setItems] = useState(INITIAL_WATCH_LIST);
  const [activeCategory, setActiveCategory] = useState('all');

  // Animation for Shake
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [suggestedItem, setSuggestedItem] = useState(null);

  // Derived
  const heroItems = useMemo(() => 
    items.filter(item => ['Viendo', 'Jugando', 'Leyendo'].includes(item.status)), 
  [items]);
  
  const displayHeroItems = heroItems.length > 0 ? heroItems : items.slice(0, 1);

  // Handlers
  const handleRate = (id, rating) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, rating } : item));
  };

  const handleRandomize = () => {
    const candidates = activeCategory === 'all' 
        ? items 
        : items.filter(i => i.type === activeCategory);
    
    if (candidates.length === 0) return;

    const random = candidates[Math.floor(Math.random() * candidates.length)];
    setSuggestedItem(random);

    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100x40/000000/A855F7?text=NETLIFE' }} 
          style={{ width: 80, height: 30, resizeMode: 'contain' }} 
        />
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- HERO CAROUSEL --- */}
        <View style={styles.heroContainer}>
          <Text style={styles.carouselLabel}>Viendo Ahora</Text>
          <FlatList
            data={displayHeroItems}
            renderItem={({ item }) => <HeroCard item={item} width={width} onRate={handleRate} />}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ gap: 0 }}
          />
        </View>

        {/* --- TABS --- */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {CATEGORIES.map(cat => {
                    const isSelected = activeCategory === cat.id;
                    return (
                        <TouchableOpacity 
                            key={cat.id} 
                            onPress={() => setActiveCategory(cat.id)}
                            style={[styles.tabItem, isSelected && styles.tabItemActive]}
                        >
                            <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{cat.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        {/* --- CONTENT --- */}
        {activeCategory === 'all' ? (
            <>
                {/* --- WRAPPED STATS --- */}
                <StatsBlock />

                {/* --- RANDOMIZER --- */}
                <View style={styles.randomContainer}>
                    <TouchableOpacity style={styles.randomButton} onPress={handleRandomize} activeOpacity={0.8}>
                        <LinearGradient
                        colors={['#A855F7', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.randomGradient}
                        >
                        <MaterialCommunityIcons name="dice-5" size={24} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.randomButtonText}>¿Qué veo hoy?</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {suggestedItem && (
                        <Animated.View style={[styles.suggestionCard, { transform: [{ translateX: shakeAnim }] }]}>
                        <Image source={{ uri: suggestedItem.image }} style={styles.suggestionImage} />
                        <View style={styles.suggestionInfo}>
                            <Text style={styles.suggestionLabel}>Sugerencia para ti</Text>
                            <Text style={styles.suggestionTitle}>{suggestedItem.title}</Text>
                            <TypeBadge type={suggestedItem.type} />
                        </View>
                        <TouchableOpacity style={styles.suggestionClose} onPress={() => setSuggestedItem(null)}>
                            <MaterialCommunityIcons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                {/* --- FRIEND ACTIVITY --- */}
                <FriendActivityFeed />

                {/* --- COLLECTIONS --- */}
                <CollectionsList />

                {/* --- CATEGORIES HORIZONTAL LISTS --- */}
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <HorizontalList 
                        key={cat.id} 
                        title={cat.label} 
                        data={items.filter(i => i.type === cat.id)} 
                        onRate={handleRate}
                    />
                ))}
            </>
        ) : (
            <View>
                <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginBottom: 16 }]}>
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </Text>
                <GridList 
                    data={items.filter(i => i.type === activeCategory)} 
                    onRate={handleRate}
                    width={width}
                />
            </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0716',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(15, 7, 22, 0.9)',
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // Hero
  heroContainer: {
    marginBottom: 20,
    paddingTop: 10,
  },
  carouselLabel: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heroCard: {
    height: 400,
    marginLeft: 20,
    marginRight: 0, 
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroGradient: {
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDesc: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  heroPlayText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  heroProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#A855F7',
    borderRadius: 2,
  },
  heroProgressText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
  },
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  seeAllText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaCard: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1B2E',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 8,
  },
  mediaTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    height: 160,
  },
  statCardLarge: {
    flex: 1.2,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLabelSmall: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Friend Activity
  friendCard: {
    width: 100,
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  friendAvatarContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E1B2E',
  },
  friendName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  friendAction: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 4,
  },
  friendTitle: {
    color: '#A855F7',
    fontWeight: '600',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  friendTime: {
    color: '#64748B',
    fontSize: 10,
  },
  // Collections
  collectionCard: {
    width: 220,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
  },
  collectionImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  collectionGradient: {
    padding: 12,
  },
  collectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  collectionCount: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  // Randomizer
  randomContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  randomButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  randomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  randomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#A855F7',
    alignItems: 'center',
  },
  suggestionImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
    gap: 4,
  },
  suggestionLabel: {
    color: '#A855F7',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionClose: {
    padding: 5,
  },
  // Tabs
  tabItem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  tabItemActive: {
      backgroundColor: '#A855F7',
      borderColor: '#A855F7',
  },
  tabText: {
      color: '#94A3B8',
      fontWeight: '600',
      fontSize: 14,
  },
  tabTextActive: {
      color: '#fff',
  },
  // Grid
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      gap: 16,
  },
  gridItem: {
      height: 240,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#1E1B2E',
      marginBottom: 8,
  },
  gridPoster: {
      width: '100%',
      height: '100%',
  }
});
