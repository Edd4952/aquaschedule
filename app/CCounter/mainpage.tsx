import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // NEW
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colorsFor, useThemeMode } from '../theme';

type block = {
    wattage: number;
    size: number;
}

type column = {
    blocks: block[];
}

type Schematic = {
    id: number;
    savedAt: string;
    column1: column;
    column2: column;
    qty1: string;
    qty2: string;
    qty3: string;
    h1Values: number[];
    h2Values: number[];
    h3Values: number[];
};

const mainpage: React.FC = () => {
    {/*INITIALIZATION*/}
    const { mode } = useThemeMode();
    const styles = useMemo(() => themedStyles(mode), [mode]);
    const c = colorsFor(mode);

    const [column1, setColumn1] = useState<column>({ blocks: [] });
    const [column2, setColumn2] = useState<column>({ blocks: [] });

    // Toast for save confirmation
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (msg: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastMessage(msg);
        setShowSavedToast(true);
        toastTimerRef.current = setTimeout(() => setShowSavedToast(false), 1400);
    };

    useEffect(() => {
        return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
    }, []);

    // NEW: persistence
    const [hydrated, setHydrated] = useState(false);
    const PERSIST_KEY = 'CCounter:state:v1';

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

    // NEW: visual "zoom" in px
    const [columnHeight, setColumnHeight] = useState(400);

    // NEW: schematics storage key
    const SCHEMATICS_KEY = 'savedSchematics'; // NEW

    // Hydrate from storage once
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(PERSIST_KEY);
                if (!raw) { setHydrated(true); return; }
                const data = JSON.parse(raw);
                const toNums = (arr: any): number[] =>
                    Array.isArray(arr) ? arr.map((n: any) => Number(n) || 0) : [];

                setQty1(data?.qty1 != null ? String(data.qty1) : '');
                setQty2(data?.qty2 != null ? String(data.qty2) : '');
                setQty3(data?.qty3 != null ? String(data.qty3) : '');

                setH1Values(toNums(data?.h1Values));
                setH2Values(toNums(data?.h2Values));
                setH3Values(toNums(data?.h3Values));

                if (data?.column1?.blocks) setColumn1({ blocks: toNums(data.column1.blocks?.map((b: any) => b.wattage)).map((w, i) => ({
                    wattage: w, size: Number(data.column1.blocks[i]?.size) || 1
                })) });
                if (data?.column2?.blocks) setColumn2({ blocks: toNums(data.column2.blocks?.map((b: any) => b.wattage)).map((w, i) => ({
                    wattage: w, size: Number(data.column2.blocks[i]?.size) || 1
                })) });
            } catch (e) {
                console.warn('Persist load failed', e);
            } finally {
                setHydrated(true);
            }
        })();
    }, []);

    // Keep selection array length in sync with qty1
    useEffect(() => {
        if (!hydrated) return; // avoid fighting with hydration
        const count = Math.max(0, parseInt(qty1 || '0', 10) || 0);
        setH1Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty1, WATTAGE_OPTIONS, hydrated]);

    // keep height-2 values in sync with qty2
    useEffect(() => {
        if (!hydrated) return;
        const count = Math.max(0, parseInt(qty2 || '0', 10) || 0);
        setH2Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty2, WATTAGE_OPTIONS, hydrated]);

    // keep height-3 values in sync with qty3
    useEffect(() => {
        if (!hydrated) return;
        const count = Math.max(0, parseInt(qty3 || '0', 10) || 0);
        setH3Values(prev => {
            const next = prev.slice(0, count);
            while (next.length < count) next.push(WATTAGE_OPTIONS[0]);
            return next;
        });
    }, [qty3, WATTAGE_OPTIONS, hydrated]);

    // Persist whenever any relevant state changes
    useEffect(() => {
        if (!hydrated) return;
        const snapshot = {
            qty1, qty2, qty3,
            h1Values, h2Values, h3Values,
            column1, column2,
        };
        AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot))
            .catch(e => console.warn('Persist save failed', e));
    }, [qty1, qty2, qty3, h1Values, h2Values, h3Values, column1, column2, hydrated]);

    // NEW: build a single list of all blocks and sort: highest wattage first, then largest height
    const allBlocksSorted = useMemo<block[]>(() => {
        const list: block[] = [
            ...h1Values.map(w => ({ wattage: Number(w) || 0, size: 1 })),
            ...h2Values.map(w => ({ wattage: Number(w) || 0, size: 2 })),
            ...h3Values.map(w => ({ wattage: Number(w) || 0, size: 3 })),
        ];
        list.sort((a, b) => {
            if (b.wattage !== a.wattage) return b.wattage - a.wattage; // wattage desc
            return b.size - a.size; // height desc on ties
        });
        return list;
    }, [h1Values, h2Values, h3Values]);

    // NEW: sort into two columns
    const sort = () => {
        const blocks = allBlocksSorted;
        const totalHeight = blocks.reduce((s, b) => s + b.size, 0);
        const cap1 = Math.ceil(totalHeight / 2);
        const cap2 = totalHeight - cap1;
        const col1: block[] = [];
        const col2: block[] = [];
        let h1 = 0, h2 = 0;
        let amp1 = 0, amp2 = 0;

        const place = (target: 1 | 2, blk: block) => {
            if (target === 1) {
                col1.push(blk);
                h1 += blk.size;
                amp1 += blk.wattage;
            } else {
                col2.push(blk);
                h2 += blk.size;
                amp2 += blk.wattage;
            }
        };

        for (const blk of blocks) {
            const can1 = h1 + blk.size <= cap1;
            const can2 = h2 + blk.size <= cap2;
            const diff = amp1 - amp2;
            const diffIfCol1 = Math.abs((amp1 + blk.wattage) - amp2);
            const diffIfCol2 = Math.abs(amp1 - (amp2 + blk.wattage));
            // if col1amp>col2amp, there is space in col2 and adding blk to col2 evens amps more
            if (diff > 0 && can2 && (!can1 || diffIfCol2 < diffIfCol1)) {
                place(2, blk);
                continue;
            }
            // if col2amp>col1amp, there is space in col1 and adding blk to col1 evens amps more
            if (diff < 0 && can1 && (!can2 || diffIfCol1 < diffIfCol2)) {
                place(1, blk);
                continue;
            }
            //if both are open
            if (can1 && can2) {
                //if they are even before the placement
                if (diffIfCol1 === diffIfCol2) {
                    
                    const remain1 = cap1 - (h1 + blk.size);
                    const remain2 = cap2 - (h2 + blk.size);
                    place(remain1 >= remain2 ? 1 : 2, blk);
                } else {
                    place(diffIfCol1 <= diffIfCol2 ? 1 : 2, blk);
                }
            } else if (can1 || can2) {
                place(can1 ? 1 : 2, blk);
            } else {
                place(diffIfCol1 <= diffIfCol2 ? 1 : 2, blk);
            }
        }

        setColumn1({ blocks: col1 });
        setColumn2({ blocks: col2 });

        const optimizeColumns = () => {
            let improved = true;
            while (improved) {
                improved = false;
                const baseDiff = Math.abs(
                    col1.reduce((s, b) => s + b.wattage, 0) -
                    col2.reduce((s, b) => s + b.wattage, 0)
                );
                for (let i = col1.length - 1; i >= 0; i--) {
                    for (let j = col2.length - 1; j >= 0; j--) {
                        const a = col1[i], b = col2[j];
                        if (a.size !== b.size) continue;
                        const diffAfterSwap = Math.abs(
                            (col1.reduce((s, blk, idx) => s + (idx === i ? b.wattage : blk.wattage), 0)) -
                            (col2.reduce((s, blk, idx) => s + (idx === j ? a.wattage : blk.wattage), 0))
                        );
                        if (diffAfterSwap < baseDiff) {
                            col1[i] = b;
                            col2[j] = a;
                            improved = true;
                        }
                    }
                }
            }
            setColumn1({ blocks: [...col1] });
            setColumn2({ blocks: [...col2] });
        };

        optimizeColumns();
    };

    // NEW: visualization metrics for fixed-height columns with proportional blocks

    const col1Units = useMemo(() => column1.blocks.reduce((s, b) => s + b.size, 0), [column1]);
    const col2Units = useMemo(() => column2.blocks.reduce((s, b) => s + b.size, 0), [column2]);
    const MAX_UNITS = Math.max(col1Units, col2Units);

    const saveSchematic = async () => {
        const haveInputs =
            (h1Values.length + h2Values.length + h3Values.length) > 0;

        // If user hasn’t generated columns yet, build them now
        if ((column1.blocks.length === 0 && column2.blocks.length === 0) && haveInputs) {
            sort(); // populate columns from current inputs
        }

        // Re-evaluate after potential sort()
        const c1Empty = column1.blocks.length === 0;
        const c2Empty = column2.blocks.length === 0;
        if (c1Empty && c2Empty) {
            Alert.alert('Nothing to save', 'Add ampacities and quantities first.');
            return;
        }

        const schematic: Schematic = {
            id: Date.now(),
            savedAt: new Date().toISOString(),
            column1,
            column2,
            qty1,
            qty2,
            qty3,
            h1Values,
            h2Values,
            h3Values,
        };
        try {
            const raw = await AsyncStorage.getItem(SCHEMATICS_KEY);
            const list = raw ? JSON.parse(raw) : [];
            list.unshift(schematic);
            await AsyncStorage.setItem(SCHEMATICS_KEY, JSON.stringify(list));
            // Popup message
            showToast('Schematic saved');
        } catch (e) {
            console.warn('Save schematic failed', e);
            Alert.alert('Save failed', 'Could not save the schematic.');
        }
    };

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            nestedScrollEnabled
        >
            <Text style={[styles.title, { alignSelf: 'flex-start', width: '90%', textAlign: 'left', marginLeft: 20, marginTop: 4 }]}>Input</Text>
            <Text style={[styles.title, { alignSelf: 'flex-start', width: '90%', textAlign: 'left', marginLeft: 20, fontSize: 16 }]}>Quantity</Text>
            <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput
                    style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000', flex: 1, marginRight: 6 }]}
                    placeholder="# of 1 poles"
                    placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={qty1}
                    onChangeText={(t) => setQty1(t.replace(/[^0-9]/g, ''))}
                />
                <TextInput
                    style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000', flex: 1, marginHorizontal: 6 }]}
                    placeholder="# of 2 poles"
                    placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={qty2}
                    onChangeText={(t) => setQty2(t.replace(/[^0-9]/g, ''))}
                />
                <TextInput
                    style={[styles.input, { color: mode === 'dark' ? '#fff' : '#000', flex: 1, marginLeft: 6 }]}
                    placeholder="# of 3 poles"
                    placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={qty3}
                    onChangeText={(t) => setQty3(t.replace(/[^0-9]/g, ''))}
                />
            </View>

            <View style={[styles.separator, { width: '90%' }]} />
            <Text style={[styles.title, { alignSelf: 'flex-start', width: '90%', textAlign: 'left', marginLeft: 20, fontSize: 16 }]}>Ampacities</Text>
            
            {/* Height 1 Blocks */}
            <View style={styles.optionsContainer}>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: 'bold', width: '100%' }}>
                    1 pole block ampacity:
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
                    2 pole block ampacity:
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
                    3 pole block ampacity:
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
            <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between' }}>
                
                <Pressable style={[styles.button, { flex: 1, marginHorizontal: 4 }]} onPress={sort}>
                    <Text style={styles.buttonText}>Schematate</Text>
                </Pressable>
                
                <Pressable
                    style={[styles.button, { backgroundColor: '#cc3b3b', flex: 1, marginHorizontal: 4 }]}
                    onPress={async () => {
                        await AsyncStorage.removeItem(PERSIST_KEY);
                        setQty1(''); setQty2(''); setQty3('');
                        setH1Values([]); setH2Values([]); setH3Values([]);
                        setColumn1({ blocks: [] }); setColumn2({ blocks: [] });
                    }}>
                    <Text style={styles.buttonText}>Clear Saved</Text>
                </Pressable>
                
            </View>
            {/* Zoom controls */}
            <View style={{ flexDirection: 'row', width: '90%', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000', marginRight: 8 }}>Block size:</Text>
                <Pressable
                    style={[styles.button, { paddingVertical: 12, paddingHorizontal: 16, marginRight: 6, backgroundColor: c.card }]}
                    onPress={() => setColumnHeight(h => Math.max(200, h - 50))}
                >
                    <Ionicons name="remove" size={20} color="#fff" />
                </Pressable>
                <Pressable
                    style={[styles.button, { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8, backgroundColor: c.card }]}
                    onPress={() => setColumnHeight(h => Math.min(1200, h + 50))}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </Pressable>
                <Text style={{ color: mode === 'dark' ? '#fff' : '#000' }}>{columnHeight}px</Text>
            </View>
            {/* Table with two columns of blocks organized by wattage descending*/}
            <View style={[styles.tableContainer]}>
                <View style={[styles.column, { height: columnHeight }]}>
                    {column1.blocks.map((b, i) => (
                        <View
                            key={`c1-${i}`}
                            style={[
                                styles.blockItem,
                                { flexGrow: b.size, flexBasis: 0 },
                            ]}
                        >
                            <Text style={styles.blockItemText}>
                                {b.size}P - {b.wattage}A
                            </Text>
                        </View>
                    ))}
                    {MAX_UNITS > col1Units && (
                        <View style={{ flexGrow: MAX_UNITS - col1Units, flexBasis: 0 }} />
                    )}
                </View>
                <View style={[styles.column, { height: columnHeight }]}>
                    {column2.blocks.map((b, i) => (
                        <View
                            key={`c2-${i}`}
                            style={[
                                styles.blockItem,
                                { flexGrow: b.size, flexBasis: 0 },
                            ]}
                        >
                            <Text style={styles.blockItemText}>
                                {b.size}P - {b.wattage}A
                            </Text>
                        </View>
                    ))}
                    {MAX_UNITS > col2Units && (
                        <View style={{ flexGrow: MAX_UNITS - col2Units, flexBasis: 0 }} />
                    )}
                </View>
                
            </View>
            {/* Total amps per column */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '90%' }}>
                <View style={{ }}>
                    <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: '700' }}>Column 1</Text>
                    <Text style={{ color: mode === 'dark' ? '#fff' : '#000' }}>
                        {column1.blocks.reduce((sum, block) => sum + (block?.wattage ?? 0), 0)}A
                    </Text>
                </View>
                <View style={{ }}>
                    <Text style={{ color: mode === 'dark' ? '#fff' : '#000', fontWeight: '700' }}>Column 2</Text>
                    <Text style={{ color: mode === 'dark' ? '#fff' : '#000' }}>
                        {column2.blocks.reduce((sum, block) => sum + (block?.wattage ?? 0), 0)}A
                    </Text>
                </View>
            </View>
            {/* save button */}
            <Pressable
                style={[styles.button, { backgroundColor: '#27a745', flex: 1, marginHorizontal: 4, marginBottom: 8 }]}
                onPress={saveSchematic}
            >
                <Text style={styles.buttonText}>Save Schematic</Text>
            </Pressable>

            {showSavedToast && (
                <View style={styles.toast}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>{toastMessage}</Text>
                </View>
            )}
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
        marginBottom: 0,
        paddingVertical: 10,
    },
    column: {
        width: '40%',
        height: 400, // fixed height to match COLUMN_FIXED_HEIGHT
        backgroundColor: c.card2,
        padding: 6,
        gap: 0, // no gaps so unit heights stay exact
        borderRadius: 8,
        overflow: 'hidden',
    },
    pickerWrap: {
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 0,
        gap: 6,
        
    },
    wattInput: {
        width: 40,
        paddingVertical: 6,
        color: mode === 'dark' ? '#fff' : '#000', 
        backgroundColor: c.card2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: c.text,
    },
    // wattInput: {
    //     width: 40,
    //     paddingVertical: 6,
    //     color: mode === 'dark' ? '#fff' : '#000', 
    //     backgroundColor: c.card2,
    // },
    // title: {
    //     fontSize: 28,
    //     fontWeight: 'bold',
    //     color: c.text,
    // },
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
    blockItem: {
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#444' : '#ddd',
        // Critical: no vertical padding so flex-based heights remain proportional
        paddingVertical: 0,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0, // allow flex to control height fully
    },
    blockItemText: {
        color: mode === 'dark' ? '#fff' : '#000',
        fontWeight: '600',
        paddingVertical: 4,
        fontSize: 16, // make label more legible
    },
    toast: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 4,
    },
    });
};
export default mainpage;