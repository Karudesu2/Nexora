/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { useTheme } from '@/hooks/use-theme';

interface Lesson {
  id: number;
  title: string;
  lesson_date: string;
  status: string;
  subject?: { name: string };
  grade?: { name: string };
}

interface DashboardData {
  stats: {
    total_lessons: number;
    completed_lessons: number;
    pending_lessons: number;
    competencies: number;
    assessments: number;
  };
  today: { date: string; lessons: Lesson[] };
  upcoming_lessons: Lesson[];
}

function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}><View style={styles.loginWrap}><View style={styles.brandMark}><Text style={styles.brandIcon}>N</Text></View><Text style={[styles.eyebrow, { color: '#0284c7' }]}>NEXORA</Text><Text style={[styles.title, { color: theme.text }]}>Plan. Align. Teach.</Text><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to keep your teaching plans connected.</Text><View style={styles.form}><Text style={[styles.label, { color: theme.text }]}>Email</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="teacher@school.edu" placeholderTextColor={theme.textSecondary} style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]} value={email} /><Text style={[styles.label, { color: theme.text }]}>Password</Text><TextInput autoComplete="password" onChangeText={setPassword} placeholder="Your password" placeholderTextColor={theme.textSecondary} secureTextEntry style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]} value={password} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable disabled={isSubmitting} onPress={() => void submit()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.disabled]}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}</Pressable></View></View></SafeAreaView>;
}

function DashboardScreen() {
  const { request, user, logout } = useAuth();
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      setDashboard(await request<DashboardData>('/dashboard'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.');
    }
  };

  useEffect(() => { void loadDashboard(); }, []);

  if (!dashboard && !error) {
    return <SafeAreaView style={[styles.safeArea, styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color="#0284c7" /><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Loading your dashboard…</Text></SafeAreaView>;
  }

  const progress = dashboard?.stats.total_lessons ? Math.round((dashboard.stats.completed_lessons / dashboard.stats.total_lessons) * 100) : 0;
  const todayLesson = dashboard?.today.lessons[0] || dashboard?.upcoming_lessons[0];

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}><ScrollView contentContainerStyle={styles.dashboardContent}><View style={styles.topRow}><View><Text style={[styles.eyebrow, { color: '#0284c7' }]}>NEXORA</Text><Text style={[styles.greeting, { color: theme.text }]}>Good day, {user?.name}.</Text><Text style={[styles.smallText, { color: theme.textSecondary }]}>Your teaching overview</Text></View><Pressable onPress={() => void logout()} style={[styles.outlineButton, { borderColor: theme.backgroundSelected }]}><Text style={[styles.outlineButtonText, { color: theme.text }]}>Sign out</Text></Pressable></View>{error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void loadDashboard()}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}{dashboard ? <><View style={styles.statsGrid}>{[["Completed", dashboard.stats.completed_lessons, '#10b981'], ["Remaining", dashboard.stats.pending_lessons, '#f59e0b'], ["Assessments", dashboard.stats.assessments, '#8b5cf6'], ["Coverage", `${progress}%`, '#0284c7']].map(([label, value, color]) => <View key={String(label)} style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}><Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text><Text style={[styles.statValue, { color: String(color) }]}>{value}</Text></View>)}</View><View style={[styles.lessonCard, { backgroundColor: theme.backgroundElement }]}><Text style={[styles.cardEyebrow, { color: theme.textSecondary }]}>TODAY’S LESSON</Text>{todayLesson ? <><Text style={[styles.lessonTitle, { color: theme.text }]}>{todayLesson.title}</Text><Text style={[styles.smallText, { color: theme.textSecondary }]}>{[todayLesson.grade?.name, todayLesson.subject?.name].filter(Boolean).join(' · ')}</Text><View style={styles.status}><Text style={styles.statusText}>{todayLesson.status}</Text></View></> : <Text style={[styles.smallText, { color: theme.textSecondary }]}>No lesson is scheduled. Use the web planner to create one.</Text>}</View><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming lessons</Text><Text style={[styles.smallText, { color: theme.textSecondary }]}>{dashboard.today.date}</Text></View><View style={[styles.listCard, { backgroundColor: theme.backgroundElement }]}>{dashboard.upcoming_lessons.slice(0, 5).map((lesson) => <View key={lesson.id} style={[styles.listItem, { borderBottomColor: theme.backgroundSelected }]}><View style={styles.datePill}><Text style={styles.datePillText}>{lesson.lesson_date.slice(5).replace('-', '/')}</Text></View><View style={styles.flex}><Text numberOfLines={1} style={[styles.listTitle, { color: theme.text }]}>{lesson.title}</Text><Text style={[styles.smallText, { color: theme.textSecondary }]}>{lesson.subject?.name || 'Lesson'}</Text></View></View>)}{dashboard.upcoming_lessons.length === 0 ? <Text style={[styles.empty, { color: theme.textSecondary }]}>No upcoming lessons.</Text> : null}</View></> : null}</ScrollView></SafeAreaView>;
}

export default function HomeScreen() {
  const { user } = useAuth();
  return user ? <DashboardScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center', gap: 12 }, loginWrap: { flex: 1, justifyContent: 'center', padding: 24 }, brandMark: { alignItems: 'center', backgroundColor: '#0284c7', borderRadius: 16, height: 56, justifyContent: 'center', marginBottom: 24, width: 56 }, brandIcon: { color: '#fff', fontSize: 28, fontWeight: '800' }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 32, fontWeight: '800', marginTop: 8 }, subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 }, form: { gap: 10, marginTop: 36 }, label: { fontSize: 14, fontWeight: '700', marginTop: 6 }, input: { borderRadius: 12, borderWidth: 1, fontSize: 16, padding: 14 }, primaryButton: { alignItems: 'center', backgroundColor: '#0284c7', borderRadius: 12, justifyContent: 'center', marginTop: 14, minHeight: 50 }, primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }, pressed: { opacity: 0.82 }, disabled: { opacity: 0.6 }, error: { color: '#dc2626', fontSize: 14, lineHeight: 20 }, dashboardContent: { gap: 18, padding: 20, paddingBottom: 120 }, topRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, greeting: { fontSize: 26, fontWeight: '800', marginTop: 4 }, smallText: { fontSize: 13, lineHeight: 19 }, outlineButton: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 }, outlineButtonText: { fontSize: 12, fontWeight: '700' }, errorBox: { backgroundColor: '#fef2f2', borderRadius: 12, gap: 8, padding: 14 }, retry: { color: '#0284c7', fontSize: 14, fontWeight: '700' }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, statCard: { borderRadius: 14, flexGrow: 1, minWidth: '45%', padding: 16 }, statLabel: { fontSize: 12, fontWeight: '600' }, statValue: { fontSize: 28, fontWeight: '800', marginTop: 8 }, lessonCard: { borderRadius: 18, padding: 20 }, cardEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, lessonTitle: { fontSize: 21, fontWeight: '800', marginTop: 10 }, status: { alignSelf: 'flex-start', backgroundColor: '#d1fae5', borderRadius: 999, marginTop: 14, paddingHorizontal: 10, paddingVertical: 5 }, statusText: { color: '#047857', fontSize: 12, fontWeight: '700' }, sectionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }, sectionTitle: { fontSize: 18, fontWeight: '800' }, listCard: { borderRadius: 16, overflow: 'hidden' }, listItem: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, padding: 14 }, datePill: { backgroundColor: '#e0f2fe', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 7 }, datePillText: { color: '#0369a1', fontSize: 11, fontWeight: '800' }, flex: { flex: 1 }, listTitle: { fontSize: 14, fontWeight: '700' }, empty: { padding: 22, textAlign: 'center' },
});
