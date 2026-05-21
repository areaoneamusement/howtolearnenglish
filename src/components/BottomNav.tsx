import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TabName = 'home' | 'activity' | 'leaderboard' | 'profile';

const TABS: { id: TabName; icon: string; label: string }[] = [
  { id: 'home',        icon: '🗺️',  label: 'Bản đồ' },
  { id: 'activity',   icon: '🔥',  label: 'Streak' },
  { id: 'leaderboard',icon: '🏆',  label: 'Xếp hạng' },
  { id: 'profile',    icon: '👤',  label: 'Hồ sơ' },
];

type Props = { active: TabName; onPress: (tab: TabName) => void };

export default function BottomNav({ active, onPress }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onPress(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.icon, active === tab.id && styles.iconActive]}>
            {tab.icon}
          </Text>
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
    borderTopColor: '#ECEDF8',
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
  labelActive: { color: '#7B2FBE', fontWeight: '700' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#7B2FBE', marginTop: 2,
  },
});
