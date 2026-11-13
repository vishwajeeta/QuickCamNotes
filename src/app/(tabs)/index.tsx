
import { getPhotos, SavedPhoto } from '@/lib/photos';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exportPhotosToExcel, savePhotosExcelToDevice, } from '@/lib/export-excel';
import type { ExportProgress } from '@/lib/export-word';
import { exportPhotosToWord } from '@/lib/export-word';

export default function HomeScreen() {
  const router = useRouter();

  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] =
  useState<ExportProgress | null>(null);

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

  // const handleExport = () => {
  //   Alert.alert('Export Photos', 'Choose an export format', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Excel (.xlsx)',
  //       onPress: async () => {
  //         try {
  //           await exportPhotosToExcel(photos);
  //         } catch (error) {
  //           console.error('Excel export failed:', error);
  //           Alert.alert('Export failed', 'Unable to export your photos.');
  //         }
  //       },
  //     },
  //     {
  //       text: 'Save to device',
  //       onPress: async () => {
  //         try {
  //           await savePhotosExcelToDevice(photos);
  //           Alert.alert('Done', 'Excel file saved to your selected folder.');
  //         } catch (error) {
  //           console.error('Excel save failed:', error);
  //           Alert.alert('Save failed', 'Unable to save the Excel file.');
  //         }
  //       },
  //     },
  //   ]);
  // };


const handleExport = () => {
  setExportMenuVisible(true);
};

const handleExcelExport = async () => {
  setExportMenuVisible(false);
    setExporting(true);

  try {
    await exportPhotosToExcel(photos);
  } catch (error) {
    console.error('Excel export failed:', error);
    Alert.alert('Export failed', 'Unable to export your photos.');
  } finally {
    setExporting(false);
  }
};

const handleExcelSave = async () => {
  setExportMenuVisible(false);

  try {
    await savePhotosExcelToDevice(photos);
    Alert.alert('Done', 'Excel file saved to your selected folder.');
  } catch (error) {
    console.error('Excel save failed:', error);
    Alert.alert('Save failed', 'Unable to save the Excel file.');
  }
};

// const handleWordExport = async () => {
//   setExportMenuVisible(false);
//   setExporting(true);

//     setExportProgress({
//     current: 0,
//     total: photos.length,
//     stage: 'photos',
//   });
//   try {
//     await exportPhotosToWord(photos);
//   } catch (error) {
//     console.error('Word export failed:', error);
//     Alert.alert('Export failed', 'Unable to export the Word document.');
//   } finally {
//     setExporting(false);
//      setExportProgress(null);
//   }
// };

const handleWordExport = async () => {
  setExportMenuVisible(false);
  setExporting(true);

  setExportProgress({
    current: 0,
    total: photos.length,
    stage: 'photos',
  });

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    await exportPhotosToWord(photos, async (progress) => {
      setExportProgress(progress);

      // Give React Native time to render the updated progress.
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  } catch (error) {
    console.error('Word export failed:', error);
    Alert.alert('Export failed', 'Unable to export the Word document.');
  } finally {
    setExporting(false);
    setExportProgress(null);
  }
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
        <Pressable
          style={styles.searchButton}
          onPress={handleExport}
        >
          <Text style={styles.searchIcon}>⋮</Text>
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


      <Modal
  visible={exportMenuVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setExportMenuVisible(false)}
>
  <View style={styles.modalOverlay}>
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => setExportMenuVisible(false)}
    />

    <View style={styles.exportCard}>
      <Text style={styles.exportTitle}>Export Photos</Text>
      <Text style={styles.exportSubtitle}>
        Choose your preferred format
      </Text>

      <Pressable
        style={styles.exportOption}
        onPress={handleExcelExport}
      >
        <Text style={styles.exportOptionTitle}>Excel (.xlsx)</Text>
        <Text style={styles.exportOptionDescription}>
          Share your photo details in a spreadsheet
        </Text>
      </Pressable>

      <Pressable
        style={styles.exportOption}
        onPress={handleExcelSave}
      >
        <Text style={styles.exportOptionTitle}>
          Save Excel to device
        </Text>
        <Text style={styles.exportOptionDescription}>
          Choose a folder to save your spreadsheet
        </Text>
      </Pressable>

      <Pressable
        style={styles.exportOption}
        onPress={handleWordExport}
      >
        <Text style={styles.exportOptionTitle}>Word (.docx)</Text>
        <Text style={styles.exportOptionDescription}>
          Export photos with notes and dates
        </Text>
      </Pressable>

      <Pressable
        style={styles.cancelOption}
        onPress={() => setExportMenuVisible(false)}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  </View>
</Modal>
<Modal
  visible={exporting}
  transparent
  animationType="fade"
>
  <View style={styles.loadingOverlay}>
    {/* <View style={styles.loadingCard}>
      <ActivityIndicator size="large" color="#2563EB" />

      <Text style={styles.loadingTitle}>
        Preparing your Export...
      </Text>

      <Text style={styles.loadingDescription}>
        Adding your photos, notes and dates. This may take a little time.
      </Text>
    </View> */}
    <View style={styles.loadingCard}>
  <ActivityIndicator size="large" color="#2563EB" />

  <Text style={styles.loadingTitle}>
    Preparing your Export...
  </Text>

  {exportProgress && (
    <>
      <Text style={styles.loadingDescription}>
        {exportProgress.stage === 'photos'
          ? `Processing photo ${exportProgress.current} of ${exportProgress.total}`
          : exportProgress.stage === 'document'
          ? 'Creating your Word document...'
          : exportProgress.stage === 'saving'
          ? 'Saving your document...'
          : 'Preparing sharing options...'}
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                exportProgress.stage === 'photos'
                  ? (exportProgress.current / exportProgress.total) * 85
                  : exportProgress.stage === 'document'
                  ? 90
                  : exportProgress.stage === 'saving'
                  ? 95
                  : 100
              }%`,
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>
        {exportProgress.stage === 'photos'
          ? `${Math.round(
              (exportProgress.current / exportProgress.total) * 85
            )}%`
          : exportProgress.stage === 'document'
          ? '90%'
          : exportProgress.stage === 'saving'
          ? '95%'
          : '100%'}
      </Text>
    </>
  )}
</View>
  </View>
</Modal>

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
    gap: 10,
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

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},

exportCard: {
  width: '100%',
  maxWidth: 380,
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  padding: 22,
},

exportTitle: {
  fontSize: 21,
  fontWeight: '700',
  color: '#172033',
},

exportSubtitle: {
  fontSize: 13,
  color: '#9299A8',
  marginTop: 6,
  marginBottom: 18,
},

exportOption: {
  paddingVertical: 15,
  paddingHorizontal: 14,
  backgroundColor: '#F8F9FC',
  borderRadius: 13,
  marginBottom: 10,
},

exportOptionTitle: {
  fontSize: 15,
  fontWeight: '600',
  color: '#202B40',
},

exportOptionDescription: {
  fontSize: 12,
  color: '#9299A8',
  marginTop: 5,
},

cancelOption: {
  alignItems: 'center',
  paddingVertical: 13,
  marginTop: 4,
},

cancelText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#2563EB',
},






loadingOverlay: {
  flex: 1,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},

loadingCard: {
  width: '100%',
  maxWidth: 320,
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 28,
  alignItems: 'center',
},

loadingTitle: {
  fontSize: 17,
  fontWeight: '700',
  color: '#172033',
  marginTop: 20,
},

loadingDescription: {
  fontSize: 13,
  color: '#9299A8',
  textAlign: 'center',
  lineHeight: 20,
  marginTop: 9,
},







progressTrack: {
  width: '100%',
  height: 8,
  backgroundColor: '#E5E7EB',
  borderRadius: 10,
  overflow: 'hidden',
  marginTop: 22,
},

progressFill: {
  height: '100%',
  backgroundColor: '#2563EB',
  borderRadius: 10,
},

progressText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#2563EB',
  marginTop: 9,
},
});
