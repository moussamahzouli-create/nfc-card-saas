import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { NfcEngine, TagDiagnostic } from '../services/nfcEngine';
import { Storage } from '../services/storage';
import { APP_CONFIG } from '../config/constants';

export default function TagInspectorScreen() {
  const [scanning, setScanning] = useState(false);
  const [tagData, setTagData] = useState<TagDiagnostic | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await NfcEngine.inspectTag();
      setTagData(data);
    } catch (err: any) {
      Alert.alert('فشل القراءة', err.message || 'تعذر قراءة الكارت');
    } finally {
      setScanning(false);
    }
  };

  const handleUnlock = async () => {
    if (!tagData) return;
    setUnlocking(true);
    try {
      const pin = await Storage.getMasterPin();
      const success = await NfcEngine.unlockTag(pin);
      if (success) {
        Alert.alert('تم بنجاح', 'تمت إزالة الرقم السري وفك قفل الكارت، يمكنك الآن إعادة برمجته بحرية');
        handleScan();
      } else {
        Alert.alert('خطأ', 'الرقم السري غير متطابق مع هذا الكارت');
      }
    } catch (err: any) {
      Alert.alert('فشل فك القفل', err.message);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>فاحص وتشخيص كروت NFC 🔍</Text>
        <Text style={styles.desc}>
          المس أي كارت لمعرفة نوع الرقاقة، الرابط المخزن فيه، وحالة القفل بالأمان.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnActive]}
        onPress={handleScan}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.scanBtnText}>افحص كارت NFC الآن 📲</Text>
        )}
      </TouchableOpacity>

      {tagData && (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeader}>بيانات الرقاقة المكتشفة:</Text>

          <View style={styles.row}>
            <Text style={styles.val}>{tagData.uid}</Text>
            <Text style={styles.label}>معرف الـ UID:</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.val}>{tagData.chipType}</Text>
            <Text style={styles.label}>نوع الرقاقة:</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.val}>{tagData.userMemoryBytes} بايت</Text>
            <Text style={styles.label}>سعة الذاكرة:</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.val, tagData.isPasswordProtected ? styles.protected : styles.unprotected]}>
              {tagData.isPasswordProtected ? '🔒 محمي برقم سري (Write-Protected)' : '🔓 مفتوح وغير محمي'}
            </Text>
            <Text style={styles.label}>حالة الأمان:</Text>
          </View>

          <View style={styles.urlBox}>
            <Text style={styles.urlLabel}>الرابط الحالي المكتوب على الكارت:</Text>
            <Text style={styles.urlText}>{tagData.currentUrl || 'لا يوجد رابط مسجل'}</Text>
          </View>

          {tagData.isPasswordProtected && (
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.unlockBtnText}>إزالة الرقم السري وفك القفل 🔓</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.DARK_BG,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  desc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'right',
  },
  scanBtn: {
    backgroundColor: APP_CONFIG.BRAND_COLOR,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanBtnActive: {
    opacity: 0.7,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: APP_CONFIG.CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
  },
  val: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  protected: {
    color: '#4ADE80',
  },
  unprotected: {
    color: '#FACC15',
  },
  urlBox: {
    backgroundColor: '#090D16',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  urlLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'right',
  },
  urlText: {
    color: '#38BDF8',
    fontSize: 12,
  },
  unlockBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
