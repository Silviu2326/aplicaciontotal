import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  StatusBar,
  Alert,
  Platform,
  BackHandler
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChips from '../../components/calendar/FilterChips';

const { width } = Dimensions.get('window');

// --- DATA MOCK ---
const FOLDERS = [
  { id: '1', name: 'Identidad', count: 4, icon: 'card-account-details', color: '#3B82F6' },
  { id: '2', name: 'Finanzas', count: 12, icon: 'finance', color: '#10B981' },
  { id: '3', name: 'Médico', count: 8, icon: 'medical-bag', color: '#EF4444' },
  { id: '4', name: 'Contratos', count: 3, icon: 'file-sign', color: '#F59E0B' },
  { id: '5', name: 'Vivienda', count: 5, icon: 'home-city', color: '#8B5CF6' },
  { id: '6', name: 'Seguros', count: 2, icon: 'shield-check', color: '#EC4899' },
];

const TAGS = [
  { id: 'urgente', label: 'Urgente', color: '#EF4444' },
  { id: 'personal', label: 'Personal', color: '#3B82F6' },
  { id: 'trabajo', label: 'Trabajo', color: '#10B981' },
  { id: 'fiscal', label: 'Fiscal', color: '#F59E0B' },
];

// Enhanced Data with Folder Association
const ALL_FILES = [
  { id: 'f1', folderId: '1', name: 'DNI_Scan_Front.jpg', type: 'IMG', size: '2.4 MB', date: 'Hoy, 10:30', icon: 'image', tag: 'personal', color: '#3B82F6' },
  { id: 'f2', folderId: '5', name: 'Contrato_Alquiler_2024.pdf', type: 'PDF', size: '8.1 MB', date: 'Ayer, 14:20', icon: 'file-pdf-box', tag: 'vivienda', color: '#8B5CF6' },
  { id: 'f3', folderId: '2', name: 'Nomina_Octubre.pdf', type: 'PDF', size: '1.2 MB', date: '28 Oct', icon: 'file-pdf-box', tag: 'trabajo', color: '#10B981' },
  { id: 'f4', folderId: '6', name: 'Seguro_Coche_Poliza.pdf', type: 'PDF', size: '4.5 MB', date: '15 Oct', icon: 'file-pdf-box', tag: 'urgente', color: '#EF4444' },
  { id: 'f5', folderId: '1', name: 'Pasaporte_Page1.jpg', type: 'IMG', size: '3.1 MB', date: '10 Sep', icon: 'image', tag: 'personal', color: '#3B82F6' },
  { id: 'f6', folderId: '2', name: 'Factura_Luz_Oct.pdf', type: 'PDF', size: '0.8 MB', date: '05 Sep', icon: 'file-pdf-box', tag: 'fiscal', color: '#F59E0B' },
  // Extra files for demo navigation
  { id: 'f7', folderId: '3', name: 'Analisis_Sangre.pdf', type: 'PDF', size: '1.5 MB', date: '01 Ago', icon: 'file-pdf-box', tag: 'urgente', color: '#EF4444' },
  { id: 'f8', folderId: '4', name: 'Contrato_Trabajo.pdf', type: 'PDF', size: '5.2 MB', date: '20 Jul', icon: 'file-pdf-box', tag: 'trabajo', color: '#F59E0B' },
];

const PASSWORDS = [
  { id: 'p1', service: 'Google', username: 'usuario@gmail.com', pass: 'Goo123!@#', icon: 'google', color: '#DB4437' },
  { id: 'p2', service: 'Netflix', username: 'cine@home.com', pass: 'Movies2025', icon: 'netflix', color: '#E50914' },
  { id: 'p3', service: 'Spotify', username: 'music@life.com', pass: 'SoundWave99', icon: 'spotify', color: '#1DB954' },
];

const TWO_FACTOR_CODES = [
  { id: '2fa1', issuer: 'Amazon', account: 'user@amazon.com', icon: 'amazon', color: '#FF9900' },
  { id: '2fa2', issuer: 'GitHub', account: 'dev_master', icon: 'github', color: '#181717' },
];

const EMERGENCY_CONTACTS = [
  { id: 'ec1', name: 'Marta García', relation: 'Pareja', hasAccess: true, avatar: 'face-woman' },
  { id: 'ec2', name: 'Carlos Ruiz', relation: 'Hermano', hasAccess: false, avatar: 'face-man' },
];

// --- COMPONENTS ---

const PasswordRow = ({ item }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    Alert.alert('Copiado', `Contraseña de ${item.service} copiada al portapapeles.`);
  };

  return (
    <View style={styles.securityRow}>
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.securityInfo}>
        <Text style={styles.serviceName}>{item.service}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordText}>
          {isVisible ? item.pass : '•'.repeat(12)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.actionIcon}>
        <MaterialCommunityIcons name={isVisible ? "eye-off" : "eye"} size={20} color="#64748B" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCopy} style={styles.actionIcon}>
        <MaterialCommunityIcons name="content-copy" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

const TwoFactorRow = ({ item }) => {
  const [code, setCode] = useState('000 000');
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    // Simulate regenerating code and progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p <= 0) {
           // Regenerate code
           setCode(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
           return 30;
        }
        return p - 1;
      });
    }, 1000);
    
    // Initial code
    setCode(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.securityRow}>
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.securityInfo}>
        <Text style={styles.serviceName}>{item.issuer}</Text>
        <Text style={styles.codeText}>{code}</Text>
      </View>
      <View style={styles.timerContainer}>
         <View style={[styles.timerBar, { width: `${(progress / 30) * 100}%`, backgroundColor: progress < 5 ? '#EF4444' : '#10B981' }]} />
         <Text style={styles.timerText}>{progress}s</Text>
      </View>
    </View>
  );
};

const EmergencyContactRow = ({ item }) => {
  const [hasAccess, setHasAccess] = useState(item.hasAccess);

  return (
    <View style={styles.securityRow}>
      <View style={[styles.serviceIcon, { backgroundColor: '#F1F5F9' }]}>
        <MaterialCommunityIcons name={item.avatar} size={24} color="#64748B" />
      </View>
      <View style={styles.securityInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.username}>{item.relation}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.accessBadge, { backgroundColor: hasAccess ? '#DCFCE7' : '#F1F5F9' }]}
        onPress={() => setHasAccess(!hasAccess)}
      >
        <Text style={[styles.accessText, { color: hasAccess ? '#166534' : '#64748B' }]}>
            {hasAccess ? 'Acceso Activo' : 'Revocado'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const PinKeypad = ({ onUnlock, isLocked }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('idle'); // idle, success, error
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockIconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLocked) {
        setPin('');
        setStatus('idle');
    }
  }, [isLocked]);

  const handlePress = (num) => {
    if (pin.length < 4 && status !== 'success') {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
           setStatus('success');
           animateSuccess();
           setTimeout(() => onUnlock(), 600);
        } else {
           setStatus('error');
           shake();
           setTimeout(() => {
               setPin('');
               setStatus('idle');
           }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (status !== 'success') setPin(prev => prev.slice(0, -1));
  };

  const animateSuccess = () => {
      Animated.sequence([
          Animated.timing(lockIconScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.timing(lockIconScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
          Animated.spring(lockIconScale, { toValue: 1, friction: 4, useNativeDriver: true })
      ]).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const renderDot = (index) => (
    <View style={[
      styles.pinDot, 
      pin.length > index && styles.pinDotFilled,
      status === 'success' && styles.pinDotSuccess,
      status === 'error' && styles.pinDotError
    ]} />
  );

  return (
    <View style={styles.lockContent}>
      <Animated.View style={[
          styles.lockIconContainer, 
          { transform: [{ scale: lockIconScale }] },
          status === 'success' && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' }
      ]}>
        <MaterialCommunityIcons 
            name={status === 'success' ? "lock-open-variant" : "shield-lock"} 
            size={64} 
            color={status === 'success' ? "#10B981" : "#fff"} 
        />
      </Animated.View>
      
      <Text style={styles.lockTitle}>
          {status === 'success' ? 'Desbloqueado' : 'Caja Fuerte'}
      </Text>
      <Text style={styles.lockSubtitle}>
          {status === 'error' ? 'PIN Incorrecto' : 'Introduce tu PIN de seguridad'}
      </Text>
      
      <Animated.View style={[styles.pinDisplay, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => renderDot(i))}
      </Animated.View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity 
            key={num} 
            style={styles.key} 
            onPress={() => handlePress(num.toString())}
            activeOpacity={0.7}
          >
             <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.key} /> 
        <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
           <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleDelete}>
           <MaterialCommunityIcons name="backspace-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={{ marginTop: 30 }}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>¿Olvidaste tu PIN?</Text>
      </TouchableOpacity>
    </View>
  );
};

const FolderCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.folderCard} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.folderIconInfo, { backgroundColor: item.color + '15' }]}>
      <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
    </View>
    <View>
      <Text style={styles.folderName}>{item.name}</Text>
      <Text style={styles.folderCount}>{item.count} archivos</Text>
    </View>
    <MaterialCommunityIcons 
      name="folder" 
      size={60} 
      color={item.color} 
      style={styles.folderWatermark} 
    />
  </TouchableOpacity>
);

const FilePreviewRow = ({ item }) => (
  <TouchableOpacity style={styles.fileRow} activeOpacity={0.7} onPress={() => Alert.alert('Archivo', `Visualizando ${item.name}`)}>
    {/* Preview Placeholder */}
    <View style={[styles.filePreview, { backgroundColor: item.color + '20' }]}>
       <Text style={[styles.fileType, { color: item.color }]}>{item.type}</Text>
       <View style={[styles.fileCorner, { borderTopColor: item.color + '40', borderRightColor: item.color + '40' }]} />
    </View>
    
    <View style={styles.fileInfo}>
      <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.fileMetaRow}>
          <View style={[styles.tagDot, { backgroundColor: item.color }]} />
          <Text style={styles.fileMeta}>{item.size} • {item.date}</Text>
      </View>
    </View>
    
    <TouchableOpacity style={styles.moreBtn}>
      <MaterialCommunityIcons name="dots-vertical" size={20} color="#94A3B8" />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function VaultScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isLocked, setIsLocked] = useState(true);
  const [activeTag, setActiveTag] = useState('all');
  const [currentFolder, setCurrentFolder] = useState(null); // State for folder navigation
  
  // Animations
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isLocked) {
        lockOpacity.setValue(1);
        contentScale.setValue(0.95);
        setCurrentFolder(null); // Reset folder navigation on lock
    }
  }, [isLocked]);

  // Handle Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (isLocked) {
        // Allow default behavior (exit app or go back depending on nav stack) 
        // OR prevent going back if we want to force PIN to exit (usually bad UX).
        // Here we let normal nav happen if locked, but usually we want to prevent bypassing lock?
        // Since the lock overlay is full screen, standard nav back pops the screen.
        // Let's handle the case where we are UNLOCKED and inside a FOLDER.
        return false; 
      }

      if (currentFolder) {
        setCurrentFolder(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [currentFolder, isLocked]);

  const handleUnlock = () => {
      Animated.parallel([
          Animated.timing(lockOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true
          }),
          Animated.spring(contentScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true
          })
      ]).start(() => setIsLocked(false));
  };

  const handleFolderPress = (folder) => {
      setCurrentFolder(folder);
  };

  const handleBack = () => {
      if (currentFolder) {
          setCurrentFolder(null);
      } else {
          navigation.goBack();
      }
  };

  // Filter Logic
  const getFilteredFiles = () => {
    let files = ALL_FILES;

    // 1. Filter by Folder vs Root
    if (currentFolder) {
        files = files.filter(f => f.folderId === currentFolder.id);
    } else {
        // At root, show only "Recent" or unorganized files? 
        // Strategy: Show everything for now, or maybe just filtered by tag if at root
        // To mimic "Recent Files" in root, we can just show all sorted by date.
        // Let's keep the 'activeTag' filter applying to whatever view we are in.
    }

    // 2. Filter by Tag (if not 'all')
    if (activeTag !== 'all') {
        files = files.filter(f => f.tag === activeTag);
    }

    return files;
  };

  const filteredFiles = getFilteredFiles();

  // Dynamic Header Title
  const headerTitle = currentFolder ? currentFolder.name : 'Caja Fuerte';
  const headerIcon = currentFolder ? currentFolder.icon : 'shield-lock';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLocked ? "light-content" : "dark-content"} />
      
      {/* --- MAIN CONTENT --- */}
      <Animated.View style={[
          styles.mainContent, 
          { 
              transform: [{ scale: contentScale }],
              opacity: lockOpacity.interpolate({
                  inputRange: [0, 0.8],
                  outputRange: [1, 0.3]
              })
          }
      ]}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                 {currentFolder && (
                     <MaterialCommunityIcons name={headerIcon} size={20} color={currentFolder.color} style={{ marginRight: 8 }} />
                 )}
                 <Text style={styles.headerTitle}>{headerTitle}</Text>
              </View>

              <TouchableOpacity 
                style={styles.lockAction} 
                onPress={() => setIsLocked(true)}
              >
                <MaterialCommunityIcons name="lock-outline" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
                <Text style={styles.searchPlaceholder}>
                    {currentFolder ? `Buscar en ${currentFolder.name}...` : 'Buscar documentos protegidos...'}
                </Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.contentScroll} 
            showsVerticalScrollIndicator={false}
          >
            {/* CONDITIONAL CONTENT: Root vs Folder View */}
            
            {!currentFolder ? (
                /* --- ROOT VIEW --- */
                <>
                    {/* Folders Grid */}
                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categorías</Text>
                    <View style={styles.grid}>
                        {FOLDERS.map(folder => (
                        <FolderCard 
                            key={folder.id} 
                            item={folder} 
                            onPress={() => handleFolderPress(folder)}
                        />
                        ))}
                    </View>
                    </View>

                    {/* Tags Filter (Global) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Archivos Recientes</Text>
                        <FilterChips 
                            filters={TAGS}
                            activeFilter={activeTag}
                            onFilterPress={setActiveTag}
                        />
                    </View>
                </>
            ) : (
                /* --- FOLDER VIEW --- */
                <View style={styles.section}>
                    <View style={styles.folderHeaderStats}>
                        <Text style={styles.sectionTitle}>Archivos</Text>
                        <Text style={styles.folderFileCount}>{filteredFiles.length} elementos</Text>
                    </View>
                    {/* In folder view, maybe we want tags too? Optional. Let's keep it for powerful filtering */}
                    <FilterChips 
                        filters={TAGS}
                        activeFilter={activeTag}
                        onFilterPress={setActiveTag}
                    />
                </View>
            )}

            {/* Files List (Dynamic based on context) */}
            <View style={styles.filesList}>
                {filteredFiles.length > 0 ? (
                    filteredFiles.map((file, index) => (
                    <React.Fragment key={file.id}>
                        <FilePreviewRow item={file} />
                        {index < filteredFiles.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="file-search-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No se encontraron archivos</Text>
                        {activeTag !== 'all' && <Text style={styles.emptySubtext}>Prueba a cambiar el filtro</Text>}
                    </View>
                )}
            </View>

            {/* Only show other sections at Root to keep folder view clean? 
                Or maybe "Passwords" is a folder itself conceptually? 
                For now, let's keep Passwords/2FA/Emergency only at ROOT. 
            */}
            {!currentFolder && (
                <>
                    {/* --- PASSWORD MANAGER SECTION --- */}
                    <View style={[styles.section, { marginTop: 24 }]}>
                        <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Gestor de Contraseñas</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver todo</Text>
                        </TouchableOpacity>
                        </View>
                        <View style={styles.cardContainer}>
                            {PASSWORDS.map((pass, index) => (
                                <React.Fragment key={pass.id}>
                                    <PasswordRow item={pass} />
                                    {index < PASSWORDS.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>

                    {/* --- 2FA CODES SECTION --- */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Códigos 2FA</Text>
                        <View style={styles.cardContainer}>
                            {TWO_FACTOR_CODES.map((code, index) => (
                                <React.Fragment key={code.id}>
                                    <TwoFactorRow item={code} />
                                    {index < TWO_FACTOR_CODES.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>

                    {/* --- EMERGENCY ACCESS SECTION --- */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Acceso de Emergencia</Text>
                        <Text style={styles.sectionSubtitle}>Personas de confianza que pueden solicitar acceso.</Text>
                        <View style={styles.cardContainer}>
                            {EMERGENCY_CONTACTS.map((contact, index) => (
                                <React.Fragment key={contact.id}>
                                    <EmergencyContactRow item={contact} />
                                    {index < EMERGENCY_CONTACTS.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                </>
            )}

            {/* Cloud Sync Status */}
            <View style={[styles.syncCard, { marginTop: 24 }]}>
              <View style={styles.syncIcon}>
                  <MaterialCommunityIcons name="cloud-check" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>Encriptado & Sincronizado</Text>
                <Text style={styles.syncDesc}>Tus documentos están seguros con cifrado AES-256</Text>
              </View>
            </View>
            
            <View style={{ height: 80 }} />
          </ScrollView>
      </Animated.View>

      {/* FAB - Only show in Folder view or Root? Maybe both. */}
      {!isLocked && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => Alert.alert('Subir', `Añadir documento a ${currentFolder ? currentFolder.name : 'Caja Fuerte'}`)}
          >
            <MaterialCommunityIcons name="plus" size={30} color="#fff" />
          </TouchableOpacity>
      )}

      {/* --- LOCK OVERLAY --- */}
      {(isLocked || lockOpacity._value > 0) && (
          <Animated.View 
            style={[
                styles.lockOverlay, 
                { 
                    opacity: lockOpacity,
                    pointerEvents: isLocked ? 'auto' : 'none' 
                } 
            ]}
          >
             {/* Background visual effect */}
             <View style={styles.lockBackground} />
             
             <TouchableOpacity 
                style={[styles.closeButton, { top: insets.top + 10 }]} 
                onPress={() => navigation.goBack()}
             >
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
             </TouchableOpacity>
             
             <PinKeypad onUnlock={handleUnlock} isLocked={isLocked} />
          </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
      flex: 1,
      backgroundColor: '#F8FAFC',
  },
  
  // --- SECURITY ROWS STYLES ---
  securityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
  },
  serviceIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  securityInfo: {
      flex: 1,
  },
  serviceName: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1E293B',
  },
  username: {
      fontSize: 12,
      color: '#64748B',
  },
  passwordContainer: {
      marginRight: 10,
  },
  passwordText: {
      fontSize: 14,
      color: '#334155',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      letterSpacing: 1,
  },
  actionIcon: {
      padding: 8,
  },
  sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  seeAllText: {
      fontSize: 14,
      color: '#3B82F6',
      fontWeight: '600',
  },
  cardContainer: {
      backgroundColor: '#fff',
      borderRadius: 20,
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
  },
  sectionSubtitle: {
      fontSize: 13,
      color: '#64748B',
      marginBottom: 12,
      marginTop: -8,
  },
  
  // 2FA Specific
  codeText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1E293B',
      letterSpacing: 2,
  },
  timerContainer: {
      width: 60,
      alignItems: 'flex-end',
  },
  timerBar: {
      height: 4,
      borderRadius: 2,
      marginBottom: 4,
  },
  timerText: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '600',
  },

  // Emergency Contact Specific
  accessBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
  },
  accessText: {
      fontSize: 11,
      fontWeight: '700',
  },
  
  // --- LOCK SCREEN ---
  lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 100,
      justifyContent: 'center',
      alignItems: 'center',
  },
  lockBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.97)', // Deep Slate almost opaque
  },
  lockContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    zIndex: 110,
    padding: 10,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 50,
    gap: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pinDotSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  pinDotError: {
      borderColor: '#EF4444',
      backgroundColor: '#EF4444',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    gap: 20,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  
  // --- HEADER & SEARCH ---
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  lockAction: {
    padding: 8,
    marginRight: -8,
  },
  headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainer: {
      backgroundColor: '#F1F5F9',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
  },
  searchPlaceholder: {
      marginLeft: 10,
      color: '#94A3B8',
      fontSize: 14,
  },

  // --- CONTENT ---
  contentScroll: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  folderHeaderStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  folderFileCount: {
      fontSize: 14,
      color: '#64748B',
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  folderCard: {
    width: (width - 40 - 16) / 2,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  folderIconInfo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  folderWatermark: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.05,
    transform: [{ rotate: '-15deg' }],
  },

  // File List
  filesList: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  // New File Preview Style
  filePreview: {
      width: 48,
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      position: 'relative',
      overflow: 'hidden',
  },
  fileType: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
  },
  fileCorner: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 0,
      height: 0,
      backgroundColor: '#fff',
      borderStyle: 'solid',
      borderRightWidth: 12,
      borderTopWidth: 12,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderLeftColor: 'transparent',
      borderBottomColor: 'transparent',
      transform: [{rotate: '90deg'}]
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  fileMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  tagDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
  },
  fileMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  moreBtn: {
      padding: 8,
  },
  emptyState: {
      padding: 40,
      alignItems: 'center',
  },
  emptyText: {
      color: '#64748B',
      fontWeight: '600',
      marginTop: 12,
  },
  emptySubtext: {
      color: '#94A3B8',
      marginTop: 4,
  },

  // Sync Card
  syncCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  syncIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  syncTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  syncDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  oldString: {
    // Just to be safe, I will use expected_replacements: 1 and this field is required by the tool even for full file rewrite if I use replace tool.
    // But wait, replace tool logic: "Old string must match exactly".
    // Since I am replacing the whole file content, I should match the whole file content.
    // However, if the file is large, matching the whole file content in 'old_string' is error prone.
    // I should use 'write_file' instead if I want to overwrite the whole file.
  }
});