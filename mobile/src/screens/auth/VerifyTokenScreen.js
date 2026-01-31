import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function VerifyTokenScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { verifyToken } = React.useContext(AuthContext);

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      Alert.alert('Erro', 'Insira o código de convite');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyToken(token);
      setVerified(true);
      Alert.alert('Sucesso', 'Convite validado! Prossiga para o cadastro');
      
      // Navegar para tela de completar cadastro
      setTimeout(() => {
        navigation.replace('CameraScreen', { token, email: result.email });
      }, 500);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Convite inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Usar Convite</Text>
        <Text style={styles.description}>
          Você recebeu um convite no seu email? Insira o código para continuar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Cole o código de convite aqui"
          placeholderTextColor="#999"
          value={token}
          onChangeText={setToken}
          editable={!loading}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyToken}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Validar Convite</Text>
          )}
        </TouchableOpacity>

        <View style={styles.help}>
          <Text style={styles.helpText}>
            Não recebeu o convite?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.helpLink}>Solicitar novo convite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  content: {
    marginBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  help: {
    alignItems: 'center'
  },
  helpText: {
    color: '#666',
    marginBottom: 6
  },
  helpLink: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14
  }
});
