import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getTopPlayers, LeaderboardEntry } from '../services/leaderboard';

const GROUP_LABEL: Record<string, string> = {
  student: '🎓',
  banking: '🏦',
  business: '💼',
  tourism: '✈️',
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

type Props = {
  currentUid: string | null;
};

export default function LeaderboardScreen({ currentUid }: Props) {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await getTopPlayers(20);
      setPlayers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const currentRank = players.findIndex(p => p.id === currentUid) + 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Hạng của mình */}
      {currentUid && currentRank > 0 && (
        <View style={styles.myRankBar}>
          <Text style={styles.myRankText}>
            Hạng của bạn: #{currentRank} · {players[currentRank - 1]?.xp ?? 0} XP
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A527FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😅</Text>
          <Text style={styles.errorText}>Không tải được dữ liệu</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && players.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>Chưa có ai trên bảng xếp hạng{'\n'}Hãy là người đầu tiên!</Text>
        </View>
      )}

      {!loading && !error && players.length > 0 && (
        <FlatList
          data={players}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={styles.listHeader} />}
          renderItem={({ item, index }) => {
            const rank = index + 1;
            const isMe = item.id === currentUid;
            const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : '#CCC';

            return (
              <View style={[styles.row, isMe && styles.rowMe]}>
                {/* Rank */}
                <View style={[styles.rankBadge, rank <= 3 && { backgroundColor: rankColor + '22' }]}>
                  <Text style={[styles.rankText, { color: rank <= 3 ? rankColor : '#AAA' }]}>
                    {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                  </Text>
                </View>

                {/* Name + group */}
                <View style={styles.nameCol}>
                  <Text style={[styles.playerName, isMe && styles.playerNameMe]} numberOfLines={1}>
                    {item.name} {isMe ? '(bạn)' : ''}
                  </Text>
                  <Text style={styles.playerGroup}>
                    {GROUP_LABEL[item.userType] ?? '📚'} · 🔥 {item.streak} ngày
                  </Text>
                </View>

                {/* XP */}
                <View style={styles.xpCol}>
                  <Text style={[styles.xpText, isMe && styles.xpTextMe]}>{item.xp}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#DDE9F5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nikoovers', color: '#1274C6' },
  refreshBtn: { padding: 6 },
  refreshText: { fontSize: 22, color: '#A527FF' },

  myRankBar: {
    backgroundColor: '#A527FF', paddingVertical: 10, paddingHorizontal: 20,
  },
  myRankText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#AAA' },
  errorEmoji: { fontSize: 48 },
  errorText: { fontSize: 16, color: '#888' },
  retryBtn: {
    backgroundColor: '#A527FF', borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 24 },

  list: { paddingHorizontal: 16, paddingBottom: 30 },
  listHeader: { height: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 12,
  },
  rowMe: {
    borderWidth: 2, borderColor: '#A527FF',
    backgroundColor: '#FDF5FF',
  },

  rankBadge: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  rankText: { fontSize: 18, fontWeight: '800' },

  nameCol: { flex: 1, gap: 3 },
  playerName: { fontSize: 15, fontWeight: '700', color: '#222' },
  playerNameMe: { color: '#A527FF' },
  playerGroup: { fontSize: 12, color: '#888' },

  xpCol: { alignItems: 'flex-end' },
  xpText: { fontSize: 20, fontWeight: '800', color: '#1274C6' },
  xpTextMe: { color: '#A527FF' },
  xpLabel: { fontSize: 11, color: '#AAA' },
});
