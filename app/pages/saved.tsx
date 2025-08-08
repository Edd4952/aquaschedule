import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Employee = {
    id: number;
    name: string;
    numShifts: number;
    daysCantWork: number[];
};

type Day = {
    shortDate: string;
    date: string;
    AMshift: number[];
    PMshift: number[];
};

type Schedule = {
    employees: Employee[];
    week1: Day[];
    week2: Day[];
    savedAt: string; // ISO string
};

const SCHEDULES_KEY = 'savedSchedules';

//
function generateWeek(startDate: Date): Day[] {
    return Array.from({ length: 7 }).map((_, idx) => {
        const date1 = new Date(startDate);
        date1.setDate(startDate.getDate() + idx);
        return {
            shortDate: `${date1.getMonth() + 1}/${date1.getDate()}`, // e.g., "8/5"
            date: date1.toISOString().slice(0, 10),             // e.g., "2024-08-05"
            AMshift: [-1],
            PMshift: [-1],
        };
    });
}

const week1 = generateWeek(new Date("2024-08-05")); // Replace with your actual week start date
const week2 = generateWeek(new Date("2024-08-12")); // Next week, for example

const schedule: Schedule = {
    employees: [], // your employees array
    week1,
    week2,
    savedAt: new Date().toISOString(),
};
//
const SavedPage = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    // Modal state for swap
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedShiftInfo, setSelectedShiftInfo] = useState<{
        employeeIdx: number;
        week: 1 | 2;
        dayIdx: number;
        shiftType: 'AM' | 'PM';
        date: Date;
    } | null>(null);
    const [selectedEmployeeIdx, setSelectedEmployeeIdx] = useState<number | null>(null);

    // Modal state for delete confirmation
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [scheduleToDeleteIdx, setScheduleToDeleteIdx] = useState<number | null>(null);

    // Load all saved schedules when page is focused
    useFocusEffect(
        React.useCallback(() => {
            const loadSchedules = async () => {
                const raw = await AsyncStorage.getItem(SCHEDULES_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    console.log(parsed);
                    setSchedules(parsed);
                }
            };
            loadSchedules();
        }, [])
    );

    // Viewer for the selected schedule
    const selectedSchedule = selectedIdx !== null ? schedules[selectedIdx] : null;

    // Swap handler for long press
    const handleLongPress = (
        employeeIdx: number,
        week: 1 | 2,
        dayIdx: number,
        shiftType: 'AM' | 'PM',
        shiftDate: Date
    ) => {
        setSelectedShiftInfo({ employeeIdx, week, dayIdx, shiftType, date: shiftDate });
        setModalVisible(true);
    };

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (schedules.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }}>
                <Text style={{ color: 'white', fontSize: 22, textAlign: 'center', width: '80%' }}>
                    No saved schedules yet. Create a schedule first, and save it.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
        >
            <Text style={styles.title}>Saved Schedules</Text>
            <View style={styles.optionsContainer}>
                {schedules.map((sched, idx) => (
                    <View key={sched.savedAt} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable
                            style={[
                                styles.button,
                                selectedIdx === idx && styles.selectedSchedule
                            ]}
                            onPress={() => setSelectedIdx(idx)}
                        >
                            <Text style={styles.buttonText}>
                                {new Date(sched.savedAt).toLocaleString()}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={{
                                flex: 0.9,
                                paddingVertical: 8,
                                backgroundColor: '#c00',
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                setScheduleToDeleteIdx(idx);
                                setDeleteModalVisible(true);
                            }}
                        >
                            <Ionicons name="trash" size={25} color="#fff" />
                        </Pressable>
                    </View>
                ))}
            </View>
            
            {selectedSchedule ? (
                <View style={[styles.scheduleContainer, { marginBottom: 10 }]}>
                    {/* Timestamp only when a schedule is open */}
                    <View style={[styles.optionsContainer, {width: '100%', marginBottom: 8, borderRadius: 0}]}>
                        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', paddingVertical: 4 }}>
                            Up to date {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                        </Text>
                    </View>
                    {/* week 1 */}
                    <View style={styles.weekContainer}>
                        {selectedSchedule.week1.map((item, idx) => {
                            // Use fullDate to get the day of the week
                            const dateObj = new Date(item.date);
                            const dayOfWeek = !isNaN(dateObj.getTime()) ? daysOfWeek[dateObj.getDay()] : '';
                            
                            return (
                                <View key={idx} style={styles.dayContainer}>
                                    <Text style={{color: 'white', fontSize: 18, lineHeight: 26}}>
                                        {item.shortDate}{'\n'}{dayOfWeek}
                                    </Text>
                                    
                                    <View style={styles.cells}>

                                        <View style={styles.cell}>
                                            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>AM:</Text>
                                            <Pressable onLongPress={() => handleLongPress(item.AMshift[0], 1, idx, 'AM', new Date(item.date))}>
                                                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#444', borderRadius: 4}}>
                                                    {" "}{item.AMshift[0] !== -1 ? selectedSchedule.employees[item.AMshift[0]].name : 'No one'}{" "}
                                                </Text>
                                            </Pressable>
                                        </View>
                                        
                                        <View style={styles.separator} />
                                        
                                        <View style={styles.cell}>
                                            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>PM:</Text>
                                            <Pressable onLongPress={() => handleLongPress(item.PMshift[0], 1, idx, 'PM', new Date(item.date))}>
                                                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#222', borderRadius: 4}}>
                                                    {" "}{item.PMshift[0] !== -1 ? selectedSchedule.employees[item.PMshift[0]].name : 'No one'}{" "}
                                                </Text>
                                            </Pressable>
                                        </View>
                                        
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    {/* week 2 */}
                    <View style={styles.weekContainer}>
                        {selectedSchedule.week2.map((item, idx) => {
                            const dateObj = new Date(item.date);
                            const dayOfWeek = !isNaN(dateObj.getTime()) ? daysOfWeek[dateObj.getDay()] : '';
                            
                            return (
                                <View key={idx} style={styles.dayContainer}>
                                    <Text style={{color: 'white', fontSize: 18, lineHeight: 26}}>
                                        {item.shortDate}{'\n'}{dayOfWeek}
                                    </Text>
                                    
                                    <View style={styles.cells}>
                                        <View style={styles.cell}>
                                            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>AM:</Text>
                                            <Pressable onLongPress={() => handleLongPress(item.AMshift[0], 2, idx, 'AM', new Date(item.date))}>
                                                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#444', borderRadius: 4}}>
                                                    {" "}{item.AMshift[0] !== -1 ? selectedSchedule.employees[item.AMshift[0]].name : 'No one'}{" "}
                                                </Text>
                                            </Pressable>
                                        </View>
                                        <View style={styles.separator} />
                                        <View style={styles.cell}>
                                            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>PM:</Text>
                                            <Pressable onLongPress={() => handleLongPress(item.PMshift[0], 2, idx, 'PM', new Date(item.date))}>
                                                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#222', borderRadius: 4}}>
                                                    {" "}{item.PMshift[0] !== -1 ? selectedSchedule.employees[item.PMshift[0]].name : 'No one'}{" "}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    {/* Swap Modal */}
                    {modalVisible && selectedShiftInfo && (
                        
                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={{
                                flex: 1,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    backgroundColor: '#333',
                                    padding: 18,
                                    borderRadius: 12,
                                    alignItems: 'center'
                                }}>
                                    <Text style={{color: 'white', fontSize: 20, marginBottom: 16, fontWeight: 'bold'}}>Shift Options</Text>
                                    <Text style={{color: 'white', fontSize: 18, marginBottom: 8, lineHeight: 24}}>
                                        {selectedShiftInfo.employeeIdx !== -1
                                            ? `Employee: ${selectedSchedule.employees[selectedShiftInfo.employeeIdx].name}\n`
                                            : 'No employee assigned to this shift.\n'}
                                        {selectedShiftInfo.week === 1
                                            ? `Date: ${selectedSchedule.week1[selectedShiftInfo.dayIdx].shortDate}\n`
                                            : `Date: ${selectedSchedule.week2[selectedShiftInfo.dayIdx].shortDate}\n`}
                                        {`${selectedShiftInfo.shiftType} shift `}
                                    </Text>
                                    <Picker
                                        selectedValue={selectedEmployeeIdx}
                                        style={{ height: 50, width: 200, color: 'white', backgroundColor: '#444' }}
                                        onValueChange={(itemValue, itemIndex) => setSelectedEmployeeIdx(itemValue)}
                                    >
                                        {selectedSchedule.employees.map(emp => (
                                            <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                                        ))}
                                    </Picker>
                                    <Pressable
                                        onPress={() => {
                                            if (selectedEmployeeIdx !== null) {
                                                // Swap logic: assign selectedEmployeeIdx to the shift
                                                const updatedSchedules = [...schedules];
                                                if (selectedIdx !== null) {
                                                    if (selectedShiftInfo.week === 1) {
                                                        const updatedWeek = [...selectedSchedule.week1];
                                                        if (selectedShiftInfo.shiftType === 'AM') {
                                                            updatedWeek[selectedShiftInfo.dayIdx].AMshift[0] = selectedEmployeeIdx;
                                                        } else {
                                                            updatedWeek[selectedShiftInfo.dayIdx].PMshift[0] = selectedEmployeeIdx;
                                                        }
                                                        updatedSchedules[selectedIdx].week1 = updatedWeek;
                                                    } else {
                                                        const updatedWeek = [...selectedSchedule.week2];
                                                        if (selectedShiftInfo.shiftType === 'AM') {
                                                            updatedWeek[selectedShiftInfo.dayIdx].AMshift[0] = selectedEmployeeIdx;
                                                        } else {
                                                            updatedWeek[selectedShiftInfo.dayIdx].PMshift[0] = selectedEmployeeIdx;
                                                        }
                                                        updatedSchedules[selectedIdx].week2 = updatedWeek;
                                                    }
                                                    setSchedules(updatedSchedules);
                                                    AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(updatedSchedules));
                                                }
                                            }
                                            setModalVisible(false);
                                        }}
                                        style={{
                                            backgroundColor: selectedEmployeeIdx !== null ? '#00f' : '#888',
                                            borderRadius: 8,
                                            padding: 8,
                                            marginTop: 8,
                                            opacity: selectedEmployeeIdx !== null ? 1 : 0.5
                                        }}
                                        disabled={selectedEmployeeIdx === null}
                                    >
                                        <Text style={{color: '#fff', fontSize: 18}}>Swap Employee</Text>
                                    </Pressable>
                                    <Pressable style={{borderColor: '#888', borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8}} onPress={() => setModalVisible(false)}>
                                        <Text style={{color: '#fff', fontSize: 18}}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>
                    )}
                    {/* Delete confirmation modal */}
                    <Modal
                        visible={deleteModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setDeleteModalVisible(false)}
                    >
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <View style={{
                                backgroundColor: '#333',
                                padding: 24,
                                margin: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                                    Delete this schedule?
                                </Text>
                                <Text style={{ color: 'white', fontSize: 16, marginBottom: 24 }}>
                                    Are you sure you want to delete this saved schedule? This action cannot be undone.
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <Pressable
                                        style={{
                                            backgroundColor: '#c00',
                                            borderRadius: 8,
                                            padding: 12,
                                            marginRight: 8,
                                        }}
                                        onPress={async () => {
                                            if (scheduleToDeleteIdx !== null) {
                                                const updatedSchedules = schedules.filter((_, i) => i !== scheduleToDeleteIdx);
                                                setSchedules(updatedSchedules);
                                                await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(updatedSchedules));
                                                if (selectedIdx === scheduleToDeleteIdx) setSelectedIdx(null);
                                                else if (selectedIdx && selectedIdx > scheduleToDeleteIdx) setSelectedIdx(selectedIdx - 1);
                                            }
                                            setDeleteModalVisible(false);
                                            setScheduleToDeleteIdx(null);
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
                                    </Pressable>
                                    <Pressable
                                        style={{
                                            backgroundColor: '#555',
                                            borderRadius: 8,
                                            padding: 12,
                                        }}
                                        onPress={() => {
                                            setDeleteModalVisible(false);
                                            setScheduleToDeleteIdx(null);
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '90%' }}>
                    <Text style={styles.title}>Select a schedule to view</Text>
                </View>
            )}
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#222',
        alignItems: 'center',
        gap: 8,
        minHeight: '100%', // Add this line
    },
    optionsContainer:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: '90%',
        gap: 8,
    },
    scheduleContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '90%',
    },
    weekContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '49%',
        gap: 8,
    },
    dayContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 4,
        backgroundColor: '#333',
        alignContent: 'stretch',
    },
    cells: {
        display: 'flex',
        width: '75%',
        paddingLeft: 8,
        flexDirection: 'column',
        alignSelf: 'stretch',
    },
    cell: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
        color: 'white', // White text
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
        backgroundColor: '#555',
        marginVertical: 1,
    },
    selectedSchedule: {
        backgroundColor: '#0055ff', // or any highlight color you prefer
        borderWidth: 2,
    },
});

export default SavedPage;