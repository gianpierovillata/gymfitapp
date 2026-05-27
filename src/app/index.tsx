import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Client } from '@/db/schema';
import { ClientService } from '@/db/services';

interface Feature {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    id: 'clients',
    title: 'Clientes',
    icon: '👥',
    description: 'Gestionar perfiles de clientes',
    color: '#FF6B6B',
  },
  {
    id: 'meals',
    title: 'Comidas',
    icon: '🍽️',
    description: 'Registrar comidas y calcular macros',
    color: '#4ECDC4',
  },
  {
    id: 'routines',
    title: 'Rutinas',
    icon: '💪',
    description: 'Entrenamientos por grupos musculares',
    color: '#45B7D1',
  },
  {
    id: 'foods',
    title: 'Alimentos',
    icon: '🥗',
    description: 'Base de datos nutricional',
    color: '#96CEB4',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    description: 'Resumen diario de macros',
    color: '#FFEAA7',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<string>('Inicializando...');

  // Initialize app and load data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setDbStatus('Inicializando base de datos...');
      const { initDB } = await import('@/db/sqlite');
      await initDB();
      console.log('✓ SQLite initialized');

      setDbStatus('Sembrando datos de alimentos...');
      const { seedFoods } = await import('@/db/seeder');
      await seedFoods();
      console.log('✓ Food database seeded');

      setDbStatus('Cargando clientes...');
      const allClients = await ClientService.getAll();
      setClients(allClients);

      setDbStatus('✓ Sistema listo');
      setLoading(false);
    } catch (err) {
      console.error('App initialization error', err);
      setDbStatus(`❌ Error: ${String(err)}`);
      setLoading(false);
    }
  };

  const handleCreateTestClient = async () => {
    try {
      const testName = `Cliente ${clients.length + 1}`;
      await ClientService.create({
        name: testName,
        email: `client${clients.length + 1}@gymfit.local`,
        height: 175 + Math.random() * 15,
        weight: 70 + Math.random() * 20,
        bodyFatPercentage: 15 + Math.random() * 10,
        shirtSize: 'M',
        trainerId: null,
        notes: 'Cliente de prueba',
      });

      const updated = await ClientService.getAll();
      setClients(updated);
      Alert.alert('✓ Éxito', `Cliente "${testName}" creado`);
    } catch (error) {
      Alert.alert('Error', `No se pudo crear cliente: ${error}`);
    }
  };

  const handleFeaturePress = (featureId: string) => {
    switch (featureId) {
      case 'clients':
        router.push('/clients');
        break;
      case 'meals':
        Alert.alert('Coming Soon', 'Pantalla de comidas en desarrollo');
        break;
      case 'routines':
        Alert.alert('Coming Soon', 'Pantalla de rutinas en desarrollo');
        break;
      case 'foods':
        router.push('/foods');
        break;
      case 'dashboard':
        Alert.alert('Coming Soon', 'Dashboard en desarrollo');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.centerContent}>
            <ThemedText type="title">GymFit</ThemedText>
            <ThemedText type="small" style={styles.statusText}>
              {dbStatus}
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.appTitle}>
              🏋️ GymFit
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Control de clientes, entrenamientos y nutrición
            </ThemedText>
          </ThemedView>

          {/* Status Card */}
          <ThemedView style={styles.statusCard}>
            <ThemedText type="small" style={styles.statusLabel}>
              Estado del Sistema
            </ThemedText>
            <ThemedText style={styles.statusValue}>✓ {dbStatus}</ThemedText>
            <ThemedText type="small" style={styles.statsText}>
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
            </ThemedText>
          </ThemedView>

          {/* Features Grid */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Funcionalidades
          </ThemedText>

          <FlatList
            scrollEnabled={false}
            data={FEATURES}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.featureCard, { borderLeftColor: item.color }]}
                onPress={() => handleFeaturePress(item.id)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.featureIcon}>{item.icon}</ThemedText>
                <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
                <ThemedText type="small" style={styles.featureDescription}>
                  {item.description}
                </ThemedText>
              </TouchableOpacity>
            )}
          />

          {/* Clients List Preview */}
          {clients.length > 0 && (
            <ThemedView style={styles.clientsSection}>
              <ThemedText type="subtitle">Clientes Recientes</ThemedText>
              <FlatList
                scrollEnabled={false}
                data={clients.slice(0, 3)}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <ThemedView style={styles.clientItem}>
                    <ThemedView style={styles.clientInfo}>
                      <ThemedText style={styles.clientName}>{item.name}</ThemedText>
                      <ThemedText type="small" style={styles.clientDetails}>
                        {item.weight}kg • {Math.round(item.height)}cm
                      </ThemedText>
                    </ThemedView>
                    <ThemedText type="small" style={styles.clientBF}>
                      {item.bodyFatPercentage.toFixed(1)}% BF
                    </ThemedText>
                  </ThemedView>
                )}
              />
              {clients.length > 3 && (
                <ThemedText type="small" style={styles.moreClients}>
                  +{clients.length - 3} más
                </ThemedText>
              )}
            </ThemedView>
          )}

          {/* Empty State */}
          {clients.length === 0 && (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="subtitle">Sin clientes</ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Crea tu primer cliente para comenzar
              </ThemedText>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTestClient}
              >
                <ThemedText style={styles.createButtonText}>
                  Crear cliente de prueba
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {/* Footer Info */}
          <ThemedView style={styles.footer}>
            <ThemedText type="small" style={styles.footerText}>
              Base de datos local • Expo v56.0.0 • SQLite
            </ThemedText>
          </ThemedView>
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusText: {
    marginTop: Spacing.three,
    opacity: 0.7,
    fontSize: 14,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  statusCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: Spacing.two,
    backgroundColor: 'rgba(76, 206, 196, 0.1)',
  },
  statusLabel: {
    opacity: 0.6,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsText: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  gridRow: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  featureCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#E0E0E0',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  featureIcon: {
    fontSize: 40,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 12,
  },
  clientsSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: Spacing.two,
  },
  clientInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  clientName: {
    fontWeight: '600',
    fontSize: 15,
  },
  clientDetails: {
    opacity: 0.6,
    fontSize: 13,
  },
  clientBF: {
    opacity: 0.7,
    fontSize: 12,
    fontWeight: '500',
  },
  moreClients: {
    opacity: 0.5,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.5,
    fontSize: 12,
  },
});
