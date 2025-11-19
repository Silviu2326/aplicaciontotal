import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  Animated,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#F97316'; // Orange

// --- MOCK DATA ---

const INITIAL_WISHLIST_ITEMS = [
  { id: '1', name: 'Monitor Ultrawide 34"', price: 450.00, priority: 'Alta', image: 'monitor', category: 'Tech', history: [480, 475, 460, 450, 450, 445] },
  { id: '2', name: 'Silla Ergonomica', price: 320.50, priority: 'Media', image: 'chair-rolling', category: 'Hogar', history: [310, 315, 320, 320.50, 325, 320.50] },
  { id: '3', name: 'Teclado Mecánico', price: 120.00, priority: 'Baja', image: 'keyboard', category: 'Tech', history: [130, 125, 120, 120, 115, 120] },
  { id: '4', name: 'Libros de Diseño', price: 45.90, priority: 'Media', image: 'book-open-variant', category: 'Libros', history: [45.90, 45.90, 45.90, 45.90, 45.90, 45.90] },
];

const INITIAL_GROCERIES = [
  { id: 'g1', name: 'Leche de Avena', checked: false, price: 1.50, category: 'Supermercado' },
  { id: 'g2', name: 'Huevos Camperos', checked: true, price: 2.20, category: 'Supermercado' },
  { id: 'g3', name: 'Pan Integral', checked: false, price: 1.10, category: 'Supermercado' },
  { id: 'g4', name: 'Pechuga de Pollo', checked: false, price: 5.50, category: 'Supermercado' },
  { id: 'g5', name: 'Aguacates (3)', checked: false, price: 3.00, category: 'Supermercado' },
];

const SHIPMENTS = [
  { id: 's1', name: 'Amazon - Funda iPhone', status: 'En tránsito', eta: 'Mañana, 14:00', carrier: 'DHL', icon: 'truck-delivery' },
  { id: 's2', name: 'Zara - Pedido #4021', status: 'Entregado', eta: 'Ayer', carrier: 'Correos', icon: 'package-variant' },
];

const LOYALTY_CARDS = [
    { id: 'c1', store: 'Carrefour', code: '84930210', color: '#2563EB', icon: 'cart' },
    { id: 'c2', store: 'IKEA Family', code: '11223344', color: '#F59E0B', icon: 'home-variant' },
    { id: 'c3', store: 'Decathlon', code: '99887766', color: '#0284C7', icon: 'basketball' },
];

const COUPONS = [
    { id: 'cp1', store: 'Nike Store', discount: '-20%', code: 'JUSTDOIT20', expiry: '2 días' },
    { id: 'cp2', store: 'Uber Eats', discount: '€5 OFF', code: 'YUMMY5', expiry: '5 horas' },
    { id: 'cp3', store: 'Fnac', discount: 'Envío Gratis', code: 'LIBROS24', expiry: '1 semana' },
];

const CATEGORIES = ['Todos', 'Supermercado', 'Tech', 'Hogar', 'Libros'];

// --- COMPONENTS ---

const CategoryFilter = ({ categories, activeCategory, onSelect }) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false} 
    contentContainerStyle={styles.filterContainer}
  >
    {categories.map(cat => (
      <TouchableOpacity 
        key={cat} 
        style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
        onPress={() => onSelect(cat)}
      >
        <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
          {cat}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const PriceTag = ({ price }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle swaying animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.priceTag, { transform: [{ rotate }] }]}>
      <View style={styles.priceTagHole} />
      <Text style={styles.priceTagText}>€{price.toFixed(2)}</Text>
    </Animated.View>
  );
};

const PriorityTag = ({ priority }) => {
  let color = '#94A3B8';
  let bg = '#F1F5F9';
  
  if (priority === 'Alta') {
    color = '#EF4444';
    bg = '#FEF2F2';
  } else if (priority === 'Media') {
    color = '#F59E0B';
    bg = '#FFFBEB';
  } else if (priority === 'Baja') {
    color = '#10B981';
    bg = '#ECFDF5';
  }

  return (
    <View style={[styles.priorityTag, { backgroundColor: bg }]}>
      <Text style={[styles.priorityText, { color: color }]}>{priority}</Text>
    </View>
  );
};

const WishlistItem = ({ item, onAddToCart }) => (
  <TouchableOpacity style={styles.wishlistCard} activeOpacity={0.9}>
    <View style={styles.wishlistImageContainer}>
      <MaterialCommunityIcons name={item.image || 'gift'} size={40} color={THEME_COLOR} />
    </View>
    <View style={styles.wishlistContent}>
      <View style={styles.wishlistHeader}>
        <Text style={styles.wishlistCategory}>{item.category}</Text>
        <PriorityTag priority={item.priority || 'Media'} />
      </View>
      <Text style={styles.wishlistTitle} numberOfLines={2}>{item.name}</Text>
      
      <View style={styles.priceTagWrapper}>
         <PriceTag price={item.price} />
      </View>
      
      {/* Price History Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: item.history && item.history.length > 0 ? item.history : [item.price, item.price] }]
          }}
          width={120}
          height={30}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            fillShadowGradient: (item.history && item.history[item.history.length-1] < item.history[0]) ? '#10B981' : '#EF4444',
            fillShadowGradientOpacity: 0.3,
            color: (opacity = 1) => (item.history && item.history[item.history.length-1] < item.history[0]) ? `rgba(16, 185, 129, ${opacity})` : `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2,
            propsForBackgroundLines: { strokeWidth: 0 }
          }}
          bezier
          style={{ paddingRight: 0, paddingLeft: 0 }}
        />
      </View>
    </View>
    <TouchableOpacity 
      style={styles.addButton} 
      onPress={() => onAddToCart(item)}
    >
      <MaterialCommunityIcons name="cart-arrow-down" size={18} color="#fff" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const GroceryItem = ({ item, onToggle, onMoveToWishlist }) => (
  <TouchableOpacity 
    style={styles.groceryRow} 
    onPress={() => onToggle(item.id)}
    onLongPress={() => onMoveToWishlist(item)}
    delayLongPress={500}
    activeOpacity={0.7}
  >
    <View style={styles.groceryCheckContainer}>
        <MaterialCommunityIcons 
        name={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'} 
        size={24} 
        color={item.checked ? '#10B981' : '#CBD5E1'} 
        />
    </View>
    <View style={styles.groceryInfo}>
        <Text style={[styles.groceryText, item.checked && styles.groceryTextChecked]}>
        {item.name}
        </Text>
        <Text style={[styles.groceryPrice, item.checked && styles.groceryTextChecked]}>
          €{item.price.toFixed(2)}
        </Text>
    </View>
  </TouchableOpacity>
);

const ShipmentItem = ({ item }) => {
  const isDelivered = item.status === 'Entregado';
  return (
    <View style={styles.shipmentCard}>
      <View style={[styles.shipmentIcon, { backgroundColor: isDelivered ? '#ECFDF5' : '#FFF7ED' }]}>
        <MaterialCommunityIcons 
          name={isDelivered ? 'check-bold' : 'truck-fast'} 
          size={24} 
          color={isDelivered ? '#10B981' : '#F97316'} 
        />
      </View>
      <View style={styles.shipmentContent}>
        <Text style={styles.shipmentName}>{item.name}</Text>
        <Text style={styles.shipmentCarrier}>{item.carrier} • {item.eta}</Text>
      </View>
      <View style={[styles.statusBadge, isDelivered ? styles.statusDelivered : styles.statusTransit]}>
        <Text style={[styles.statusText, isDelivered ? {color: '#10B981'} : {color: '#F97316'}]}>
          {item.status}
        </Text>
      </View>
    </View>
  );
};

const LoyaltyCard = ({ card }) => (
    <View style={[styles.loyaltyCard, { backgroundColor: card.color }]}>
        <View style={styles.loyaltyHeader}>
            <MaterialCommunityIcons name={card.icon} size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.loyaltyStore}>{card.store}</Text>
        </View>
        <View style={styles.barcodeContainer}>
             {/* Simulated Barcode */}
            {[...Array(25)].map((_, i) => (
                <View key={i} style={{ width: Math.random() > 0.5 ? 2 : 4, height: 24, backgroundColor: '#0F172A', marginHorizontal: 1, opacity: 0.8 }} />
            ))}
        </View>
        <Text style={styles.loyaltyCode}>{card.code}</Text>
    </View>
);

const CouponItem = ({ coupon }) => (
    <View style={styles.couponCard}>
        <View style={styles.couponLeft}>
            <Text style={styles.couponDiscount}>{coupon.discount}</Text>
            <Text style={styles.couponStore}>{coupon.store}</Text>
        </View>
        <View style={styles.couponDivider}>
            <View style={[styles.notch, { top: -10 }]} />
            <View style={[styles.dashedLine]} />
            <View style={[styles.notch, { bottom: -10 }]} />
        </View>
        <View style={styles.couponRight}>
            <Text style={styles.couponCode}>{coupon.code}</Text>
            <Text style={styles.couponExpiry}>Exp: {coupon.expiry}</Text>
        </View>
    </View>
);

const TotalBar = ({ totalPending, totalInCart, itemCount }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.totalBar, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Por Pagar (Pendiente)</Text>
                <Text style={styles.totalValue}>€{totalPending.toFixed(2)}</Text>
                <Text style={styles.itemCount}>En carro: €{totalInCart.toFixed(2)} • {itemCount} items</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={() => Alert.alert('Checkout', 'Iniciando proceso de compra...')}>
                <Text style={styles.checkoutText}>Comprar</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default function ShoppingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [groceries, setGroceries] = useState(INITIAL_GROCERIES);
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST_ITEMS);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const toggleGrocery = (id) => {
    setGroceries(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addToCart = (item) => {
      setWishlist(prev => prev.filter(w => w.id !== item.id));
      setGroceries(prev => [
          ...prev, 
          { 
              id: `moved-${item.id}`, 
              name: item.name, 
              checked: false, 
              price: item.price,
              category: item.category || 'Supermercado' 
          }
      ]);
      Alert.alert('Añadido', `${item.name} movido a la lista de compra.`);
  };

  const moveToWishlist = (item) => {
      Alert.alert(
        'Mover a Wishlist',
        `¿Quieres devolver "${item.name}" a tu lista de deseos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Mover',
            onPress: () => {
              setGroceries(prev => prev.filter(g => g.id !== item.id));
              setWishlist(prev => [...prev, {
                  id: item.id.startsWith('moved-') ? item.id.replace('moved-', '') : `return-${item.id}`,
                  name: item.name,
                  price: item.price,
                  priority: 'Media',
                  image: 'basket-outline', // Generic icon
                  category: item.category || 'Supermercado',
                  history: [item.price, item.price]
              }]);
            }
          }
        ]
      );
  };

  // Calculations
  const filteredGroceries = activeCategory === 'Todos' 
    ? groceries 
    : groceries.filter(g => g.category === activeCategory);
    
  const filteredWishlist = activeCategory === 'Todos'
    ? wishlist
    : wishlist.filter(w => w.category === activeCategory);

  const totalPending = filteredGroceries
    .filter(g => !g.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const totalInCart = filteredGroceries
    .filter(g => g.checked)
    .reduce((sum, item) => sum + item.price, 0);
    
  const wishlistTotal = filteredWishlist.reduce((sum, item) => sum + item.price, 0);
  
  const totalItems = filteredGroceries.length;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Shopping & Wishlist</Text>
      <TouchableOpacity style={styles.menuButton} onPress={() => Alert.alert('Opciones', 'Configuración de listas')}>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#1E293B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.bgHeader, { height: insets.top + 60 }]} />
      
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        {renderHeader()}
        
        <View style={{ paddingBottom: 10 }}>
           <CategoryFilter 
             categories={CATEGORIES} 
             activeCategory={activeCategory} 
             onSelect={setActiveCategory} 
           />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} 
        >
          {/* Wishlist Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Mi Wishlist</Text>
                <Text style={styles.sectionSubtitle}>Total: €{wishlistTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Nuevo Item', 'Añadir a wishlist')}>
                <Text style={styles.seeAll}>+ Añadir</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wishlistScroll}
            >
              {filteredWishlist.length > 0 ? (
                 filteredWishlist.map(item => (
                    <WishlistItem key={item.id} item={item} onAddToCart={addToCart} />
                 ))
              ) : (
                  <Text style={styles.emptyText}>
                    {activeCategory === 'Todos' ? 'Tu wishlist está vacía.' : `No hay items en ${activeCategory}`}
                  </Text>
              )}
            </ScrollView>
          </View>

          {/* Card Wallet Section */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cartera de Fidelidad</Text>
                <TouchableOpacity onPress={() => Alert.alert('Wallet', 'Añadir tarjeta')}>
                    <MaterialCommunityIcons name="card-plus" size={20} color={THEME_COLOR} />
                </TouchableOpacity>
             </View>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wishlistScroll}>
                 {LOYALTY_CARDS.map(card => (
                     <LoyaltyCard key={card.id} card={card} />
                 ))}
             </ScrollView>
          </View>

          {/* Shopping Lists Split */}
          <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Lista de Compra</Text>
                    <Text style={styles.sectionSubtitle}>Mantén pulsado para devolver</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Lista', 'Gestionar listas')}>
                  <MaterialCommunityIcons name="playlist-edit" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.card}>
                <View style={styles.bgIconContainer}>
                    <MaterialCommunityIcons name="cart-variant" size={120} color="#F1F5F9" />
                </View>

                {filteredGroceries.length > 0 ? (
                    filteredGroceries.map((item) => (
                    <GroceryItem 
                        key={item.id} 
                        item={item} 
                        onToggle={toggleGrocery} 
                        onMoveToWishlist={moveToWishlist}
                    />
                    ))
                ) : (
                    <Text style={styles.emptyText}>Lista de compra vacía.</Text>
                )}
                
                <TouchableOpacity style={styles.addItemRow} onPress={() => Alert.alert('Añadir', 'Añadir producto')}>
                   <MaterialCommunityIcons name="plus" size={16} color={THEME_COLOR} />
                   <Text style={styles.addItemText}>Añadir item manual</Text>
                </TouchableOpacity>
              </View>
          </View>

          {/* Coupons Section */}
          <View style={styles.section}>
              <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cupones Activos</Text>
              </View>
              {COUPONS.map(coupon => (
                  <CouponItem key={coupon.id} coupon={coupon} />
              ))}
          </View>

          {/* Shipments Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Envíos Activos</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.bgIconContainer}>
                    <MaterialCommunityIcons name="truck-fast-outline" size={100} color="#F1F5F9" />
              </View>
              {SHIPMENTS.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ShipmentItem item={item} />
                  {index < SHIPMENTS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

        </ScrollView>

        <TotalBar 
            totalPending={totalPending} 
            totalInCart={totalInCart} 
            itemCount={totalItems} 
        />
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
  // Filters
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: THEME_COLOR,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
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
  sectionSubtitle: {
      fontSize: 12,
      color: '#94A3B8',
      marginTop: 2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden', 
  },
  bgIconContainer: {
      position: 'absolute',
      right: -20,
      bottom: -20,
      zIndex: -1,
      opacity: 0.5,
  },
  // Wishlist
  wishlistScroll: {
    paddingRight: 20,
  },
  wishlistCard: {
    width: 170, 
    height: 280, 
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 16,
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'space-between',
  },
  wishlistImageContainer: {
    height: 70,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  wishlistContent: {
    flex: 1,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wishlistCategory: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  wishlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 18,
  },
  chartContainer: {
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 8,
    alignItems: 'center', 
  },
  // Price Tag
  priceTagWrapper: {
      alignItems: 'flex-start',
      marginTop: 4,
  },
  priceTag: {
      backgroundColor: '#FEF3C7', 
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderTopLeftRadius: 0, 
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: -5, 
  },
  priceTagHole: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#fff',
      position: 'absolute',
      top: 2,
      alignSelf: 'center',
  },
  priceTagText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#B45309',
      marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: THEME_COLOR,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  // Loyalty Cards
  loyaltyCard: {
      width: 200,
      height: 120,
      borderRadius: 16,
      marginRight: 16,
      padding: 16,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
  },
  loyaltyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  loyaltyStore: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
      marginLeft: 8,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
  },
  barcodeContainer: {
      height: 30,
      backgroundColor: '#fff',
      borderRadius: 4,
      padding: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
  },
  loyaltyCode: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      alignSelf: 'center',
      letterSpacing: 2,
  },
  // Coupons
  couponCard: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      height: 80,
  },
  couponLeft: {
      flex: 1,
      padding: 12,
      justifyContent: 'center',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
  },
  couponDiscount: {
      fontSize: 18,
      fontWeight: '800',
      color: THEME_COLOR,
  },
  couponStore: {
      fontSize: 12,
      color: '#64748B',
      marginTop: 2,
  },
  couponDivider: {
      width: 1,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
  },
  dashedLine: {
      height: '80%',
      width: 1,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderStyle: 'dashed',
  },
  notch: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#F8FAFC',
      position: 'absolute',
      left: -10,
  },
  couponRight: {
      width: 100,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#FFF7ED',
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
  },
  couponCode: {
      fontSize: 12,
      fontWeight: '700',
      color: '#B45309',
      borderWidth: 1,
      borderColor: '#FDBA74',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderStyle: 'dashed',
      marginBottom: 4,
  },
  couponExpiry: {
      fontSize: 10,
      color: '#94A3B8',
  },

  // Grocery
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  groceryCheckContainer: {
      marginRight: 12,
  },
  groceryInfo: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  groceryText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  groceryTextChecked: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  groceryPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: '#64748B',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: '600',
  },
  // Shipments
  shipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shipmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shipmentContent: {
    flex: 1,
  },
  shipmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  shipmentCarrier: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTransit: {
    backgroundColor: '#FFF7ED',
  },
  statusDelivered: {
    backgroundColor: '#ECFDF5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  emptyText: {
      color: '#94A3B8',
      fontStyle: 'italic',
      padding: 10,
  },
  // Total Bar
  totalBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      paddingTop: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 10,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
  },
  totalInfo: {
      justifyContent: 'center',
  },
  totalLabel: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '500',
  },
  totalValue: {
      fontSize: 24,
      color: '#0F172A',
      fontWeight: '700',
  },
  itemCount: {
      fontSize: 11,
      color: '#94A3B8',
  },
  checkoutButton: {
      backgroundColor: '#0F172A',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  },
  checkoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
  },
});
