import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult, scanFromURLAsync } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';

interface QRScannerProps {
  visible: boolean;
  isProcessing?: boolean;
  onScanned: (value: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ visible, isProcessing = false, onScanned, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const isBusy = scanned || isProcessing || isPickingImage;

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isBusy) return;
    setScanned(true);
    onScanned(result.data);
  };

  const handlePickImage = async () => {
    if (isBusy) return;

    try {
      setIsPickingImage(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền thư viện ảnh', 'Vui lòng cho phép truy cập ảnh để chọn QR đã lưu.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const barcodes = await scanFromURLAsync(result.assets[0].uri, ['qr']);
      const qr = barcodes.find((item) => item.data);
      if (!qr?.data) {
        Alert.alert('Không tìm thấy QR', 'Ảnh đã chọn không có mã QR hợp lệ. Vui lòng chọn ảnh khác.');
        return;
      }

      setScanned(true);
      onScanned(qr.data);
    } catch (error: any) {
      Alert.alert('Không thể quét ảnh', error.message || 'Vui lòng thử lại với ảnh QR khác.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleClose = () => {
    setScanned(false);
    setIsPickingImage(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="scan" size={22} color="#FFFFFF" />
            <Text style={styles.title}>Scan to Check-in</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {!permission ? (
          <View style={styles.centerBox}><ActivityIndicator color={COLORS.primary} /></View>
        ) : !permission.granted ? (
          <View style={styles.centerBox}>
            <Text style={styles.permissionTitle}>Cần quyền camera</Text>
            <Text style={styles.permissionText}>Cho phép truy cập camera để quét mã QR check-in.</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Cấp quyền camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtnLight} onPress={handlePickImage} disabled={isBusy}>
              <View style={styles.galleryRow}>
                <Ionicons name="images-outline" size={18} color={COLORS.primary} />
                <Text style={styles.galleryBtnLightText}>
                  {isPickingImage ? 'Đang quét ảnh...' : 'Chọn ảnh QR từ máy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.scanFrame} />
            <Text style={styles.hint}>Đưa mã QR booking vào khung hình</Text>
            <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage} disabled={isBusy} activeOpacity={0.85}>
              <View style={styles.galleryRow}>
                <Ionicons name="images-outline" size={18} color={COLORS.primary} />
                <Text style={styles.galleryBtnText}>
                  {isPickingImage ? 'Đang quét ảnh...' : 'Chọn ảnh QR từ máy'}
                </Text>
              </View>
            </TouchableOpacity>
            {(scanned || isProcessing || isPickingImage) && (
              <View style={styles.processingBox}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.processingText}>{isPickingImage ? 'Đang quét ảnh...' : 'Đang kiểm tra...'}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: '#111827',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#374151', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  closeText: { color: '#FFFFFF', fontWeight: '700' },
  centerBox: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  permissionText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  permissionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14 },
  permissionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  galleryBtnLight: {
    marginTop: 14, backgroundColor: '#EFF6FF', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  galleryBtnLightText: { color: COLORS.primary, fontWeight: '800' },
  galleryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cameraWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  camera: StyleSheet.absoluteFill,
  scanFrame: {
    width: 250, height: 250, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 28, backgroundColor: 'transparent',
  },
  hint: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
  },
  galleryBtn: {
    marginTop: 16, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 16,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  galleryBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  processingBox: {
    position: 'absolute', bottom: 80, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 16, gap: 10,
  },
  processingText: { color: '#FFFFFF', fontWeight: '700' },
});
