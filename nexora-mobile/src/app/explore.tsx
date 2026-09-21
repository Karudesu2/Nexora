/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { useTheme } from '@/hooks/use-theme';

interface Lesson {
  id: number;
  title: string;
  lesson_date: string;
  status: string;
  section: string;
  subject?: { name: string };
  grade?: { name: string };
}

export default function LessonsScreen() {
  const { user, request } = useAuth();
  const theme = useTheme();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      setLessons(await request<Lesson[]>('/lessons'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load lessons.');
    }
  }, [request, user]);

  useEffect(() => { void load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!user) {
    return <SafeAreaView style={[styles.safeArea, styles.center, { backgroundColor: theme.background }]}><Text style={[styles.title, { color: theme.text }]}>Your lessons</Text><Text style={[styles.description, { color: theme.textSecondary }]}>Sign in from the Dashboard tab to view your teaching plans.</Text></SafeAreaView>;
  }

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl onRefresh={() => void refresh()} refreshing={refreshing} tintColor="#0284c7" />}><Text style={[styles.eyebrow, { color: '#0284c7' }]}>NEXORA</Text><Text style={[styles.title, { color: theme.text }]}>Lesson planner</Text><Text style={[styles.description, { color: theme.textSecondary }]}>Pull down to refresh your latest lesson plans.</Text>{error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void load()}><Text style={styles.retry}>Try again</Text></Pressable></View> : null}{!error && lessons.length === 0 ? <View style={[styles.emptyCard, { backgroundColor: theme.backgroundElement }]}><Text style={[styles.description, { color: theme.textSecondary }]}>No lesson plans yet. Create the first one in the web planner.</Text></View> : null}{lessons.map((lesson) => <View key={lesson.id} style={[styles.lessonCard, { backgroundColor: theme.backgroundElement }]}><View style={styles.cardHeader}><View style={styles.flex}><Text numberOfLines={1} style={[styles.lessonTitle, { color: theme.text }]}>{lesson.title}</Text><Text style={[styles.metadata, { color: theme.textSecondary }]}>{lesson.lesson_date} · {[lesson.grade?.name, lesson.subject?.name, lesson.section].filter(Boolean).join(' · ')}</Text></View><View style={[styles.status, lesson.status === 'Completed' ? styles.complete : styles.scheduled]}><Text style={[styles.statusText, { color: lesson.status === 'Completed' ? '#047857' : '#0369a1' }]}>{lesson.status}</Text></View></View></View>)}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center', padding: 24 }, content: { gap: 14, padding: 20, paddingBottom: 120 }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 28, fontWeight: '800', marginTop: 5 }, description: { fontSize: 14, lineHeight: 21, marginTop: 7 }, errorBox: { backgroundColor: '#fef2f2', borderRadius: 12, gap: 8, padding: 14 }, error: { color: '#dc2626', fontSize: 14 }, retry: { color: '#0284c7', fontSize: 14, fontWeight: '700' }, emptyCard: { borderRadius: 16, marginTop: 15, padding: 22 }, lessonCard: { borderRadius: 16, marginTop: 2, padding: 16 }, cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 }, flex: { flex: 1 }, lessonTitle: { fontSize: 16, fontWeight: '800' }, metadata: { fontSize: 12, lineHeight: 18, marginTop: 6 }, status: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 }, complete: { backgroundColor: '#d1fae5' }, scheduled: { backgroundColor: '#e0f2fe' }, statusText: { fontSize: 11, fontWeight: '700' },
});
