import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Pressable,
  Modal,
  Animated,
  Platform,
  UIManager,
  Alert,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- MOCK DATA & CONFIG ---

const INITIAL_FOLDERS = [
  { id: 'root', name: 'Todas las Notas', parentId: null, color: '#64748B' },
  { id: 'personal', name: 'Personal', parentId: 'root', color: '#F59E0B' },
  { id: 'work', name: 'Trabajo', parentId: 'root', color: '#3B82F6' },
  { id: 'ideas', name: 'Ideas', parentId: 'root', color: '#A855F7' },
  { id: 'goals', name: 'Metas', parentId: 'root', color: '#10B981' },
  // Subfolders (Deep Organization)
  { id: 'gym', name: 'Gimnasio', parentId: 'personal', color: '#22C55E' },
  { id: 'recipes', name: 'Recetas', parentId: 'personal', color: '#F97316' },
  { id: 'project_x', name: 'Proyecto X', parentId: 'work', color: '#EF4444' },
];

const INITIAL_NOTES = [
  {
    id: '1',
    title: 'Lista de la compra',
    content: 'Leche de avena\nHuevos camperos\nPan integral\nAguacates\nCafé de especialidad',
    folderId: 'personal',
    date: '19 Nov',
    color: '#FEF3C7',
    borderColor: '#F59E0B',
    rotation: -1.5,
    type: 'text',
    isDeleted: false
  },
  {
    id: '2',
    title: 'Brainstorming App',
    content: 'Integrar IA para resumen diario. El dashboard debe cambiar según la hora.',
    folderId: 'project_x',
    date: '18 Nov',
    color: '#DBEAFE',
    borderColor: '#3B82F6',
    rotation: 2,
    type: 'text',
    isDeleted: false
  },
  {
    id: '3',
    title: 'Rutina de Gimnasio',
    content: 'Día A: Pectoral y Tríceps.\nPress Banca: 4x8',
    folderId: 'gym',
    date: '15 Nov',
    color: '#DCFCE7',
    borderColor: '#22C55E',
    rotation: -2.5,
    type: 'text',
    isDeleted: false
  },
  {
    id: '4',
    title: 'Nota de voz: Idea Blog',
    content: '',
    folderId: 'ideas',
    date: '10 Nov',
    color: '#F3E8FF',
    borderColor: '#A855F7',
    rotation: 1.5,
    type: 'audio',
    duration: '02:14',
    isDeleted: false
  },
  {
    id: '5',
    title: 'Idea descartada',
    content: 'Hacer una app de calcetines perdidos...', 
    folderId: 'ideas',
    date: '01 Nov',
    color: '#F1F5F9',
    borderColor: '#94A3B8',
    rotation: 0,
    type: 'text',
    isDeleted: true // In Trash
  }
];

const TEMPLATES = [
  { 
    id: 'blank', 
    name: 'Nota en Blanco', 
    icon: 'file-document-outline',
    content: '' 
  },
  { 
    id: 'meeting', 
    name: 'Acta de Reunión', 
    icon: 'account-group-outline',
    content: '## 📅 Detalles de la Reunión\n**Fecha:** \n**Asistentes:** \n\n## 📝 Agenda\n1. \n2. \n\n## ✅ Acuerdos y Tareas\n- [ ] \n- [ ] ' 
  },
  { 
    id: 'todo', 
    name: 'Lista de Tareas', 
    icon: 'checkbox-marked-outline',
    content: '## Por Hacer\n- [ ] \n- [ ] \n- [ ] \n\n## Completado\n- [x] ' 
  },
  { 
    id: 'brainstorm', 
    name: 'Brainstorming', 
    icon: 'lightbulb-on-outline',
    content: '## 🎯 Objetivo Central\n\n## 🧠 Lluvia de Ideas\n- \n- \n\n## 🚀 Próximos Pasos\n' 
  },
  { 
    id: 'journal', 
    name: 'Diario Personal', 
    icon: 'book-open-page-variant-outline',
    content: '## 🌟 Gratitud\nHoy estoy agradecido por...\n\n## 💭 Pensamientos\n\n## 🎯 Intención para mañana\n' 
  },
];

// --- COMPONENTS ---

const AudioWaveform = ({ color }) => {
  const bars = useMemo(() => Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 24) + 4), []);
  return (
    <View style={styles.waveformContainer}>
      <View style={[styles.playButtonSmall, { backgroundColor: color }]}>
         <MaterialCommunityIcons name="play" size={16} color="#FFF" />
      </View>
      <View style={styles.waveBars}>
        {bars.map((height, index) => (
          <View key={index} style={[styles.waveBar, { height, backgroundColor: color, opacity: 0.6 }]} />
        ))}
      </View>
    </View>
  );
};

const NoteCard = ({ item, onPress }) => (
  <Pressable 
    style={({ pressed }) => [
      styles.noteCard,
      {
        backgroundColor: item.color,
        borderColor: item.borderColor,
        transform: [{ rotate: `${item.rotation}deg` }, { scale: pressed ? 0.98 : 1 }],
        opacity: item.isDeleted ? 0.8 : 1
      }
    ]}
    onPress={onPress}
  >
    <View style={styles.pinHole} />
    <Text style={styles.noteTitle} numberOfLines={2}>{item.title}</Text>
    {item.type === 'audio' ? (
      <AudioWaveform color={item.borderColor} />
    ) : (
      <Text style={styles.noteContent} numberOfLines={6}>{item.content}</Text>
    )}
    <View style={styles.noteFooter}>
      {item.isDeleted && <MaterialCommunityIcons name="delete" size={14} color="#EF4444" style={{marginRight: 4}} />}
      <Text style={[styles.categoryText, { color: item.borderColor }]}>
        {item.folderId === 'root' ? '#General' : `#${item.folderId}`}
      </Text>
      <Text style={styles.noteDate}>{item.date}</Text>
    </View>
  </Pressable>
);

// --- MODALS ---

const FolderTreeModal = ({ visible, onClose, folders, currentFolderId, onSelectFolder, onGoToTrash }) => {
  const [history, setHistory] = useState(['root']);
  
  // Reset history when opening
  useEffect(() => { if (visible) setHistory(['root']); }, [visible]);

  const currentViewId = history[history.length - 1];
  
  // Get folders in current view
  const currentFolders = folders.filter(f => f.parentId === currentViewId);
  const currentFolderInfo = folders.find(f => f.id === currentViewId) || { name: 'Inicio' };

  const handlePush = (folderId) => setHistory([...history, folderId]);
  const handlePop = () => {
    if (history.length > 1) setHistory(history.slice(0, -1));
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.folderModalContent}>
          <View style={styles.folderHeader}>
            <TouchableOpacity onPress={history.length > 1 ? handlePop : onClose} style={styles.iconBtn}>
              <MaterialCommunityIcons name={history.length > 1 ? "arrow-left" : "close"} size={24} color="#334155" />
            </TouchableOpacity>
            <Text style={styles.folderTitle}>{currentFolderInfo.name}</Text>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="folder-plus-outline" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.folderList}>
            {/* Current Folder Selection (Select "This Folder") */}
            <TouchableOpacity 
              style={[styles.folderItem, currentFolderId === currentViewId && styles.folderItemActive]}
              onPress={() => onSelectFolder(currentViewId)}
            >
              <MaterialCommunityIcons name="folder-open" size={24} color="#3B82F6" />
              <Text style={styles.folderName}>Ver notas de "{currentFolderInfo.name}"</Text>
              {currentFolderId === currentViewId && <MaterialCommunityIcons name="check" size={20} color="#3B82F6" />}
            </TouchableOpacity>

            {/* Subfolders */}
            <Text style={styles.sectionHeader}>Subcarpetas</Text>
            {currentFolders.map(folder => (
              <TouchableOpacity 
                key={folder.id} 
                style={styles.folderItem}
                onPress={() => handlePush(folder.id)}
              >
                <MaterialCommunityIcons name="folder" size={24} color={folder.color} />
                <Text style={styles.folderName}>{folder.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
            {currentFolders.length === 0 && (
               <Text style={styles.emptyFolderText}>No hay subcarpetas</Text>
            )}

            <View style={styles.divider} />

            {/* Trash Link (Only at Root) */}
            {currentViewId === 'root' && (
              <TouchableOpacity style={styles.folderItem} onPress={onGoToTrash}>
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                <Text style={[styles.folderName, { color: '#EF4444' }]}>Papelera</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const TemplatesModal = ({ visible, onClose, onSelectTemplate }) => (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.bottomSheetOverlay}>
      <View style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Nueva Nota</Text>
          <TouchableOpacity onPress={onClose}>
             <MaterialCommunityIcons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomSheetSubtitle}>Elige una plantilla para comenzar</Text>
        
        <View style={styles.templatesGrid}>
          {TEMPLATES.map(tpl => (
            <TouchableOpacity 
              key={tpl.id} 
              style={styles.templateCard}
              onPress={() => onSelectTemplate(tpl)}
            >
              <View style={styles.templateIcon}>
                <MaterialCommunityIcons name={tpl.icon} size={28} color="#475569" />
              </View>
              <Text style={styles.templateName}>{tpl.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

const NoteDetailModal = ({ visible, note, onClose, onDelete, onRestore, onUpdate, isTrashMode }) => {
  if (!note) return null;
  
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View 
          style={[ 
            styles.modalContent,
            { backgroundColor: note.color }
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
               <MaterialCommunityIcons name="arrow-left" size={24} color="#334155" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
               {isTrashMode ? (
                 <TouchableOpacity style={styles.actionBtn} onPress={() => onRestore(note.id)}>
                    <MaterialCommunityIcons name="restore" size={22} color="#10B981" />
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(note.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
                 </TouchableOpacity>
               )}
            </View>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
             <TextInput 
                style={styles.modalTitleInput} 
                value={note.title} 
                multiline
                placeholder="Título"
                placeholderTextColor="rgba(15, 23, 42, 0.4)"
                editable={!isTrashMode}
                onChangeText={(text) => onUpdate(note.id, { title: text })}
             />
             
             {note.type === 'audio' && (
                <View style={styles.largeAudioPlayer}>
                   <View style={[styles.playButtonLarge, { backgroundColor: note.borderColor }]}>
                      <MaterialCommunityIcons name="play" size={32} color="#FFF" />
                   </View>
                   <Text style={styles.durationText}>{note.duration}</Text>
                </View>
             )}

             <TextInput 
                style={styles.modalContentInput} 
                value={note.content} 
                multiline 
                placeholder="Escribe algo brillante..."
                placeholderTextColor="rgba(51, 65, 85, 0.4)"
                editable={!isTrashMode}
                textAlignVertical="top"
                onChangeText={(text) => onUpdate(note.id, { content: text })}
             />
          </ScrollView>
          {isTrashMode && (
             <View style={styles.trashBanner}>
                <Text style={styles.trashBannerText}>Nota en Papelera - Solo lectura</Text>
             </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// --- MAIN SCREEN ---

export default function NotesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [currentFolderId, setCurrentFolderId] = useState('root'); // 'root', 'trash', or folder UUID
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Modals State
  const [showFolderTree, setShowFolderTree] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Filter Logic
  const isTrashMode = currentFolderId === 'trash';
  
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFolder;
      if (isTrashMode) {
        matchesFolder = note.isDeleted === true;
      } else {
        // Show notes in current folder AND not deleted
        // Optional: Include subfolder notes recursively? For now, exact match for simpler UX.
        // Let's do exact match.
        matchesFolder = (note.folderId === currentFolderId) && !note.isDeleted;
        
        // Special case: 'root' could show everything or just root notes.
        // Let's make 'root' show unfiled notes specifically.
        // User needs a way to see "All". Let's assume 'root' is "Uncategorized" effectively.
        // Or, let's make 'root' act as "Overview" showing everything? 
        // Let's stick to hierarchy: 'root' shows notes with folderId='root'.
      }
      
      return matchesSearch && matchesFolder;
    });
  }, [notes, searchQuery, currentFolderId, isTrashMode]);

  const leftColumn = filteredNotes.filter((_, index) => index % 2 === 0);
  const rightColumn = filteredNotes.filter((_, index) => index % 2 !== 0);

  // Helpers
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentFolderName = isTrashMode ? 'Papelera' : (currentFolder ? currentFolder.name : 'Desconocido');

  // Handlers
  const handleUpdateNote = (id, updates) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, ...updates } : n));
    setSelectedNote(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const handleCreateNote = (template) => {
    setShowTemplates(false);
    
    // Determine color based on folder or random
    const folder = folders.find(f => f.id === currentFolderId);
    const baseColor = folder ? folder.color : '#F59E0B';
    
    // Simple logic to generate a light background from the border color
    // This is a mock implementation. In a real app, use a color manipulation lib.
    // For now, we map known colors to their light counterparts or default to yellow.
    const colorMap = {
      '#F59E0B': '#FEF3C7', // Amber
      '#3B82F6': '#DBEAFE', // Blue
      '#A855F7': '#F3E8FF', // Purple
      '#10B981': '#D1FAE5', // Emerald
      '#22C55E': '#DCFCE7', // Green
      '#F97316': '#FFEDD5', // Orange
      '#EF4444': '#FEE2E2', // Red
      '#64748B': '#F1F5F9', // Slate
    };
    
    const bgColor = colorMap[baseColor] || '#FEF3C7';

    const newNote = {
      id: Date.now().toString(),
      title: template.id === 'blank' ? '' : template.name,
      content: template.content,
      folderId: isTrashMode ? 'root' : currentFolderId,
      date: 'Hoy',
      color: bgColor,
      borderColor: baseColor,
      rotation: Math.random() * 6 - 3,
      type: 'text',
      isDeleted: false
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isDeleted: true } : n));
    setSelectedNote(null);
    // Could show a toast here
  };

  const handleRestoreNote = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isDeleted: false } : n));
    setSelectedNote(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        {/* Folder Navigation Trigger */}
        <TouchableOpacity 
          style={styles.folderSelector} 
          onPress={() => setShowFolderTree(true)}
        >
          <Text style={styles.headerTitle}>{currentFolderName}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, isTrashMode && { opacity: 0 }]} 
          disabled={isTrashMode}
          onPress={() => setShowTemplates(true)}
        >
           <MaterialCommunityIcons name="plus" size={24} color="#CA8A04" />
        </TouchableOpacity>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder={isTrashMode ? "Buscar en papelera..." : "Buscar notas..."}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {/* Breadcrumbs or Folder Info could go here */}
      </View>

      {/* --- GRID --- */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.length > 0 ? (
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {leftColumn.map(note => (
                <NoteCard key={note.id} item={note} onPress={() => setSelectedNote(note)} />
              ))}
            </View>
            <View style={styles.column}>
              {rightColumn.map(note => (
                <NoteCard key={note.id} item={note} onPress={() => setSelectedNote(note)} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name={isTrashMode ? "delete-empty" : "notebook-outline"} 
              size={64} 
              color="#CBD5E1" 
            />
            <Text style={styles.emptyText}>
              {isTrashMode ? 'Papelera vacía' : 'Carpeta vacía'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isTrashMode ? 'No hay notas eliminadas' : 'Toca el + para crear una nota'}
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- MODALS --- */}
      <NoteDetailModal 
        visible={!!selectedNote} 
        note={selectedNote} 
        onClose={() => setSelectedNote(null)}
        onDelete={handleDeleteNote}
        onRestore={handleRestoreNote}
        onUpdate={handleUpdateNote}
        isTrashMode={isTrashMode}
      />

      <FolderTreeModal 
        visible={showFolderTree} 
        folders={folders}
        currentFolderId={currentFolderId}
        onClose={() => setShowFolderTree(false)}
        onSelectFolder={(id) => {
          setCurrentFolderId(id);
          setShowFolderTree(false);
        }}
        onGoToTrash={() => {
          setCurrentFolderId('trash');
          setShowFolderTree(false);
        }}
      />

      <TemplatesModal 
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleCreateNote}
      />

      {/* FAB (Only in normal mode) */}
      {!isTrashMode && (
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.9} 
          onPress={() => setShowTemplates(true)}
        >
           <MaterialCommunityIcons name="pencil-plus" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  folderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 4,
  },
  addButton: {
    padding: 8,
    marginRight: -8,
    backgroundColor: '#FEFCE8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  controlsContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#334155', height: '100%' },
  
  // GRID
  scrollContent: { paddingHorizontal: 16 },
  masonryContainer: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, gap: 16 },
  
  // NOTE CARD
  noteCard: {
    padding: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 2,
    borderBottomRightRadius: 20,
  },
  pinHole: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-medium',
  },
  noteContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  noteDate: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },

  // AUDIO WAVEFORM
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  playButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waveBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },

  // FOLDER MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  folderModalContent: {
    width: '100%',
    height: '70%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  folderList: { flex: 1 },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  folderItemActive: {
    backgroundColor: '#EFF6FF',
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    marginLeft: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyFolderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginLeft: 8,
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },

  // TEMPLATES MODAL (Bottom Sheet style)
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },

  // NOTE DETAIL
  modalContent: {
    width: '100%',
    height: '90%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', gap: 16 },
  modalScroll: { flex: 1 },
  modalTitleInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalContentInput: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    minHeight: 200,
  },
  trashBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    padding: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  trashBannerText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  
  // Large Audio
  largeAudioPlayer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButtonLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  durationText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#64748B', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F43F5E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
