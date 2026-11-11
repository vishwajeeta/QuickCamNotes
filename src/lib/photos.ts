
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export type SavedPhoto = {
  id: string;
  uri: string;
  note: string;
  createdAt: string;
};

const STORAGE_KEY = 'quickcamnotes:photos';

const photosDirectory = new Directory(Paths.document, 'photos');

export async function getPhotos(): Promise<SavedPhoto[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function savePhoto(
  sourceUri: string,
  note: string = ''
): Promise<SavedPhoto> {
  if (!photosDirectory.exists) {
    photosDirectory.create({
      idempotent: true,
      intermediates: true,
    });
  }

  const id = `${Date.now()}`;
  const destination = new File(photosDirectory, `${id}.jpg`);

  await new File(sourceUri).copy(destination);

  const photo: SavedPhoto = {
    id,
    uri: destination.uri,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  };

  const existingPhotos = await getPhotos();

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([photo, ...existingPhotos])
  );

  return photo;
}

export async function deletePhoto(id: string): Promise<void> {
  const photos = await getPhotos();
  const photo = photos.find(item => item.id === id);

  if (photo) {
    const file = new File(photo.uri);

    if (file.exists) {
      file.delete();
    }
  }

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(photos.filter(item => item.id !== id))
  );
}
