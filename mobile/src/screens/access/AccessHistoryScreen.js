import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import api from '../../services/api';
import { subscribeToAccessUpdates, unsubscribeFromAccessUpdates } from '../../services/socket';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export default function AccessHistoryScreen() {
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAccesses();
    subscribeToAccessUpdates(handleNewAccess);

    return () => {
      unsubscribeFromAccessUpdates();
    };
  }, []);

  const fetchAccesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/access?limit=50');
      setAccesses(response.data.accesses || []);
    } catch (error) {
      console.error('Erro ao buscar acessos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccesses();
    setRefreshing(false);
  };

  const handleNewAccess = (newAccess) => {
    setAccesses(prev => [newAccess, ...prev]);
  };

  const renderAccess = ({ item }) => {
    const isEntrance = item.direction === 'entrada';
    const directionColor = isEntrance ? '#10b981' : '#f59e0b';
    const directionText = isEntrance ? 'Entrada' : 'Saída';

    return (
      <View style={styles.accessCard}>
        <View style={styles.accessHeader}>
          <View
            style={[styles.directionBadge, { backgroundColor: directionColor }]}
          >
            <Text style={styles.directionText}>{directionText}</Text>
          </View>
          <Text style={styles.timeText}>
            {dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}
          </Text>
        </View>
        {item.device && (
          <Text style={styles.deviceText}>Dispositivo: {item.device.name}</Text>
        )}
        {item.recognized && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confiança:</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceBarFill,
                  { width: `${item.confidence}%` }
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>{item.confidence}%</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accesses}
        renderItem={renderAccess}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum acesso registrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  accessCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  accessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  directionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  directionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  deviceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8
  },
  confidenceContainer: {
    marginTop: 8
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#10b981'
  },
  confidenceValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});
