import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import { initSocket, subscribeToAccessUpdates } from '../../services/socket';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export default function HomeScreen({ navigation }) {
  const { state } = React.useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [lastAccesses, setLastAccesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Inicializar Socket.io
    if (state.userToken) {
      initSocket(state.userToken);
      subscribeToAccessUpdates(handleNewAccess);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, accessRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/access?limit=5')
      ]);

      setStats(statsRes.data);
      setLastAccesses(accessRes.data.accesses || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleNewAccess = (access) => {
    setLastAccesses(prev => [access, ...prev.slice(0, 4)]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {state.user?.name}!</Text>
        <Text style={styles.time}>{dayjs().format('dddd, D [de] MMMM')}</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Acessos Hoje</Text>
            <Text style={styles.statValue}>{stats.accessesToday || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Última Entrada</Text>
            <Text style={styles.statTime}>
              {stats.lastAccess
                ? dayjs(stats.lastAccess).format('HH:mm')
                : '--:--'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Status</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: stats.accessPermitted ? '#10b981' : '#ef4444' }
            ]}>
              <Text style={styles.statusText}>
                {stats.accessPermitted ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Acessos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AccessHistory')}>
            <Text style={styles.sectionLink}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        {lastAccesses.length > 0 ? (
          lastAccesses.map((access) => (
            <View key={access.id} style={styles.accessItem}>
              <View style={styles.accessInfo}>
                <View
                  style={[
                    styles.accessDirection,
                    {
                      backgroundColor: access.direction === 'entrada' ? '#10b981' : '#f59e0b'
                    }
                  ]}
                >
                  <Text style={styles.accessDirectionText}>
                    {access.direction === 'entrada' ? 'E' : 'S'}
                  </Text>
                </View>
                <View style={styles.accessDetails}>
                  <Text style={styles.accessDirectionLabel}>
                    {access.direction === 'entrada' ? 'Entrada' : 'Saída'}
                  </Text>
                  <Text style={styles.accessTime}>
                    {dayjs(access.timestamp).format('HH:mm')}
                  </Text>
                </View>
              </View>
              <View style={styles.accessConfidence}>
                <Text style={styles.confidenceText}>
                  {access.confidence}%
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Nenhum acesso registrado</Text>
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
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
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    color: '#fff'
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  time: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize'
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6'
  },
  statTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
  sectionLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600'
  },
  accessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  accessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  accessDirection: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  accessDirectionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  accessDetails: {
    flex: 1
  },
  accessDirectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  accessTime: {
    fontSize: 12,
    color: '#999'
  },
  accessConfidence: {
    alignItems: 'flex-end'
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981'
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 12
  },
  footer: {
    height: 20
  }
});
