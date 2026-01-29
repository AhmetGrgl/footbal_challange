import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests(),
      ]);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.secondary]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('friends')}</Text>
        <Ionicons name="people" size={32} color={Colors.accent} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            {t('myFriends')} ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            {t('friendRequests')} ({friendRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'friends' ? (
            friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={80} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No friends yet</Text>
              </View>
            ) : (
              friends.map((friend) => (
                <View key={friend.user_id} style={styles.friendCard}>
                  <View style={styles.friendInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{friend.name[0].toUpperCase()}</Text>
                    </View>
                    <View style={styles.friendDetails}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStats}>
                        {friend.stats?.wins || 0}W / {friend.stats?.losses || 0}L
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.inviteButton}>
                    <Ionicons name="game-controller" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : friendRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={80} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          ) : (
            friendRequests.map((request) => (
              <View key={request.request_id} style={styles.requestCard}>
                <View style={styles.friendInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {request.sender?.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{request.sender?.name || 'Unknown'}</Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.request_id)}
                  >
                    <Ionicons name="checkmark" size={20} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                    <Ionicons name="close" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  activeTab: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.accent,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  friendStats: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
});
