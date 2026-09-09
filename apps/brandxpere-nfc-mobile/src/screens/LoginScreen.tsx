import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Api } from '../services/api';
import { APP_CONFIG } from '../config/constants';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('brandxper@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const data = await Api.login(email.trim(), password);
      Alert.alert('مرحباً بك', `تم تسجيل الدخول بنجاح: ${data.user.name}`);
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('خطأ في الدخول', err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.brandBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>Brandxpere</Text>
          <Text style={styles.brandSubtitle}>NFC Provisioner & Security Lock</Text>
          <Text style={styles.tagline}>أداة برمجة وحماية كروت الـ NFC برقم سري</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>البريد الإلكتروني للإدارة:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="admin@brandxpere.com"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>كلمة المرور:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#64748B"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>دخول المشرف 🔐</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Brandxpere Smart NFC System • v1.0.0</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.DARK_BG,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: APP_CONFIG.BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: APP_CONFIG.BRAND_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: APP_CONFIG.BRAND_COLOR,
    fontWeight: '700',
    marginTop: 2,
  },
  tagline: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: APP_CONFIG.CARD_BG,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  inputLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'left',
  },
  btn: {
    backgroundColor: APP_CONFIG.BRAND_COLOR,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 32,
  },
});
