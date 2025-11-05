import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { colorsFor, useThemeMode } from '../theme';

type block = {
    wattage: number;
    size: number;
}

type column = {
    blocks: block[];
}

const mainpage: React.FC = () => {
    {/*INITIALIZATION*/}
    const { mode } = useThemeMode();
    const styles = useMemo(() => themedStyles(mode), [mode]);

    const [column1, setColumn1] = useState<column>({ blocks: [] });
    const [column2, setColumn2] = useState<column>({ blocks: [] });

    // Only-integer inputs
    const [qty1, setQty1] = useState<string>('');
    const [qty2, setQty2] = useState<string>('');
    const [qty3, setQty3] = useState<string>('');

    // Selections for height-1 blocks
    const [h1Values, setH1Values] = useState<number[]>([]);
    const WATTAGE_OPTIONS = useMemo(() => Array.from({ length: 31 }, (_, i) => i * 10), []);
    const WATTAGE_LABELS = useMemo(() => WATTAGE_OPTIONS.map(String), [WATTAGE_OPTIONS]);

    // NEW: selections for height-2 and height-3 blocks
    const [h2Values, setH2Values] = useState<number[]>([]);
    const [h3Values, setH3Values] = useState<number[]>([]);

    // Keep selection array length in sync with qty1
    useEffect(() => {
        const count = Math.max(0, parseInt(qty1 || '0', 10) || 0);
        setH1Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty1, WATTAGE_OPTIONS]);

    // NEW: keep height-2 values in sync with qty2
    useEffect(() => {
        const count = Math.max(0, parseInt(qty2 || '0', 10) || 0);
        setH2Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty2, WATTAGE_OPTIONS]);

    // NEW: keep height-3 values in sync with qty3
    useEffect(() => {
        const count = Math.max(0, parseInt(qty3 || '0', 10) || 0);
        setH3Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty3, WATTAGE_OPTIONS]);

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            nestedScrollEnabled
        >
            <Text style={styles.title}>CCounter Main Page</Text>
            <TextInput
                style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000' }]}
                placeholder="Quantity of height 1 blocks"
                placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                keyboardType="number-pad"
                inputMode="numeric"
                value={qty1}
                onChangeText={(t) => setQty1(t.replace(/[^0-9]/g, ''))}
            />
            <TextInput
                style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000' }]}
                placeholder="Quantity of height 2 blocks"
                placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                keyboardType="number-pad"
                inputMode="numeric"
                value={qty2}
                onChangeText={(t) => setQty2(t.replace(/[^0-9]/g, ''))}
            />
            <TextInput
                style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000' }]}
                placeholder="Quantity of height 3 blocks"
                placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                keyboardType="number-pad"
                inputMode="numeric"
                value={qty3}
                onChangeText={(t) => setQty3(t.replace(/[^0-9]/g, ''))}
            />

            <View style={[styles.separator, { width: '90%' }]} />
            
            {/* Height 1 Blocks */}
            <View style={styles.optionsContainer}>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: 'bold', width: '100%' }}>
                    Height 1 Block Wattages:
                </Text>

                {h1Values.map((val, idx) => (
                    <View key={`h1-${idx}`} style={styles.pickerWrap}>
                        {/* Plain numeric input for each block */}
                        <TextInput
                            style={[styles.input, styles.wattInput, { textAlign: 'center' }]}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            value={String(h1Values[idx] ?? 0)}
                            onChangeText={(t) => {
                                const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                                setH1Values(prev => {
                                    const next = [...prev];
                                    next[idx] = isNaN(n) ? 0 : n;
                                    return next;
                                });
                            }}
                        />
                    </View>
                ))}
            </View>

            {/* Height 2 */}
            <View style={styles.optionsContainer}>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: 'bold', width: '100%' }}>
                    Height 2 Block Wattages:
                </Text>

                {h2Values.map((val, idx) => (
                    <View key={`h2-${idx}`} style={styles.pickerWrap}>
                        <TextInput
                            style={[styles.input, styles.wattInput, { textAlign: 'center' }]}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            value={String(h2Values[idx] ?? 0)}
                            onChangeText={(t) => {
                                const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                                setH2Values(prev => {
                                    const next = [...prev];
                                    next[idx] = isNaN(n) ? 0 : n;
                                    return next;
                                });
                            }}
                        />
                    </View>
                ))}
            </View>

            {/* Height 3 */}
            <View style={styles.optionsContainer}>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: 'bold', width: '100%' }}>
                    Height 3 Block Wattages:
                </Text>

                {h3Values.map((val, idx) => (
                    <View key={`w3-${idx}`} style={styles.pickerWrap}>
                        <TextInput
                            style={[styles.input, styles.wattInput, { textAlign: 'center' }]}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            value={String(h3Values[idx] ?? 0)}
                            onChangeText={(t) => {
                                const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                                setH3Values(prev => {
                                    const next = [...prev];
                                    next[idx] = isNaN(n) ? 0 : n;
                                    return next;
                                });
                            }}
                        />
                    </View>
                ))}
            </View>

            <Pressable style={styles.button} onPress={() => {
                // Calculation logic to be implemented
            }}>
                <Text style={styles.buttonText}>Schematate</Text>
            </Pressable>

            {/* Table with two columns of blocks organized by wattage descending*/}
            <View style={styles.tableContainer}>
                <View style={styles.column}>

                </View>
                <View style={styles.column}>

                </View>
            </View>

        </ScrollView>
    );
}

const themedStyles = (mode: 'light' | 'dark') => {
  const c = colorsFor(mode);
  return StyleSheet.create({
        
    scroll: {
        flex: 1,
        backgroundColor: c.bg,
        },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: c.card,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        width: '90%',
        gap: 8,
        flexWrap: 'wrap',
    },
    tableContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '90%',
        backgroundColor: c.card,
        minHeight: 100,
    },
    column: {
        width: '40%',
        height: '90%',
        backgroundColor: c.card2,
    },
    pickerWrap: {
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 0,
        gap: 6,
        
    },
    wattInput: {
        width: 30,
        paddingVertical: 6,
        color: mode === 'dark' ? '#fff' : '#000', 
        backgroundColor: c.card2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: c.text,
    },
    link: {
        color: '#007AFF',
        fontSize: 18,
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
    separator: {
        height: 1,
        backgroundColor: mode === 'dark' ? '#666' : '#ddd',
        marginVertical: 1,
    },
    input: {
        width: '90%',
        padding: 8,
        borderRadius: 8,
        backgroundColor: c.card,
    },
    });
};
export default mainpage;