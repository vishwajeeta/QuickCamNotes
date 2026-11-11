
import { savePhoto } from '@/lib/photos';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const takePhoto = async () => {
    if (!cameraRef.current || takingPhoto) return;

    try {
      setTakingPhoto(true);

      const result = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });

      if (result?.uri) {
        setPhoto(result.uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera error', 'Unable to capture photo.');
    } finally {
      setTakingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!photo || saving) return;

    try {
      setSaving(true);
      await savePhoto(photo, note);
      router.back();
    } catch (error) {
      console.error('Photo save error:', error);
      Alert.alert('Unable to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Allow camera access to capture photos.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={styles.preview}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.preview}
          facing="back"
        />
      )}

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {photo ? 'Preview Photo' : 'Take a Photo'}
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.controls}>
  {!photo ? (
    <Pressable
      style={styles.captureOuter}
      onPress={takePhoto}
      disabled={takingPhoto}
    >
      {takingPhoto ? (
        <ActivityIndicator color="#2563EB" size="large" />
      ) : (
        <View style={styles.captureInner} />
      )}
    </Pressable>
  ) : (
    <View style={styles.previewActions}>
      <TextInput
        style={styles.noteInput}
        placeholder="What do you want to remember? (Optional)"
        placeholderTextColor="#9299A8"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={300}
      />

      <View style={styles.actionButtons}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            setPhoto(null);
            setNote('');
          }}
          disabled={saving}
        >
          <Text style={styles.secondaryText}>Retake</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>✓ Save Photo</Text>
          )}
        </Pressable>
      </View>
    </View>
  )}
</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  preview: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  headerSpace: {
    width: 44,
  },

 controls: {
  position: 'absolute',
  bottom: 40,
  left: 0,
  right: 0,
  width: '100%',
  paddingHorizontal: 22,
  alignItems: 'center',
  zIndex: 10,
  elevation: 10,
},
  previewActions: {
    width: '100%',
    flexDirection: 'column',
  },

  noteInput: {
    width: '100%',
    minHeight: 58,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#202B40',
    marginBottom: 14,
  },

  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryText: {
    color: '#26344D',
    fontSize: 16,
    fontWeight: '600',
  },

  primaryButton: {
    flex: 1.4,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.7,
  },

 captureOuter: {
  width: 84,
  height: 84,
  borderRadius: 42,
  borderWidth: 5,
  borderColor: '#FFFFFF',
  backgroundColor: 'rgba(255,255,255,0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
},

captureInner: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#FFFFFF',
},

  center: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 14,
  },

  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172033',
  },

  permissionText: {
    fontSize: 14,
    color: '#9299A8',
    textAlign: 'center',
  },

  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  backText: {
    color: '#2563EB',
    marginTop: 8,
  },
});
