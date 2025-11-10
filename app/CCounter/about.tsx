import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colorsFor, useThemeMode } from '../theme';

const About = () => {
    const { id } = useLocalSearchParams();
    const { mode } = useThemeMode();
    const styles = themedStyles(mode);
    const c = colorsFor(mode);

    const [showCopied, setShowCopied] = useState(false);
    const [toastMessage, setToastMessage] = useState('Copied');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = async (value: string, label: string) => {
        try {
            await Clipboard.setStringAsync(value);
            setToastMessage(`${label} copied`);
            setShowCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setShowCopied(false), 1400);
        } catch (e) {
            setToastMessage('Copy failed');
            setShowCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setShowCopied(false), 1400);
        }
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topic}>
                <Text style={styles.title}>About Page</Text>
                <Text style={styles.text2}>
                    Hello Chandler, {'\n'}
                    This app was made.{'\n'}
                    I hope you'll share with me that good kush :){'\n'}
                    Lmk if you have any questions or if the app needs an update. 
                </Text>
            </View>
            <View style={styles.topic}>
                <Text style={styles.title}>Found a bug?</Text>
                <Text style={[styles.title, { marginTop: 0 }]}>Recommendations?</Text>
                <Text style={[styles.title, { marginTop: 0 }]}>Questions?</Text>
                <Text style={styles.text2}>
                    Reach out to our skilled team of professionals!{'\n'}
                </Text>
                <View style={{ marginHorizontal: 8, gap: 6 }}>
                    <Pressable onPress={() => copy('zilbert3dward@gmail.com', 'Email')}>
                        <Text style={[styles.text2, styles.link]}>Email: zilbert3dward@gmail.com</Text>
                    </Pressable>
                    <Pressable onPress={() => copy('ezilbert.06', 'Instagram')}>
                        <Text style={[styles.text2, styles.link]}>Insta: ezilbert.06</Text>
                    </Pressable>
                </View>
            </View>

            {showCopied && (
                <View style={styles.toast}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>{toastMessage}</Text>
                </View>
            )}
        </View>
    );
};

const themedStyles = (mode: 'light' | 'dark') => {
    const c = colorsFor(mode);
    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: c.bg,
        },
        title: {
            color: c.text,
            fontSize: 28,
            marginTop: 8,
            marginLeft: 8,
            fontWeight: 'bold',
        },
        text2: {
            color: c.text,
            fontSize: 18,
            margin: 8,
            lineHeight: 25,
        },
        topic: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: c.card,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 16,
            width: '90%',
            borderColor: mode === 'dark' ? '#111' : '#e6e6e6',
            borderWidth: 1,
            gap: 8,
        },
        link: {
            textDecorationLine: 'underline',
        },
        toast: {
            position: 'absolute',
            bottom: 40,
            backgroundColor: '#28a745',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            elevation: 4,
        },
    });
};

export default About;