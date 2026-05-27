/**
 * Example Demo Screen - GymFit Database Usage
 * Shows practical examples of using all database services
 * 
 * This is a reference implementation for app development
 * Remove or refactor this file once the app structure is established
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Client, Food } from '@/db/schema';
import { ClientService, FoodService, MealService } from '@/db/services';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

export function DatabaseDemoScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dailyMacros, setDailyMacros] = useState<{
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalCalories: number;
  } | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadClients();
    loadFoods();
  }, []);

  // Load clients from database
  const loadClients = async () => {
    try {
      const allClients = await ClientService.getAll();
      setClients(allClients);
      if (allClients.length > 0) {
        setSelectedClient(allClients[0]);
        await loadDailyMacros(allClients[0].id);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients');
    }
  };

  // Load foods from database
  const loadFoods = async () => {
    try {
      const allFoods = await FoodService.getAll();
      setFoods(allFoods);
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  };

  // Load daily macros for selected client
  const loadDailyMacros = async (clientId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = await MealService.getDailySummary(clientId, today);
      setDailyMacros({
        totalProtein: Math.round(summary.totalProtein * 10) / 10,
        totalCarbs: Math.round(summary.totalCarbs * 10) / 10,
        totalFat: Math.round(summary.totalFat * 10) / 10,
        totalCalories: Math.round(summary.totalCalories),
      });
    } catch (error) {
      console.error('Error loading daily macros:', error);
    }
  };

  // Create new client
  const createNewClient = async () => {
    if (!newClientName.trim()) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    setLoading(true);
    try {
      await ClientService.create({
        name: newClientName,
        email: `${newClientName.toLowerCase().replace(' ', '.')}@gymfit.local`,
        height: 180,
        weight: 80,
        bodyFatPercentage: 15,
        shirtSize: 'M',
        trainerId: null,
        notes: 'Created via demo',
      });
      setNewClientName('');
      await loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
      Alert.alert('Error', 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  // Create sample meal for selected client
  const createSampleMeal = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a client');
      return;
    }

    setLoading(true);
    try {
      const mealId = await MealService.createMeal(selectedClient.id, 'breakfast', 1);

      // Add some foods to the meal
      if (foods.length > 0) {
        await MealService.addFoodToMeal(mealId, foods[0].id, 200); // 200g
        if (foods.length > 1) {
          await MealService.addFoodToMeal(mealId, foods[1].id, 150); // 150g
        }
      }

      await loadDailyMacros(selectedClient.id);
      Alert.alert('Success', 'Sample meal created!');
    } catch (error) {
      console.error('Error creating meal:', error);
      Alert.alert('Error', 'Failed to create meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">GymFit Database Demo</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Reference implementation for database operations
          </ThemedText>
        </ThemedView>

        {/* Create Client Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Add New Client</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Client name"
            value={newClientName}
            onChangeText={setNewClientName}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={createNewClient}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Client'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Clients List */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Clients</ThemedText>
          <FlatList
            scrollEnabled={false}
            data={clients}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.clientItem,
                  selectedClient?.id === item.id && styles.clientItemSelected,
                ]}
                onPress={() => {
                  setSelectedClient(item);
                  loadDailyMacros(item.id);
                }}
              >
                <ThemedText style={styles.clientName}>{item.name}</ThemedText>
                <ThemedText type="small" style={styles.clientInfo}>
                  {item.weight}kg • {item.height}cm • {item.bodyFatPercentage}% BF
                </ThemedText>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <ThemedText type="small" style={styles.empty}>
                No clients yet. Create one above.
              </ThemedText>
            )}
          />
        </ThemedView>

        {/* Daily Macros Summary */}
        {selectedClient && dailyMacros && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">
              Today's Macros - {selectedClient.name}
            </ThemedText>

            <ThemedView style={styles.macroGrid}>
              <ThemedView style={styles.macroCard}>
                <ThemedText type="small" style={styles.macroLabel}>
                  Protein
                </ThemedText>
                <ThemedText style={styles.macroValue}>
                  {dailyMacros.totalProtein}g
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.macroCard}>
                <ThemedText type="small" style={styles.macroLabel}>
                  Carbs
                </ThemedText>
                <ThemedText style={styles.macroValue}>
                  {dailyMacros.totalCarbs}g
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.macroCard}>
                <ThemedText type="small" style={styles.macroLabel}>
                  Fat
                </ThemedText>
                <ThemedText style={styles.macroValue}>
                  {dailyMacros.totalFat}g
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.macroCard}>
                <ThemedText type="small" style={styles.macroLabel}>
                  Calories
                </ThemedText>
                <ThemedText style={styles.macroValue}>
                  {dailyMacros.totalCalories} kcal
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <TouchableOpacity
              style={styles.button}
              onPress={createSampleMeal}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>
                Add Sample Meal
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Foods Database Info */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">
            Foods Database ({foods.length} items)
          </ThemedText>
          <FlatList
            scrollEnabled={false}
            data={foods.slice(0, 5)}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ThemedView style={styles.foodItem}>
                <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                <ThemedText type="small" style={styles.foodMacros}>
                  P:{item.protein}g C:{item.carbs}g F:{item.fat}g ({item.calories} kcal)
                </ThemedText>
              </ThemedView>
            )}
            ListEmptyComponent={() => (
              <ThemedText type="small">No foods loaded</ThemedText>
            )}
          />
          {foods.length > 5 && (
            <ThemedText type="small" style={styles.moreInfo}>
              ... and {foods.length - 5} more foods
            </ThemedText>
          )}
        </ThemedView>

        {/* Documentation Link */}
        <ThemedView style={styles.section}>
          <ThemedText type="small" style={styles.docLink}>
            📖 See README_DATABASE.md for complete API documentation
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  subtitle: {
    opacity: 0.6,
  },
  section: {
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  clientItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  clientItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  clientName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  clientInfo: {
    opacity: 0.6,
  },
  empty: {
    opacity: 0.5,
    textAlign: 'center',
    paddingVertical: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroCard: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  macroLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 8,
  },
  foodName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  foodMacros: {
    opacity: 0.6,
    fontSize: 12,
  },
  moreInfo: {
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 8,
  },
  docLink: {
    opacity: 0.7,
    marginVertical: 8,
  },
});
