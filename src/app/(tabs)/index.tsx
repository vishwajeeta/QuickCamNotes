
import { getPhotos, SavedPhoto } from '@/lib/photos';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPhotos = async () => {
        try {
          const savedPhotos = await getPhotos();

          if (active) {
            setPhotos(savedPhotos);
          }
        } catch (error) {
          console.error('Loading photos failed:', error);
          if (active) {
            Alert.alert('Error', 'Unable to load saved photos.');
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadPhotos();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleCapture = () => {
    router.push('/camera');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>QuickCamNotes</Text>
          <Text style={styles.subtitle}>Keep what matters.</Text>
        </View>

        <Pressable
          style={styles.searchButton}
           onPress={() => router.navigate('/explore')}
        >
          <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
      </View>

      {/* Gallery */}
      <View style={styles.gallery}>
        {loading ? (
          <Text style={styles.loadingText}>Loading your photos...</Text>
        ) : photos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.cameraCircle}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Nothing captured yet
            </Text>

            <Text style={styles.emptyDescription}>
              Take a photo of something you want to remember.
            </Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.photoRow}
            contentContainerStyle={styles.photoList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.photoCard}
                onPress={() =>
                  router.push({
                    pathname: '/photo/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />

                {item.note ? (
                  <Text style={styles.photoNote} numberOfLines={2}>
                    {item.note}
                  </Text>
                ) : (
                  <Text style={styles.noNote}>No note added</Text>
                )}
              </Pressable>
            )}
          />
        )}
      </View>

      {/* Capture Button */}
      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.captureButtonPressed,
          ]}
          onPress={handleCapture}
        >
          <Text style={styles.captureIcon}>＋</Text>
          <Text style={styles.captureText}>Capture Photo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 22,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },

  appName: {
    fontSize: 25,
    fontWeight: '700',
    color: '#172033',
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 13,
    color: '#9299A8',
    marginTop: 5,
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  searchIcon: {
    fontSize: 29,
    color: '#34445F',
    lineHeight: 34,
  },

  gallery: {
    flex: 1,
  },

  loadingText: {
    textAlign: 'center',
    color: '#9299A8',
    marginTop: 30,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  cameraCircle: {
    width: 104,
    height: 104,
    borderRadius: 34,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  cameraIcon: {
    fontSize: 43,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#202B40',
    marginBottom: 9,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#9299A8',
    textAlign: 'center',
    lineHeight: 21,
  },

  photoList: {
    paddingBottom: 20,
  },

  photoRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  photoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  photoThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 11,
    backgroundColor: '#EAF1FF',
  },

  photoNote: {
    fontSize: 13,
    color: '#202B40',
    marginTop: 9,
    marginBottom: 5,
    lineHeight: 18,
  },

  noNote: {
    fontSize: 12,
    color: '#9299A8',
    marginTop: 9,
    marginBottom: 5,
  },

  bottom: {
    paddingTop: 16,
    paddingBottom: 20,
  },

  captureButton: {
    height: 58,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  captureButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  captureIcon: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  captureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
