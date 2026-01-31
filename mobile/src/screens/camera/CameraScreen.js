import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../contexts/AuthContext';

export default function CameraScreen({ route, navigation }) {
  const { token, email } = route.params || {};
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { completeRegistration } = React.useContext(AuthContext);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.cancelled && result.assets) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao acessar câmera');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.cancelled && result.assets) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao acessar galeria');
    }
  };

  const handleComplete = async () => {
    if (!name || !document || !phone || !password || !confirmPassword || !photo) {
      Alert.alert('Erro', 'Preencha todos os campos e tire uma foto');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não correspondem');
      return;
    }

    setLoading(true);
    try {
      await completeRegistration(
        token,
        {
          name,
          document,
          phone,
          password
        },
        photo
      );
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete seu Cadastro</Text>

        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <Text style={styles.removePhotoText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.placeholderText}>Nenhuma foto tirada</Text>
          </View>
        )}

        <View style={styles.photoButtons}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImage}
            disabled={loading}
          >
            <Text style={styles.photoButtonText}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickFromLibrary}
            disabled={loading}
          >
            <Text style={styles.photoButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="CPF/Documento"
          placeholderTextColor="#999"
          value={document}
          onChangeText={setDocument}
          editable={!loading}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Completar Cadastro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24
  },
  photoContainer: {
    marginBottom: 16,
    alignItems: 'center'
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 'auto',
    marginBottom: 16,
    alignSelf: 'center'
  },
  placeholderText: {
    color: '#999',
    fontSize: 14
  },
  removePhoto: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 4
  },
  removePhotoText: {
    color: '#fff',
    fontWeight: '600'
  },
  photoButtons: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  photoButtonText: {
    color: '#333',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
