import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionFormScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { type = 'expense' } = route.params || {};
  
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  const isExpense = type === 'expense';
  const isTransfer = type === 'transfer';
  
  const getHeaderTitle = () => {
    if (isTransfer) return 'Nueva Transferencia';
    return isExpense ? 'Registrar Gasto' : 'Registrar Ingreso';
  };

  const getColor = () => {
    if (isTransfer) return '#3B82F6';
    return isExpense ? '#EF4444' : '#10B981';
  };

  const handleSave = () => {
    // Here we would save to context/db
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: getColor() }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>€</Text>
          <TextInput 
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="numeric"
            autoFocus
          />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Concepto</Text>
            <TextInput 
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Supermercado, Nómina..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <TouchableOpacity style={styles.selectInput}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.catIcon, { backgroundColor: '#F1F5F9' }]}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color="#64748B" />
                </View>
                <Text style={{ color: category ? '#1E293B' : '#94A3B8', fontSize: 16 }}>
                  {category || 'Seleccionar categoría'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity style={styles.selectInput}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
                <Text style={{ color: '#1E293B', fontSize: 16 }}>Hoy, 18 Nov</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isTransfer && (
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Destinatario / Cuenta</Text>
               <TextInput 
                  style={styles.input}
                  placeholder="IBAN o Nombre"
                  placeholderTextColor="#94A3B8"
                />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: getColor() }]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    minWidth: 100,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
