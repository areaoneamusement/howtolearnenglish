import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TabName = 'home' | 'activity' | 'leaderboard' | 'friends' | 'profile';

const TABS: { id: TabName; icon: string; label: string }[] = [
  { id: 'home',        icon: '🗺️',  label: 'Bản đồ' },
  { id: 'activity',   icon: '🔥',  label: 'Streak' },
  { id: 'leaderboard',icon: '🏆',  label: 'Xếp hạng' },
  { id: 'friends',    icon: '👥',  label: 'Bạn bè' },
  { id: 'profile',    icon: '👤',  label: 'Hồ sơ' },
];

type Props = {
  active: TabName;
  onPress: (tab: TabName) => void;
  friendBadge?: boolean;
};

export default function BottomNav({ active, onPress, friendBadge }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onPress(tab.id)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={[styles.icon, active === tab.id && styles.iconActive]}>
              {tab.icon}
            </Text>
            {tab.id === 'friends' && friendBadge && (
              <View style={styles.badge} />
            )}
          </View>
          <Text style={[styles.label, active === tab.id && styles.labelActive]}>
            {tab.label}
          </Text>
          {active === tab.id && <View style={styles.activeDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#DDE9F5',
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  icon: { fontSize: 24, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: '#AAA', fontWeight: '500' },
  labelActive: { color: '#A527FF', fontWeight: '700' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#A527FF', marginTop: 2,
  },
  badge: {
    position: 'absolute', top: -2, right: -4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#FF6B6B', borderWidth: 2, borderColor: '#fff',
  },
});


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#DDE9F5',
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  icon: { fontSize: 24, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: '#AAA', fontWeight: '500' },
  labelActive: { color: '#A527FF', fontWeight: '700' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#A527FF', marginTop: 2,
  },
});
