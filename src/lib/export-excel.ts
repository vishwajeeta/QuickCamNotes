
import type { SavedPhoto } from '@/lib/photos';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const FILE_NAME = 'QuickCamNotes-Export.xlsx';

function createExcelBase64(photos: SavedPhoto[]): string {
  if (photos.length === 0) {
    throw new Error('No photos available to export.');
  }

  const rows = photos.map((photo, index) => ({
    'No.': index + 1,
    'Photo ID': photo.id,
    'Note': photo.note || 'No note',
    'Date Created': new Date(photo.createdAt).toLocaleString(),
    'Photo Filename': `${photo.id}.jpg`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set readable column widths.
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 45 },
    { wch: 24 },
    { wch: 24 },
  ];

  // Enable filters on the header row.
  if (worksheet['!ref']) {
    worksheet['!autofilter'] = {
      ref: worksheet['!ref'],
    };
  }

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Saved Photos'
  );

  return XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'base64',
  });
}

export async function exportPhotosToExcel(
  photos: SavedPhoto[]
): Promise<void> {
  const base64 = createExcelBase64(photos);

  const fileUri = `${FileSystem.cacheDirectory}${FILE_NAME}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Export QuickCamNotes',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
  });
}

export async function savePhotosExcelToDevice(
  photos: SavedPhoto[]
): Promise<void> {
  const base64 = createExcelBase64(photos);

  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  const fileUri =
    await FileSystem.StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      FILE_NAME,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
}


// import type { SavedPhoto } from '@/lib/photos';
// import { File, Paths } from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import * as XLSX from 'xlsx';

// export async function exportPhotosToExcel(
//   photos: SavedPhoto[]
// ): Promise<void> {
//   if (photos.length === 0) {
//     throw new Error('No photos available to export.');
//   }

//   const rows = photos.map((photo) => ({
//     'Photo ID': photo.id,
//     'Note': photo.note || '',
//     'Date Created': new Date(photo.createdAt).toLocaleString(),
//     'Photo URI': photo.uri,
//   }));

//   const worksheet = XLSX.utils.json_to_sheet(rows);
//   const workbook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(workbook, worksheet, 'My Photos');

//   const excelData = XLSX.write(workbook, {
//     bookType: 'xlsx',
//     type: 'array',
//   });

//   const file = new File(Paths.cache, 'QuickCamNotes-Export.xlsx');

//   file.create({ overwrite: true });
//   await file.write(excelData);

//   const available = await Sharing.isAvailableAsync();

//   if (!available) {
//     throw new Error('Sharing is not available on this device.');
//   }

//   await Sharing.shareAsync(file.uri, {
//     mimeType:
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     dialogTitle: 'Export QuickCamNotes',
//     UTI: 'org.openxmlformats.spreadsheetml.sheet',
//   });
// }
