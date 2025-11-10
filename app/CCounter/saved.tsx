import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colorsFor, useThemeMode } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type Schematic = {
    id: number;
    savedAt: string;
    column1: { blocks: { wattage: number; size: number }[] };
    column2: { blocks: { wattage: number; size: number }[] };
    qty1: string;
    qty2: string;
    qty3: string;
    h1Values: number[];
    h2Values: number[];
    h3Values: number[];
};

const SCHEMATICS_KEY = 'savedSchematics';

const SavedPage = () => {
    const { mode } = useThemeMode();
    const styles = themedStyles(mode);
    const c = colorsFor(mode);

    const [schematics, setSchematics] = React.useState<Schematic[]>([]);
    const [selectedSchematicIdx, setSelectedSchematicIdx] = React.useState<number | null>(null);

    // Load saved schematics on focus
    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    const rawSchems = await AsyncStorage.getItem(SCHEMATICS_KEY);
                    const parsed: Schematic[] = rawSchems ? JSON.parse(rawSchems) : [];
                    setSchematics(parsed);
                    if (parsed.length > 0 && selectedSchematicIdx === null) setSelectedSchematicIdx(0);
                } catch (e) {
                    console.warn('Failed to load schematics', e);
                    setSchematics([]);
                }
            };
            loadData();
        }, [selectedSchematicIdx])
    );

    const selectedSchematic = selectedSchematicIdx !== null ? schematics[selectedSchematicIdx] : null;

    const removeSchematic = async (id: number) => {
        setSchematics(prev => {
            const next = prev.filter(s => s.id !== id);
            // persist
            AsyncStorage.setItem(SCHEMATICS_KEY, JSON.stringify(next)).catch(e =>
                console.warn('Failed to persist schematics after delete', e)
            );
            // fix selection
            if (selectedSchematicIdx !== null) {
                const removedIdx = prev.findIndex(s => s.id === id);
                if (removedIdx === selectedSchematicIdx) {
                    setSelectedSchematicIdx(next.length === 0 ? null : 0);
                } else if (removedIdx < selectedSchematicIdx) {
                    setSelectedSchematicIdx(i => (i === null ? i : i - 1));
                }
            }
            return next;
        });
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Saved Schematics</Text>

            <View style={styles.optionsContainer}>
                {schematics.length === 0 && (
                    <Text style={{ color: c.text, fontSize: 18 }}>No schematics saved yet.</Text>
                )}
                {schematics.map((s, idx) => (
                    <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable
                            style={[
                                styles.button,
                                { flex: 1 },
                                selectedSchematicIdx === idx && { backgroundColor: '#0055ff', borderWidth: 2 }
                            ]}
                            onPress={() => setSelectedSchematicIdx(idx)}
                        >
                            <Text style={styles.buttonText}>{new Date(s.savedAt).toLocaleString()}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, { backgroundColor: '#cc3b3b', marginLeft: 6, paddingHorizontal: 12, paddingVertical: 8 }]}
                            onPress={() => removeSchematic(s.id)}
                        >
                            <Ionicons name="trash" size={28} color="#fff" />
                        </Pressable>
                    </View>
                ))}
            </View>

            {selectedSchematic && (
                <View style={[styles.optionsContainer, { alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                    <Text style={{ color: c.text, fontSize: 20, fontWeight: 'bold' }}>
                        Schematic saved {new Date(selectedSchematic.savedAt).toLocaleString()}
                    </Text>
                    <Text style={{ color: c.text }}>
                        Qty: 1P={selectedSchematic.qty1 || 0} 2P={selectedSchematic.qty2 || 0} 3P={selectedSchematic.qty3 || 0}
                    </Text>

                    {/* Visual columns (same style as mainpage) */}
                    {(() => {
                        const col1Units = selectedSchematic.column1.blocks.reduce((s, b) => s + b.size, 0);
                        const col2Units = selectedSchematic.column2.blocks.reduce((s, b) => s + b.size, 0);
                        const MAX_UNITS = Math.max(col1Units, col2Units);
                        return (
                            <View style={styles.tableContainer}>
                                <View style={styles.column}>
                                    {selectedSchematic.column1.blocks.map((b, i) => (
                                        <View key={`sv-c1-${i}`} style={[styles.blockItem, { flexGrow: b.size, flexBasis: 0 }]}>
                                            <Text style={styles.blockItemText}>{b.size}P - {b.wattage}A</Text>
                                        </View>
                                    ))}
                                    {MAX_UNITS > col1Units && (
                                        <View style={{ flexGrow: MAX_UNITS - col1Units, flexBasis: 0 }} />
                                    )}
                                </View>
                                <View style={styles.column}>
                                    {selectedSchematic.column2.blocks.map((b, i) => (
                                        <View key={`sv-c2-${i}`} style={[styles.blockItem, { flexGrow: b.size, flexBasis: 0 }]}>
                                            <Text style={styles.blockItemText}>{b.size}P - {b.wattage}A</Text>
                                        </View>
                                    ))}
                                    {MAX_UNITS > col2Units && (
                                        <View style={{ flexGrow: MAX_UNITS - col2Units, flexBasis: 0 }} />
                                    )}
                                </View>
                            </View>
                        );
                    })()}
                </View>
            )}
        </ScrollView>
    );
};

// Themed styles aligned with mainpage
const themedStyles = (mode: 'light' | 'dark') => {
    const c = colorsFor(mode);
    return StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            backgroundColor: c.bg,
            alignItems: 'center',
            gap: 8,
            minHeight: '100%',
        },
        optionsContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: c.card,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            width: '90%',
            gap: 8,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            marginTop: 8,
            color: c.text,
        },
        button: {
            backgroundColor: '#008AFF',
            paddingVertical: 3,
            paddingHorizontal: 0,
            marginVertical: 4,
            borderRadius: 8,
        },
        buttonText: {
            color: '#fff',
            fontSize: 18,
            textAlign: 'center',
            fontWeight: 'bold',
            padding: 8,
        },
        tableContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            backgroundColor: c.card,
            minHeight: 100,
            marginBottom: 0,
            paddingVertical: 10,
            borderRadius: 8,
        },
        column: {
            width: '40%',
            height: 400,
            backgroundColor: c.card2,
            padding: 6,
            gap: 0,
            borderRadius: 8,
            overflow: 'hidden',
        },
        blockItem: {
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: mode === 'dark' ? '#444' : '#ddd',
            paddingVertical: 0,
            paddingHorizontal: 8,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 0,
        },
        blockItemText: {
            color: mode === 'dark' ? '#fff' : '#000',
            fontWeight: '600',
            paddingVertical: 4,
            fontSize: 16,
        },
    });
};

export default SavedPage;