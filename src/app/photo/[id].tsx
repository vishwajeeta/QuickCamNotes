
import { deletePhoto, getPhotos, SavedPhoto } from '@/lib/photos';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [photo, setPhoto] = useState<SavedPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        const photos = await getPhotos();
        const selectedPhoto = photos.find(item => item.id === id);
        setPhoto(selectedPhoto ?? null);
      } catch {
        Alert.alert('Error', 'Unable to load this photo.');
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(id);
              router.back();
            } catch {
              Alert.alert('Error', 'Unable to delete this photo.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!photo) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Photo not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Photo Details</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.details}>
          <Text style={styles.note}>
            {photo.note || 'No note added.'}
          </Text>

          <Text style={styles.date}>
            Saved on {new Date(photo.createdAt).toLocaleString()}
          </Text>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Photo</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  backText: {
    fontSize: 16,
    color: '#2563EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  image: {
    width: '100%',
    height: 380,
    backgroundColor: '#F3F4F6',
  },
  details: {
    padding: 22,
  },
  note: {
    fontSize: 16,
    lineHeight: 26,
    color: '#111827',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 16,
  },
  deleteButton: {
    marginTop: 28,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
});
