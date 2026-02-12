/**
 * CameraScreen — capture moments with GPS overlay
 */
import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { CaptureResult, RootStackParamList } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function CameraScreen() {
    const navigation = useNavigation<NavProp>();
    const cameraRef = useRef<CameraView>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPermission, setLocationPermission] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [isCapturing, setIsCapturing] = useState(false);

    // Request permissions
    useEffect(() => {
        (async () => {
            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status === 'granted');

            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setCurrentLocation(location);

                // Reverse geocode
                try {
                    const [place] = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    if (place) {
                        const parts = [place.name, place.city, place.country].filter(Boolean);
                        setLocationName(parts.join(', '));
                    }
                } catch {
                    setLocationName(
                        `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                    );
                }
            }
        })();
    }, []);

    const handleCapture = async () => {
        if (!cameraRef.current || isCapturing) return;

        setIsCapturing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.9,
                skipProcessing: false,
            });

            if (!photo) {
                Alert.alert('Error', 'Failed to capture photo');
                setIsCapturing(false);
                return;
            }

            const capture: CaptureResult = {
                uri: photo.uri,
                width: photo.width,
                height: photo.height,
                latitude: currentLocation?.coords.latitude || 0,
                longitude: currentLocation?.coords.longitude || 0,
                locationName: locationName,
                timestamp: Date.now(),
            };

            navigation.navigate('MintScreen', { capture });
        } catch (e: any) {
            Alert.alert('Capture Error', e.message);
        } finally {
            setIsCapturing(false);
        }
    };

    if (!cameraPermission?.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionIcon}>📷</Text>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        SolFLux needs camera access to capture moments
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestCameraPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Access</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            >
                {/* GPS Overlay */}
                <View style={styles.overlay}>
                    {/* Top info */}
                    <View style={styles.topBar}>
                        <View style={styles.gpsBadge}>
                            <Text style={styles.gpsIcon}>📍</Text>
                            <Text style={styles.gpsText}>{locationName}</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Text style={styles.timeText}>
                                {new Date().toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Coordinates */}
                    {currentLocation && (
                        <View style={styles.coordsBadge}>
                            <Text style={styles.coordsText}>
                                {currentLocation.coords.latitude.toFixed(6)},{' '}
                                {currentLocation.coords.longitude.toFixed(6)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Capture button area */}
                <View style={styles.captureArea}>
                    <TouchableOpacity
                        style={[
                            styles.captureButton,
                            isCapturing && styles.captureButtonActive,
                        ]}
                        onPress={handleCapture}
                        disabled={isCapturing}
                        activeOpacity={0.7}
                    >
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    <Text style={styles.captureHint}>Tap to capture your moment</Text>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        padding: spacing.md,
        paddingTop: spacing.xl + spacing.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gpsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        maxWidth: '65%',
    },
    gpsIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    gpsText: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontWeight: '500',
    },
    timeBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    timeText: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontWeight: '600',
    },
    coordsBadge: {
        alignSelf: 'flex-start',
        marginTop: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    coordsText: {
        color: colors.textSecondary,
        fontSize: typography.size.xs,
        fontFamily: 'monospace',
    },
    captureArea: {
        alignItems: 'center',
        paddingBottom: spacing.xxl + spacing.lg,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    captureButtonActive: {
        borderColor: colors.primary,
        transform: [{ scale: 0.95 }],
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.textPrimary,
    },
    captureHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: typography.size.sm,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    permissionTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.xl,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    permissionText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    permissionButton: {
        backgroundColor: colors.primaryMuted,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    permissionButtonText: {
        color: colors.primary,
        fontSize: typography.size.md,
        fontWeight: '600',
    },
});
