import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { state, logout } = React.useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/residents/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Tem certeza que deseja sair?', [
      {
        text: 'Cancelar',
        onPress: () => {}
      },
      {
        text: 'Sair',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Erro', 'Erro ao fazer logout');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {profile?.photo && (
          <Image
            source={{ uri: profile.photo }}
            style={styles.avatar}
          />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{state.user?.name || 'Usuário'}</Text>
          <Text style={styles.email}>{state.user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>

        {profile && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Documento</Text>
              <Text style={styles.infoValue}>{profile.document}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{profile.phone}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Unidade</Text>
              <Text style={styles.infoValue}>{profile.unit || '-'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status de Acesso</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: profile.accessPermitted ? '#10b981' : '#ef4444' }
              ]}>
                <Text style={styles.statusText}>
                  {profile.accessPermitted ? 'Permitido' : 'Bloqueado'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sincronização</Text>

        {profile?.syncedAt && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última sincronização</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.syncedAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.syncButton}
          onPress={fetchProfile}
        >
          <Text style={styles.syncButtonText}>Sincronizar Agora</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12
  },
  headerInfo: {
    alignItems: 'center'
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16
  },
  infoItem: {
    marginBottom: 16
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  syncButton: {
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe'
  },
  syncButtonText: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  logoutButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16
  },
  footer: {
    height: 40
  }
});
