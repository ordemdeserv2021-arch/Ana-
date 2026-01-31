import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  user: null,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.payload.token,
        user: action.payload.user,
        isLoading: false
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        error: null
      };
    case 'SIGN_UP':
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        error: null
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
        user: null
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar token ao iniciar app
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Validar token com backend
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token, user: response.data }
          });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: { token: null, user: null } });
        }
      } catch (error) {
        dispatch({ type: 'RESTORE_TOKEN', payload: { token: null, user: null } });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    state,
    login: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        await SecureStore.setItemAsync('userToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        dispatch({ type: 'SIGN_IN', payload: { token, user } });
        return user;
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao fazer login';
        dispatch({ type: 'ERROR', payload: message });
        throw error;
      }
    },

    register: async (name, email, password) => {
      try {
        const response = await api.post('/auth/register', { name, email, password });
        const { token, user } = response.data;

        await SecureStore.setItemAsync('userToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        dispatch({ type: 'SIGN_UP', payload: { token, user } });
        return user;
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao registrar';
        dispatch({ type: 'ERROR', payload: message });
        throw error;
      }
    },

    requestSignUp: async (email) => {
      try {
        const response = await api.post('/invites/request', { email });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao solicitar cadastro';
        dispatch({ type: 'ERROR', payload: message });
        throw error;
      }
    },

    verifyToken: async (token) => {
      try {
        const response = await api.get(`/invites/verify/${token}`);
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Token inválido ou expirado';
        dispatch({ type: 'ERROR', payload: message });
        throw error;
      }
    },

    completeRegistration: async (token, userData, photoUri) => {
      try {
        const formData = new FormData();
        formData.append('iToken', token);
        formData.append('name', userData.name);
        formData.append('document', userData.document);
        formData.append('phone', userData.phone);
        formData.append('password', userData.password);

        if (photoUri) {
          const filename = photoUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('photo', {
            uri: photoUri,
            name: filename,
            type
          });
        }

        const response = await api.post('/residents/register-with-token', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const { token: authToken, user } = response.data;
        await SecureStore.setItemAsync('userToken', authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        dispatch({ type: 'SIGN_UP', payload: { token: authToken, user } });
        return user;
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao completar cadastro';
        dispatch({ type: 'ERROR', payload: message });
        throw error;
      }
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
        await SecureStore.deleteItemAsync('userToken');
        delete api.defaults.headers.common['Authorization'];
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        dispatch({ type: 'SIGN_OUT' });
      }
    },

    clearError: () => {
      dispatch({ type: 'ERROR', payload: null });
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}
