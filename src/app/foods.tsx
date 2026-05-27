import { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Food } from '@/db/schema';
import { FoodService } from '@/db/services';

const DEFAULT_PORTION = 100;
const MACRO_COLORS = {
  protein: '#FF6B6B',
  carbs: '#45B7D1',
  fat: '#FFEAA7',
} as const;

export default function FoodsScreen() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: '',
    portion: DEFAULT_PORTION.toString(),
  });

  const loadFoods = useCallback(async (query?: string) => {
    try {
      const allFoods = query
        ? await FoodService.search(query)
        : await FoodService.getAll();
      setFoods(allFoods);
      setLoading(false);
    } catch (error) {
      console.error('Error loading foods:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadFoods(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, loadFoods]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del alimento es requerido');
      return;
    }

    const protein = parseFloat(formData.protein) || 0;
    const carbs = parseFloat(formData.carbs) || 0;
    const fat = parseFloat(formData.fat) || 0;
    const calories = parseFloat(formData.calories) || 0;
    const portion = parseInt(formData.portion) || 100;

    if (protein === 0 && carbs === 0 && fat === 0 && calories === 0) {
      Alert.alert('Error', 'Debe ingresar al menos un valor nutricional');
      return;
    }

    try {
      await FoodService.create(formData.name, protein, carbs, fat, calories, portion);
      setModalVisible(false);
      setFormData({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
        calories: '',
        portion: DEFAULT_PORTION.toString(),
      });
      await loadFoods(searchQuery);
      Alert.alert('✓ Éxito', `"${formData.name}" agregado`);
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar: ${error}`);
    }
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <ThemedView style={styles.foodCard}>
      <ThemedView style={styles.foodHeader}>
        <ThemedText style={styles.foodName}>{item.name}</ThemedText>
        <ThemedText style={styles.foodPortion}>
          {item.portion}g
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.macroRow}>
        <ThemedView style={[styles.macroPill, { backgroundColor: MACRO_COLORS.protein + '20' }]}>
          <ThemedText style={[styles.macroValue, { color: MACRO_COLORS.protein }]}>
            P {item.protein}g
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.macroPill, { backgroundColor: MACRO_COLORS.carbs + '20' }]}>
          <ThemedText style={[styles.macroValue, { color: MACRO_COLORS.carbs }]}>
            C {item.carbs}g
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.macroPill, { backgroundColor: MACRO_COLORS.fat + '30' }]}>
          <ThemedText style={[styles.macroValue, { color: '#D4A017' }]}>
            F {item.fat}g
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.calorieBadge}>
          <ThemedText style={styles.calorieText}>
            {item.calories} kcal
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">🥗 Alimentos</ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            {foods.length} alimento{foods.length !== 1 ? 's' : ''} registrado{foods.length !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alimento..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <ThemedText style={styles.clearButtonText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Foods List */}
        <FlatList
          data={foods}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderFoodItem}
          ListEmptyComponent={() => (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                {searchQuery ? 'Sin resultados' : 'Sin alimentos'}
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                {searchQuery
                  ? `No se encontró "${searchQuery}"`
                  : 'La base de datos se cargará automáticamente'}
              </ThemedText>
            </ThemedView>
          )}
        />

        {/* FAB Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>

        {/* Add Food Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
              <ThemedText type="title">Nuevo Alimento</ThemedText>
              <View style={{ width: 40 }} />
            </ThemedView>

            <FlatList
              data={[]}
              renderItem={null}
              ListEmptyComponent={null}
              contentContainerStyle={styles.modalContent}
              ListHeaderComponent={
                <ThemedView style={styles.form}>
                  {/* Name */}
                  <ThemedView style={styles.formGroup}>
                    <ThemedText type="small" style={styles.label}>
                      Nombre del alimento
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Pechuga de pollo"
                      value={formData.name}
                      onChangeText={text => setFormData({ ...formData, name: text })}
                    />
                  </ThemedView>

                  {/* Macros Row */}
                  <ThemedView style={styles.macroInputRow}>
                    <ThemedView style={styles.macroInputGroup}>
                      <ThemedText type="small" style={styles.label}>Proteína (g)</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={formData.protein}
                        onChangeText={text => setFormData({ ...formData, protein: text })}
                      />
                    </ThemedView>
                    <ThemedView style={styles.macroInputGroup}>
                      <ThemedText type="small" style={styles.label}>Carbos (g)</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={formData.carbs}
                        onChangeText={text => setFormData({ ...formData, carbs: text })}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.macroInputRow}>
                    <ThemedView style={styles.macroInputGroup}>
                      <ThemedText type="small" style={styles.label}>Grasa (g)</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={formData.fat}
                        onChangeText={text => setFormData({ ...formData, fat: text })}
                      />
                    </ThemedView>
                    <ThemedView style={styles.macroInputGroup}>
                      <ThemedText type="small" style={styles.label}>Calorías (kcal)</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={formData.calories}
                        onChangeText={text => setFormData({ ...formData, calories: text })}
                      />
                    </ThemedView>
                  </ThemedView>

                  {/* Portion */}
                  <ThemedView style={styles.formGroup}>
                    <ThemedText type="small" style={styles.label}>
                      Porción estándar (g)
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="100"
                      keyboardType="number-pad"
                      value={formData.portion}
                      onChangeText={text => setFormData({ ...formData, portion: text })}
                    />
                    <ThemedText type="small" style={styles.hint}>
                      Los valores nutricionales son por cada {formData.portion || '100'}g
                    </ThemedText>
                  </ThemedView>

                  {/* Quick Calories Calculator */}
                  {formData.protein || formData.carbs || formData.fat ? (
                    <ThemedView style={styles.calcPreview}>
                      <ThemedText type="small" style={styles.calcLabel}>
                        Cálculo estimado:
                      </ThemedText>
                      <ThemedText style={styles.calcValue}>
                        {(
                          (parseFloat(formData.protein) || 0) * 4 +
                          (parseFloat(formData.carbs) || 0) * 4 +
                          (parseFloat(formData.fat) || 0) * 9
                        ).toFixed(0)} kcal
                      </ThemedText>
                    </ThemedView>
                  ) : null}

                  {/* Save Button */}
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <ThemedText style={styles.saveButtonText}>
                      Agregar Alimento
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              }
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  header: {
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  headerSubtitle: {
    opacity: 0.6,
    marginTop: Spacing.one,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  clearButton: {
    padding: Spacing.one,
  },
  clearButtonText: {
    fontSize: 18,
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: BottomTabInset + Spacing.four + 60,
  },
  foodCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  foodPortion: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: Spacing.two,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  macroPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  calorieBadge: {
    marginLeft: 'auto',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  calorieText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four + BottomTabInset,
    right: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 40,
  },
  modalContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.four,
  },
  form: {
    gap: Spacing.three,
  },
  formGroup: {
    gap: Spacing.one,
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroInputGroup: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  hint: {
    opacity: 0.5,
    fontSize: 12,
    marginTop: Spacing.half,
  },
  calcPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 8,
  },
  calcLabel: {
    opacity: 0.6,
  },
  calcValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
