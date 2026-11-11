
import { getPhotos, SavedPhoto } from '@/lib/photos';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();

  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPhotos = async () => {
        try {
          const savedPhotos = await getPhotos();
          if (active) setPhotos(savedPhotos);
        } catch (error) {
          console.error('Loading photos failed:', error);
        }
      };

      loadPhotos();

      return () => {
        active = false;
      };
    }, [])
  );

  const filteredPhotos = photos.filter(photo =>
    photo.note.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Find something you've saved.</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.input}
          placeholder="Search your notes..."
          placeholderTextColor="#9299A8"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredPhotos}
        numColumns={2}
        keyExtractor={item => item.id}
        columnWrapperStyle={styles.photoRow}
        contentContainerStyle={styles.photoList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <Text style={styles.note} numberOfLines={2}>
              {item.note || 'No note added'}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {search.trim() ? '🔎' : '📷'}
            </Text>
            <Text style={styles.emptyTitle}>
              {search.trim() ? 'No matching photos' : 'Nothing to search yet'}
            </Text>
            <Text style={styles.emptyDescription}>
              {search.trim()
                ? 'Try a different word or note.'
                : 'Your saved photos will appear here.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 22,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#172033',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#9299A8',
    marginTop: 5,
    marginBottom: 22,
  },
  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 25,
    color: '#34445F',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#172033',
  },
  clearButton: {
    fontSize: 17,
    color: '#9299A8',
    padding: 5,
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
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 11,
    backgroundColor: '#EAF1FF',
  },
  note: {
    fontSize: 13,
    color: '#202B40',
    marginTop: 9,
    marginBottom: 5,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 90,
    paddingHorizontal: 25,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#202B40',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#9299A8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
