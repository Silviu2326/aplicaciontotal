import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colores de sección para mantener consistencia visual
const SECTION_COLORS = {
  account: '#E3F2FD', // Blue
  general: '#F3E5F5', // Purple
  appearance: '#FFF3E0', // Orange
  notifications: '#E8F5E9', // Green
  data: '#E0F7FA', // Cyan
  support: '#FFEBEE', // Red
};

// Componente reutilizable para filas de configuración
const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  type = 'link', // link, switch, value, danger
  value,
  onValueChange,
  rightText,
  color = '#555',
  isLast = false
}) => (
  <TouchableOpacity 
    style={[styles.itemContainer, isLast && styles.lastItem]} 
    onPress={type === 'switch' ? () => onValueChange(!value) : onPress}
    activeOpacity={type === 'switch' ? 1 : 0.7}
    disabled={type === 'info'}
  >
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.itemContent}>
      <Text style={[styles.itemTitle, type === 'danger' && styles.dangerText]}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    
    {/* Renderizado condicional según el tipo de item */}
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: color }}
        thumbColor={'#fff'}
      />
    )}
    
    {type === 'value' && (
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{rightText}</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </View>
    )}
    
    {type === 'link' && (
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    )}
  </TouchableOpacity>
);

// Componente para el título de la sección
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

export default function ProfileScreen() {
  // Estados para switches y valores (simulación)
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handlePress = (action) => {
    // Aquí iría la navegación real
    console.log(`Pressed: ${action}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER PREMIUM */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=68' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Alex Developer</Text>
            <Text style={styles.userHandle}>@alexdev • Nivel 12</Text>
            <View style={styles.badgesContainer}>
              <View style={styles.proBadge}>
                <Ionicons name="star" size={10} color="#fff" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={10} color="#FF5722" />
                <Text style={styles.streakText}>15 días racha</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* MEMBRESÍA */}
      <TouchableOpacity style={styles.premiumCard}>
        <View style={styles.premiumContent}>
          <View>
            <Text style={styles.premiumTitle}>Plan Premium Activo</Text>
            <Text style={styles.premiumSubtitle}>Próxima renovación: 12 Oct 2025</Text>
          </View>
          <Ionicons name="diamond" size={28} color="#FFD700" />
        </View>
      </TouchableOpacity>

      {/* 1. CUENTA Y SEGURIDAD */}
      <SectionHeader title="Cuenta" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="person-outline" 
          title="Editar Perfil" 
          subtitle="Nombre, Bio, Foto"
          color="#1976D2"
          onPress={() => handlePress('edit_profile')}
        />
        <SettingItem 
          icon="mail-outline" 
          title="Email y Contacto" 
          type="value"
          rightText="alex@ejemplo.com"
          color="#1976D2"
          onPress={() => handlePress('email')}
        />
         <SettingItem 
          icon="key-outline" 
          title="Contraseña y Seguridad" 
          subtitle="2FA, Cambiar PIN"
          color="#1976D2"
          onPress={() => handlePress('security')}
        />
        <SettingItem 
          icon="finger-print-outline" 
          title="FaceID / TouchID" 
          type="switch"
          value={biometrics}
          onValueChange={setBiometrics}
          color="#1976D2"
          isLast
        />
      </View>

      {/* 2. GENERAL Y PREFERENCIAS */}
      <SectionHeader title="General" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="globe-outline" 
          title="Idioma" 
          type="value"
          rightText="Español (ES)"
          color="#7B1FA2"
        />
        <SettingItem 
          icon="cash-outline" 
          title="Moneda Principal" 
          type="value"
          rightText="EUR (€)"
          color="#7B1FA2"
        />
        <SettingItem 
          icon="calendar-outline" 
          title="Primer día de la semana" 
          type="value"
          rightText="Lunes"
          color="#7B1FA2"
        />
        <SettingItem 
          icon="time-outline" 
          title="Zona Horaria" 
          type="value"
          rightText="GMT+1 (Madrid)"
          color="#7B1FA2"
          isLast
        />
      </View>

      {/* 3. APARIENCIA Y UI */}
      <SectionHeader title="Apariencia" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="moon-outline" 
          title="Modo Oscuro" 
          type="switch"
          value={darkMode}
          onValueChange={setDarkMode}
          color="#E64A19"
        />
        <SettingItem 
          icon="color-palette-outline" 
          title="Tema de la App" 
          type="value"
          rightText="Azul Océano"
          color="#E64A19"
        />
        <SettingItem 
          icon="apps-outline" 
          title="Icono de la App" 
          subtitle="Cambiar el icono del home"
          color="#E64A19"
        />
        <SettingItem 
          icon="text-outline" 
          title="Tamaño de Texto" 
          type="value"
          rightText="Medio"
          color="#E64A19"
          isLast
        />
      </View>

      {/* 4. NOTIFICACIONES */}
      <SectionHeader title="Notificaciones" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="notifications-outline" 
          title="Notificaciones Push" 
          type="switch"
          value={notifications}
          onValueChange={setNotifications}
          color="#388E3C"
        />
        <SettingItem 
          icon="mail-open-outline" 
          title="Emails de Marketing" 
          type="switch"
          value={marketingEmails}
          onValueChange={setMarketingEmails}
          color="#388E3C"
        />
        <SettingItem 
          icon="list-outline" 
          title="Resumen Diario" 
          subtitle="Recibir agenda a las 8:00 AM"
          type="value"
          rightText="08:00"
          color="#388E3C"
          isLast
        />
      </View>

      {/* 5. DATOS Y ALMACENAMIENTO */}
      <SectionHeader title="Datos y Nube" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="cloud-upload-outline" 
          title="Copia de Seguridad" 
          subtitle="Última copia: Hoy, 10:30 AM"
          color="#0097A7"
        />
        <SettingItem 
          icon="sync-outline" 
          title="Sincronización Auto" 
          type="switch"
          value={autoBackup}
          onValueChange={setAutoBackup}
          color="#0097A7"
        />
        <SettingItem 
          icon="download-outline" 
          title="Exportar Datos" 
          subtitle="Descargar copia en JSON/CSV"
          color="#0097A7"
        />
        <SettingItem 
          icon="trash-bin-outline" 
          title="Limpiar Caché" 
          subtitle="Libera 128 MB"
          color="#0097A7"
          isLast
        />
      </View>

      {/* 6. COMUNIDAD Y LEGAL */}
      <SectionHeader title="Información" />
      <View style={styles.sectionCard}>
        <SettingItem 
          icon="help-buoy-outline" 
          title="Centro de Ayuda" 
          color="#607D8B"
        />
        <SettingItem 
          icon="star-outline" 
          title="Calificar App" 
          color="#607D8B"
        />
        <SettingItem 
          icon="document-text-outline" 
          title="Términos y Privacidad" 
          color="#607D8B"
        />
        <SettingItem 
          icon="logo-github" 
          title="Versión" 
          type="value"
          rightText="v1.0.2 (Build 45)"
          color="#607D8B"
          isLast
        />
      </View>

      {/* ZONA DE PELIGRO */}
      <View style={styles.dangerZone}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAccountButton}>
          <Text style={styles.deleteAccountText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 15,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ddd',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  proBadge: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  proBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakText: {
    color: '#FF5722',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  premiumCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  premiumTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  premiumSubtitle: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 20,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  dangerText: {
    color: '#D32F2F',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#888',
    marginRight: 5,
  },
  dangerZone: {
    marginVertical: 30,
    paddingHorizontal: 16,
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  deleteAccountButton: {
    padding: 12,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
  },
  footerSpace: {
    height: 50,
  },
});
