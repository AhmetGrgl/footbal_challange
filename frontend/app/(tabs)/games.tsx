import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSounds } from '../../contexts/SoundContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { api } from '../../services/api';

const HOME_BG = require('../../assets/images/home-bg.jpg');

// Lig ikonları
const LEAGUE_ICONS: { [key: string]: string } = {
  'Bronze': '🥉',
  'Silver': '🥈',
  'Gold': '🥇',
  'Platinum': '💎',
  'Diamond': '💠',
  'Legend': '🏆',
};

export default function GamesScreen() {
  const { user } = useAuth();
  const { playClick } = useSounds();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'tasks' | 'shop'>('leaderboard');
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'daily' | 'weekly' | 'friends'>('global');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [jokerShop, setJokerShop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [activeTab, leaderboardType]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leaderboard') {
        let data;
        if (leaderboardType === 'global') {
          data = await api.getGlobalLeaderboard();
        } else if (leaderboardType === 'friends') {
          data = await api.getFriendsLeaderboard();
        } else {
          data = await api.getGlobalLeaderboard(); // Fallback
        }
        setLeaderboard(data || []);
      } else if (activeTab === 'tasks') {
        const tasks = await api.getDailyTasks();
        setDailyTasks(tasks || []);
      } else if (activeTab === 'shop') {
        const shop = await api.getJokerShop();
        setJokerShop(shop || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const claimTaskReward = async (taskId: string) => {
    playClick();
    try {
      await api.claimTaskReward(taskId);
      loadData();
    } catch (error: any) {
      console.error('Claim error:', error);
    }
  };
  
  const buyJoker = async (jokerId: string) => {
    playClick();
    try {
      await api.buyJoker(jokerId);
      // Refresh user data
    } catch (error: any) {
      console.error('Buy error:', error);
    }
  };
  
  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      {/* Leaderboard Type Selector */}
      <View style={styles.typeSelector}>
        {(['global', 'daily', 'weekly', 'friends'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, leaderboardType === type && styles.typeButtonActive]}
            onPress={() => { playClick(); setLeaderboardType(type); }}
          >
            <Text style={[styles.typeButtonText, leaderboardType === type && styles.typeButtonTextActive]}>
              {type === 'global' ? 'Genel' : type === 'daily' ? 'Günlük' : type === 'weekly' ? 'Haftalık' : 'Arkadaşlar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Leaderboard List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
      ) : (
        <ScrollView style={styles.leaderboardList}>
          {leaderboard.map((player, index) => (
            <Animatable.View
              key={player.user_id}
              animation="fadeInUp"
              delay={index * 50}
              style={[
                styles.leaderboardItem,
                index === 0 && styles.leaderboardFirst,
                index === 1 && styles.leaderboardSecond,
                index === 2 && styles.leaderboardThird,
                player.is_me && styles.leaderboardMe,
              ]}
            >
              {/* Rank */}
              <View style={styles.rankContainer}>
                {index < 3 ? (
                  <Text style={styles.rankEmoji}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </Text>
                ) : (
                  <Text style={styles.rankNumber}>{player.rank_position}</Text>
                )}
              </View>
              
              {/* Avatar & Name */}
              <View style={styles.playerInfo}>
                <Text style={styles.playerAvatar}>{player.avatar || '⚽'}</Text>
                <View>
                  <Text style={styles.playerName}>{player.username || player.name}</Text>
                  <Text style={styles.playerLeague}>
                    {LEAGUE_ICONS[player.stats?.rank] || '🥉'} {player.stats?.rank || 'Bronze'}
                  </Text>
                </View>
              </View>
              
              {/* Points */}
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsValue}>{player.stats?.points || 0}</Text>
                <Text style={styles.pointsLabel}>puan</Text>
              </View>
            </Animatable.View>
          ))}
          
          {leaderboard.length === 0 && (
            <Text style={styles.emptyText}>Henüz veri yok</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
  
  const renderDailyTasks = () => (
    <View style={styles.tabContent}>
      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>📋 Günlük Görevler</Text>
        <Text style={styles.tasksSubtitle}>Görevleri tamamla, ödül kazan!</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
      ) : (
        <ScrollView style={styles.tasksList}>
          {dailyTasks.map((task, index) => (
            <Animatable.View
              key={task.task_id}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.taskItem}
            >
              <LinearGradient
                colors={task.completed ? ['#2E7D32', '#1B5E20'] : ['#37474F', '#263238']}
                style={styles.taskGradient}
              >
                <View style={styles.taskInfo}>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min(100, (task.current / task.target) * 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{task.current}/{task.target}</Text>
                  </View>
                </View>
                
                <View style={styles.taskReward}>
                  <Text style={styles.rewardText}>🪙 {task.reward_coins}</Text>
                  <Text style={styles.rewardText}>⭐ {task.reward_xp}</Text>
                  
                  {task.completed && !task.claimed ? (
                    <TouchableOpacity 
                      style={styles.claimButton}
                      onPress={() => claimTaskReward(task.task_id)}
                    >
                      <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.claimGradient}>
                        <Text style={styles.claimText}>Al</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : task.claimed ? (
                    <Text style={styles.claimedText}>✓ Alındı</Text>
                  ) : null}
                </View>
              </LinearGradient>
            </Animatable.View>
          ))}
          
          {dailyTasks.length === 0 && (
            <Text style={styles.emptyText}>Bugün için görev yok</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
  
  const renderShop = () => (
    <View style={styles.tabContent}>
      <View style={styles.shopHeader}>
        <Text style={styles.shopTitle}>🛒 Joker Mağazası</Text>
        <View style={styles.coinsDisplay}>
          <Text style={styles.coinsText}>🪙 {user?.coins || 0}</Text>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
      ) : (
        <ScrollView style={styles.shopList}>
          {jokerShop.map((item, index) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.shopItem}
            >
              <LinearGradient
                colors={['#4A148C', '#311B92']}
                style={styles.shopGradient}
              >
                <View style={styles.jokerIconContainer}>
                  <Text style={styles.jokerIcon}>
                    {item.id === 'time_extend' ? '⏳' : 
                     item.id === 'eliminate_two' ? '❌' : 
                     item.id === 'reveal_letter' ? '👁️' : '🔄'}
                  </Text>
                </View>
                
                <View style={styles.shopItemInfo}>
                  <Text style={styles.shopItemName}>{item.name}</Text>
                  <Text style={styles.shopItemDesc}>{item.description}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={() => buyJoker(item.id)}
                >
                  <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.buyGradient}>
                    <Text style={styles.buyText}>🪙 {item.price_coins}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
  
  return (
    <ImageBackground source={HOME_BG} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎮 Oyunlar</Text>
        </View>
        
        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
            onPress={() => { playClick(); setActiveTab('leaderboard'); }}
          >
            <Text style={styles.tabIcon}>🏆</Text>
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>Sıralama</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
            onPress={() => { playClick(); setActiveTab('tasks'); }}
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Görevler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'shop' && styles.tabButtonActive]}
            onPress={() => { playClick(); setActiveTab('shop'); }}
          >
            <Text style={styles.tabIcon}>🛒</Text>
            <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>Mağaza</Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
        >
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'tasks' && renderDailyTasks()}
          {activeTab === 'shop' && renderShop()}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,15,30,0.85)' },
  
  header: { paddingTop: 50, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFD700' },
  
  // Tabs
  tabSelector: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 10 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 12, marginHorizontal: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabButtonActive: { backgroundColor: 'rgba(255,215,0,0.3)' },
  tabIcon: { fontSize: 24 },
  tabText: { fontSize: 12, color: '#888', marginTop: 4 },
  tabTextActive: { color: '#FFD700', fontWeight: 'bold' },
  
  tabContent: { flex: 1, paddingHorizontal: 12 },
  
  // Leaderboard
  typeSelector: { flexDirection: 'row', marginBottom: 12 },
  typeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', marginHorizontal: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  typeButtonActive: { backgroundColor: '#4CAF50' },
  typeButtonText: { fontSize: 12, color: '#888' },
  typeButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  
  leaderboardList: { flex: 1 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4, padding: 12, borderRadius: 12 },
  leaderboardFirst: { backgroundColor: 'rgba(255,215,0,0.2)', borderWidth: 2, borderColor: '#FFD700' },
  leaderboardSecond: { backgroundColor: 'rgba(192,192,192,0.2)' },
  leaderboardThird: { backgroundColor: 'rgba(205,127,50,0.2)' },
  leaderboardMe: { borderWidth: 2, borderColor: '#4CAF50' },
  
  rankContainer: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 28 },
  rankNumber: { fontSize: 18, fontWeight: 'bold', color: '#888' },
  
  playerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  playerAvatar: { fontSize: 30, marginRight: 10 },
  playerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  playerLeague: { fontSize: 12, color: '#888' },
  
  pointsContainer: { alignItems: 'flex-end' },
  pointsValue: { fontSize: 20, fontWeight: '900', color: '#FFD700' },
  pointsLabel: { fontSize: 10, color: '#888' },
  
  // Tasks
  tasksHeader: { alignItems: 'center', marginBottom: 16 },
  tasksTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700' },
  tasksSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  
  tasksList: { flex: 1 },
  taskItem: { marginVertical: 6 },
  taskGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
  taskInfo: { flex: 1 },
  taskDescription: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  taskProgress: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressBar: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginRight: 10 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#888' },
  
  taskReward: { alignItems: 'flex-end' },
  rewardText: { fontSize: 12, color: '#FFD700' },
  claimButton: { marginTop: 8, borderRadius: 8, overflow: 'hidden' },
  claimGradient: { paddingHorizontal: 16, paddingVertical: 6 },
  claimText: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' },
  claimedText: { fontSize: 12, color: '#4CAF50', marginTop: 8 },
  
  // Shop
  shopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  shopTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700' },
  coinsDisplay: { backgroundColor: 'rgba(255,215,0,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  coinsText: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  
  shopList: { flex: 1 },
  shopItem: { marginVertical: 6 },
  shopGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
  jokerIconContainer: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  jokerIcon: { fontSize: 28 },
  shopItemInfo: { flex: 1, marginLeft: 12 },
  shopItemName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  shopItemDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  buyButton: { borderRadius: 10, overflow: 'hidden' },
  buyGradient: { paddingHorizontal: 16, paddingVertical: 10 },
  buyText: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' },
  
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50, fontSize: 16 },
});
