import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NfcEngine } from '../services/nfcEngine';
import { Api, ProfileItem } from '../services/api';
import { Storage } from '../services/storage';
import { APP_CONFIG } from '../config/constants';

export default function WriteCardScreen({ route, navigation }: any) {
  const profile: ProfileItem = route.params?.profile;

  const [writing, setWriting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('اضغط على الزر أدناه لبدء البرمجة والقفل');
  const [completed, setCompleted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    NfcEngine.init().catch((err) => {
      Alert.alert('تنبيه', err.message);
    });
  }, []);

  const handleStartWrite = async () => {
    if (!profile) return;
    setWriting(true);
    setCompleted(false);

    try {
      const pin = await Storage.getMasterPin();
      setStatusMessage('جاري تشغيل مستشعر الـ NFC... اقترب بظهر الهاتف من الكارت');

      const result = await NfcEngine.writeAndLockTag(
        profile.targetUrl,
        pin,
        (step) => setStatusMessage(step)
      );

      // Trigger success haptic vibration
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setStatusMessage('تمت كتابة وقفل الرقاقة بنجاح! جاري الربط بالسيرفر...');

      // Notify Cloud Server
      const apiRes = await Api.confirmWrite({
        profileId: profile.id,
        profileSlug: profile.slug,
        cardId: profile.cardId || undefined,
        nfcUid: result.uid,
        chipType: result.chipType,
        lockType: 'PASSWORD_PROTECTED',
        lockPinUsed: pin,
      });

      setResultData({
        uid: result.uid,
        chipType: result.chipType,
        pin,
        serverMsg: apiRes.message,
      });

      setCompleted(true);
      setStatusMessage('✅ الكارت جاهز ومحمي بالرقم السري بنسبة 100%!');
    } catch (err: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert('فشل في العملية', err.message || 'حدث خطأ أثناء الاتصال بالكارت');
      setStatusMessage('فشلت المحاولة، اضغط لإعادة المحاولة');
    } finally {
      setWriting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Info Header */}
      <View style={styles.headerCard}>
        <Text style={styles.clientLabel}>العميل المستهدف:</Text>
        <Text style={styles.clientName}>{profile.name}</Text>
        <Text style={styles.clientSub}>{profile.jobTitle} • {profile.company}</Text>
        <View style={styles.urlPill}>
          <Text style={styles.urlPillText} numberOfLines={1}>{profile.targetUrl}</Text>
        </View>
      </View>

      {/* Main NFC Action Area */}
      <View style={styles.centerArea}>
        <View style={[styles.pulseCircle, writing && styles.pulseActive]}>
          <Text style={styles.nfcIcon}>{writing ? '📡' : completed ? '🛡️' : '📲'}</Text>
        </View>

        <Text style={styles.statusTitle}>
          {writing ? 'ضع ظهر الهاتف على الكارت' : completed ? 'تمت الحماية والبرمجة!' : 'جاهز للبرمجة والقفل'}
        </Text>

        <Text style={styles.statusDesc}>{statusMessage}</Text>

        {completed && resultData && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLine}>🔑 نوع الحماية: <Text style={styles.bold}>Write-Password Protected</Text></Text>
            <Text style={styles.resultLine}>🏷️ معرف الرقاقة: <Text style={styles.bold}>{resultData.uid}</Text></Text>
            <Text style={styles.resultLine}>⚡ نوع الشريحة: <Text style={styles.bold}>{resultData.chipType}</Text></Text>
            <Text style={styles.shieldNotice}>
              🛡️ لن يتمكن أي شخص عبر NFC Tools أو أي تطبيق آخر من مسح أو تغيير هذا الكارت دون الرقم السري الخاص بكم.
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        {!completed ? (
          <TouchableOpacity
            style={[styles.writeBtn, writing && styles.writeBtnDisabled]}
            onPress={handleStartWrite}
            disabled={writing}
          >
            {writing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.writeBtnText}>ابدأ البرمجة والقفل برقم سري ⚡</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>تم • العودة لقائمة الكروت</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.DARK_BG,
    justifyContent: 'space-between',
  },
  headerCard: {
    backgroundColor: APP_CONFIG.CARD_BG,
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'flex-end',
  },
  clientLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  clientName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  clientSub: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  urlPill: {
    backgroundColor: '#090D16',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  urlPillText: {
    color: '#38BDF8',
    fontSize: 11,
    textAlign: 'left',
  },
  centerArea: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: APP_CONFIG.CARD_BG,
    borderWidth: 2,
    borderColor: APP_CONFIG.BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: APP_CONFIG.BRAND_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  pulseActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  nfcIcon: {
    fontSize: 48,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  resultBox: {
    backgroundColor: APP_CONFIG.CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  resultLine: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  shieldNotice: {
    color: '#A7F3D0',
    fontSize: 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    lineHeight: 14,
    textAlign: 'right',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: APP_CONFIG.CARD_BG,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  writeBtn: {
    backgroundColor: APP_CONFIG.BRAND_COLOR,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  writeBtnDisabled: {
    opacity: 0.6,
  },
  writeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  doneBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
