/**
 * Clients Management Screen
 * CRUD operations for client profiles
 */

import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Client } from '@/db/schema';
import { ClientService } from '@/db/services';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    weight: '',
    bodyFatPercentage: '',
    shirtSize: 'M',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await ClientService.getAll();
      setClients(allClients);
      setLoading(false);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
      setLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        height: client.height.toString(),
        weight: client.weight.toString(),
        bodyFatPercentage: client.bodyFatPercentage.toString(),
        shirtSize: client.shirtSize,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        height: '',
        weight: '',
        bodyFatPercentage: '',
        shirtSize: 'M',
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        await ClientService.update(editingClient.id, {
          name: formData.name,
          height: parseFloat(formData.height) || editingClient.height,
          weight: parseFloat(formData.weight) || editingClient.weight,
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || editingClient.bodyFatPercentage,
          shirtSize: formData.shirtSize,
        });
        Alert.alert('✓ Éxito', `Cliente "${formData.name}" actualizado`);
      } else {
        // Create new client
        await ClientService.create({
          name: formData.name,
          email: `${formData.name.toLowerCase().replace(/\s/g, '.')}@gymfit.local`,
          height: parseFloat(formData.height) || 175,
          weight: parseFloat(formData.weight) || 75,
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || 15,
          shirtSize: formData.shirtSize,
          trainerId: null,
          notes: '',
        });
        Alert.alert('✓ Éxito', `Cliente "${formData.name}" creado`);
      }

      setModalVisible(false);
      await loadClients();
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar: ${error}`);
    }
  };

  const handleDelete = (client: Client) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar a "${client.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClientService.delete(client.id);
              await loadClients();
              Alert.alert('✓ Éxito', 'Cliente eliminado');
            } catch (error) {
              Alert.alert('Error', `No se pudo eliminar: ${error}`);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="small">Cargando clientes...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">👥 Clientes</ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <ThemedText style={styles.addButtonText}>+ Nuevo Cliente</ThemedText>
        </TouchableOpacity>

        {/* Clients List */}
        <FlatList
          data={clients}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.clientCard}
              onPress={() => handleOpenModal(item)}
            >
              <ThemedView style={styles.clientCardContent}>
                <ThemedView style={styles.clientHeader}>
                  <ThemedText style={styles.clientName}>{item.name}</ThemedText>
                  <ThemedText style={styles.clientTrainer}>
                    {item.trainerId ? '🏋️ Con entrenador' : '👤 Sin entrenador'}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.statsGrid}>
                  <ThemedView style={styles.stat}>
                    <ThemedText type="small" style={styles.statLabel}>
                      Altura
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {item.height.toFixed(0)} cm
                    </ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.stat}>
                    <ThemedText type="small" style={styles.statLabel}>
                      Peso
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {item.weight.toFixed(1)} kg
                    </ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.stat}>
                    <ThemedText type="small" style={styles.statLabel}>
                      Grasa
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {item.bodyFatPercentage.toFixed(1)}%
                    </ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.stat}>
                    <ThemedText type="small" style={styles.statLabel}>
                      Talla
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {item.shirtSize}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenModal(item)}
                  >
                    <ThemedText style={styles.btnText}>Editar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <ThemedText style={styles.btnTextDelete}>Eliminar</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                Sin clientes
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Crea tu primer cliente para comenzar
              </ThemedText>
            </ThemedView>
          )}
        />

        {/* Modal */}
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ThemedView style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <ThemedText style={styles.closeButton}>✕</ThemedText>
                </TouchableOpacity>
                <ThemedText type="title">
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                </ThemedText>
                <View style={{ width: 40 }} />
              </ThemedView>

              {/* Form */}
              <ThemedView style={styles.form}>
                {/* Name */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText type="small" style={styles.label}>
                    Nombre
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChangeText={text => setFormData({ ...formData, name: text })}
                  />
                </ThemedView>

                {/* Height */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText type="small" style={styles.label}>
                    Altura (cm)
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    keyboardType="decimal-pad"
                    value={formData.height}
                    onChangeText={text => setFormData({ ...formData, height: text })}
                  />
                </ThemedView>

                {/* Weight */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText type="small" style={styles.label}>
                    Peso (kg)
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="75"
                    keyboardType="decimal-pad"
                    value={formData.weight}
                    onChangeText={text => setFormData({ ...formData, weight: text })}
                  />
                </ThemedView>

                {/* Body Fat */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText type="small" style={styles.label}>
                    Porcentaje de Grasa Corporal (%)
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="15"
                    keyboardType="decimal-pad"
                    value={formData.bodyFatPercentage}
                    onChangeText={text => setFormData({ ...formData, bodyFatPercentage: text })}
                  />
                </ThemedView>

                {/* Shirt Size */}
                <ThemedView style={styles.formGroup}>
                  <ThemedText type="small" style={styles.label}>
                    Talla de Camiseta
                  </ThemedText>
                  <ThemedView style={styles.sizeButtons}>
                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.sizeButton,
                          formData.shirtSize === size && styles.sizeButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, shirtSize: size })}
                      >
                        <ThemedText
                          style={[
                            styles.sizeButtonText,
                            formData.shirtSize === size && styles.sizeButtonTextActive,
                          ]}
                        >
                          {size}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                </ThemedView>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <ThemedText style={styles.saveButtonText}>
                    {editingClient ? 'Actualizar' : 'Crear'} Cliente
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
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
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  headerSubtitle: {
    opacity: 0.6,
    marginTop: Spacing.one,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
  clientCard: {
    marginBottom: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  clientCardContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  clientHeader: {
    gap: Spacing.one,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
  },
  clientTrainer: {
    fontSize: 12,
    opacity: 0.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    minWidth: '48%',
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.6,
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  editBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    backgroundColor: '#45B7D1',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    backgroundColor: '#FFD3D3',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnTextDelete: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
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
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 40,
  },
  form: {
    gap: Spacing.three,
  },
  formGroup: {
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
  sizeButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  sizeButtonText: {
    fontWeight: '600',
  },
  sizeButtonTextActive: {
    color: '#fff',
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
