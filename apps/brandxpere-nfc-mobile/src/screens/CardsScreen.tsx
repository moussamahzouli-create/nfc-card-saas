import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { Api, ProfileItem } from '../services/api';
import { APP_CONFIG } from '../config/constants';

export default function CardsScreen({ navigation }: any) {
  const [items, setItems] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const data = await Api.getCards(filter, search);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [filter]);

  const handleSearch = () => {
    setLoading(true);
    loadData();
  };

  const renderCard = ({ item }: { item: ProfileItem }) => {
    const isPending = item.status === 'PENDING';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, isPending ? styles.badgePending : styles.badgeActive]}>
            <Text style={[styles.badgeText, isPending ? styles.textPending : styles.textActive]}>
              {isPending ? '⏳ بانتظار البرمجة' : '✅ مبرمج ومحمي'}
            </Text>
          </View>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>

        <Text style={styles.cardSubtitle}>
          {item.jobTitle} • {item.company}
        </Text>

        <View style={styles.urlBox}>
          <Text style={styles.urlText} numberOfLines={1}>
            {item.targetUrl}
          </Text>
        </View>

        {item.nfcUid && (
          <Text style={styles.uidText}>NFC UID: {item.nfcUid}</Text>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, isPending ? styles.actionBtnPending : styles.actionBtnActive]}
          onPress={() => navigation.navigate('WriteCard', { profile: item })}
        >
          <Text style={styles.actionBtnText}>
            {isPending ? 'برمجة وقفل الكارت الآن ⚡' : 'إعادة برمجة الكارت 🔄'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Filters */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث عن عميل أو بروفايل..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <View style={styles.filterRow}>
          {[
            { key: 'pending', label: 'كروت جديدة (غير مبرمجة)' },
            { key: 'active', label: 'كروت مفعلة' },
            { key: 'all', label: 'الكل' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key as any)}
            >
              <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={APP_CONFIG.BRAND_COLOR} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📇</Text>
          <Text style={styles.emptyTitle}>لا توجد بطاقات مطابقة</Text>
          <Text style={styles.emptyDesc}>اسحب للأسفل للتحديث أو غيّر خيارات البحث</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              tintColor={APP_CONFIG.BRAND_COLOR}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.DARK_BG,
  },
  topBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: APP_CONFIG.CARD_BG,
  },
  searchInput: {
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#090D16',
  },
  filterBtnActive: {
    backgroundColor: APP_CONFIG.BRAND_COLOR,
  },
  filterBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: APP_CONFIG.CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginBottom: 8,
  },
  urlBox: {
    backgroundColor: '#090D16',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  urlText: {
    color: '#38BDF8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  uidText: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textPending: {
    color: '#FACC15',
  },
  textActive: {
    color: '#4ADE80',
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnPending: {
    backgroundColor: APP_CONFIG.BRAND_COLOR,
  },
  actionBtnActive: {
    backgroundColor: '#1E293B',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
