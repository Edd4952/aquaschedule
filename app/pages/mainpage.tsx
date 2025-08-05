import { Ionicons } from '@expo/vector-icons'; // Add this at the top with your imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Employee = {
    id: number;
    name: string;
    numShifts: number;
    daysCantWork: number[];
};

const employeeList: Employee[] = [
    { id: 0, name: 'Karol', numShifts: 0, daysCantWork: [] }
];

const mainpage = () => {
    // INITIALIZATION AND DATA
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [employees, setEmployees] = useState(employeeList);
    const maxShifts = useMemo(() => {
        return employees.length > 0 ? Math.ceil(28 / employees.length) : 0;
    }, [employees]);
    const [editingNames, setEditingNames] = useState(employees.map(emp => emp.name));
    const [editingDaysCantWork, setEditingDaysCantWork] = useState(employees.map(emp => emp.daysCantWork.join(',')));
    //longpress
    const [modalVisible, setModalVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerEmployeeIdx, setPickerEmployeeIdx] = useState<number | null>(null);
    const [selectedEmployeeIdx, setSelectedEmployeeIdx] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    // Update timestamp whenever employees, week1, week2, or date changes
    React.useEffect(() => {
        setLastUpdated(new Date());
    }, [employees, date]);

    const saveSchedule = async (scheduleData: any) => {
        try {
            const raw = await AsyncStorage.getItem('savedSchedules');
            const schedules = raw ? JSON.parse(raw) : [];
            const newSchedule = { ...scheduleData, savedAt: new Date().toISOString() };
            await AsyncStorage.setItem('savedSchedules', JSON.stringify([...schedules, newSchedule]));
            alert('Schedule saved!');
            setLastUpdated(new Date());
        } catch (e) {
            alert('Failed to save schedule.');
        }
    };
    
    const [selectedShiftInfo, setSelectedShiftInfo] = useState<{
        employeeIdx: number;
        week: 1 | 2;
        dayIdx: number;
        shiftType: 'AM' | 'PM';
        date: Date;
    } | null>(null);

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
    
    function resetShifts() {
        setEmployees(employees.map(emp => ({ ...emp, numShifts: 0 })));
        setLastUpdated(new Date());
    }
    
    function addEmployee() {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 0;
        setEmployees([...employees, { id: newId, name: `New`, numShifts: 0, daysCantWork: [] }]);
        setEditingNames([...editingNames, "New"]);
    }
    function findNewEmplFromList(int: number, list = employees, day: number): number {
        // create new array without the employee with the given id
        const filtered = list.filter(employeeList => employeeList.id !== int);
        // filter out employees that have already worked the maximum number of shifts
        const filterMax = filtered.filter(employeeList => employeeList.numShifts < maxShifts);
        // filter out employees that can't work on the given day
        const filterCantWork = filterMax.filter(employeeList => !employeeList.daysCantWork.includes(day));
        return filterCantWork.length > 0 ? filterCantWork[Math.floor(Math.random() * filterCantWork.length)].id : -1;
    }
    
    const week1 = (useMemo(() => {
        let localEmployees = employees.map(emp => ({ ...emp })); // Make a copy for counting
        return Array.from({ length: 7 }, (_, i) => {

            let AMshift = findNewEmplFromList(-1, localEmployees, i + 1);
            if (AMshift !== -1) {
                localEmployees[AMshift] = { ...localEmployees[AMshift], numShifts: localEmployees[AMshift].numShifts + 1 };
            }
            let PMshift = findNewEmplFromList(AMshift, localEmployees, i + 1);
            if (PMshift !== -1) {
                localEmployees[PMshift] = { ...localEmployees[PMshift], numShifts: localEmployees[PMshift].numShifts + 1 };
            }

            const day = i + 1;
            const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i).toLocaleDateString();
            const shortDate = String(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i).getMonth() + 1) + '/' + String(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i).getDate());
            
            if (AMshift !== -1) {
                employees[AMshift].numShifts++;
            }
            if (PMshift !== -1) {
                employees[PMshift].numShifts++;
            }
            return {
                day,
                dayDate,
                shortDate,
                AMshift: [AMshift],
                PMshift: [PMshift],
            };
        });
    }, [employees, date, ]));

    const week2 = (useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            let localEmployees = [...employees]; // Make a copy for counting
            let AMshift = findNewEmplFromList(-1, localEmployees, i + 1 + 7);
            if (AMshift !== -1) {
                localEmployees[AMshift] = { ...localEmployees[AMshift], numShifts: localEmployees[AMshift].numShifts + 1 };
            }
            let PMshift = findNewEmplFromList(AMshift, localEmployees, i + 1 + 7);
            if (PMshift !== -1) {
                localEmployees[PMshift] = { ...localEmployees[PMshift], numShifts: localEmployees[PMshift].numShifts + 1 };
            }

            const day = i + 1;
            const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + 7).toLocaleDateString();
            const shortDate = String(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + 7).getMonth() + 1) + '/' + String(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + 7).getDate());

            if (AMshift !== -1) {
                employees[AMshift].numShifts++;
            }
            if (PMshift !== -1) {
                employees[PMshift].numShifts++;
            }
            return {
                day,
                dayDate,
                shortDate,
                AMshift: [AMshift],
                PMshift: [PMshift],
            };
        });
    }, [employees, date]));
    

    const onChange = (event: any, selectedDate?: Date | undefined) => {
        setShow(true);
        if (selectedDate){
            setDate(selectedDate);
            setShow(false);
        } 
    };
    //DISPLAY
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* options */}
            <View style={styles.optionsContainer}>
                
                <Text style={styles.title}>Options</Text>
                <Pressable style={styles.button} onPress={() => setShow(true)}>
                    <Text style={styles.buttonText}>Select First Day of the Schedule</Text>
                </Pressable>
                <Text style={{ color: 'white', fontSize: 18 }}>
                    Selected date: {date.toLocaleDateString()}
                </Text>
                
                {/* Edit add and remove employee Names */}
                <View style={styles.separator} />

                <View style={{ gap: 4 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Edit Employees:</Text>
                    
                    {employees.map((emp, idx) => (
                        <View key={`employee-edit-${emp.id}`}>
                            <View key={emp.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, justifyContent: 'space-around', gap: 4 }}>
                                <Text style={{ color: 'white', fontSize: 18 }}>{emp.id + 1}</Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#444',
                                        color: 'white',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        borderRadius: 4,
                                        padding: 4,
                                        width: 80,
                                    }}
                                    value={editingNames[idx]}
                                    onChangeText={text => {
                                        const updated = [...editingNames];
                                        updated[idx] = text;
                                        setEditingNames(updated);
                                        setEmployees(emps => emps.map((e, i) => i === idx ? { ...e, name: text } : e));
                                    }}
                                    onEndEditing={() => {
                                        // Update the employees state with the new name
                                        setEmployees(emps =>
                                            emps.map((e, i) => i === idx ? { ...e, name: editingNames[idx] } : e)
                                        );
                                    }}
                                />
                                <Pressable
                                    style={{ backgroundColor: '#c00', borderRadius: 4, padding: 4 }}
                                    onPress={() => {
                                        setEmployees(emps => emps.filter((_, i) => i !== idx));
                                        setEditingNames(names => names.filter((_, i) => i !== idx));
                                        setEmployees(emps => emps.map((e, i) => ({ ...e, id: i })));
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Remove</Text>
                                </Pressable>
                                <>{/* Add day off button */}</>
                                <Pressable
                                    style={{ backgroundColor: '#0af', borderRadius: 4, padding: 4 }}
                                    onPress={() => {
                                        setPickerEmployeeIdx(idx);
                                        setPickerVisible(true);
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>+ Day off</Text>
                                </Pressable>
                                <Pressable
                                    style={{ backgroundColor: '#fa0', borderRadius: 4, padding: 4 }}
                                    onPress={() => {
                                        // Remove the last day off for this employee, if any
                                        setEmployees(emps =>
                                            emps.map((e, i) =>
                                                i === idx && e.daysCantWork.length > 0
                                                    ? { ...e, daysCantWork: e.daysCantWork.slice(0, -1) }
                                                    : e
                                            )
                                        );
                                        setEditingDaysCantWork(days =>
                                            days.map((d, i) =>
                                                i === idx
                                                    ? d
                                                        .split(',')
                                                        .filter((_, j, arr) => j < arr.length - 1)
                                                        .join(',')
                                                    : d
                                            )
                                        );
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>- Day off</Text>
                                </Pressable>
                            </View>
                            <View key={`employee-days-off-${emp.id}`}>
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                    {emp.numShifts}{" shifts, "}
                                    Days off: {employees[idx].daysCantWork
                                        .map(dayNum => {
                                            // Calculate the date for this day off
                                            const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (dayNum - 1));
                                            return `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
                                        })
                                        .join(', ')
                                    }
                                </Text>
                            </View>
                        </View>            
                        ))}
                    <Pressable style={styles.button} onPress={addEmployee}>
                        <Text style={styles.buttonText}>+Add Employee</Text>
                    </Pressable>
                </View>

                {pickerVisible && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setPickerVisible(false);
                            let dayIdx: number | undefined = undefined;
                            if (selectedDate && pickerEmployeeIdx !== null) {
                                // Only allow days ON or AFTER the starting date
                                if (selectedDate < date) {
                                    alert("You cannot add a day off before the starting day of the schedule.");
                                    setPickerEmployeeIdx(null);
                                    return;
                                }
                                let diffTime = Math.abs(selectedDate.getTime() - date.getTime()); // difference in milliseconds
                                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // difference in days
                                if (selectedDate.getDate() == date.getDate()) {
                                    diffDays = 1;
                                }
                                dayIdx = diffDays;
                                setEmployees(emps =>
                                    emps.map((e, i) =>
                                        i === pickerEmployeeIdx && !e.daysCantWork.includes(dayIdx!)
                                            ? { ...e, daysCantWork: [...e.daysCantWork, dayIdx!] }
                                            : e
                                    )
                                );
                                setEditingDaysCantWork(days =>
                                    days.map((d, i) =>
                                        i === pickerEmployeeIdx && dayIdx !== undefined
                                            ? [...new Set([...d.split(',').filter(x => x !== '').map(Number), selectedDate.getDate().toLocaleString])].join(',')
                                            : d
                                    )
                                );
                            }
                            setPickerEmployeeIdx(null);
                        }}
                    />
                )}

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
                                        ? `Employee: ${employees[selectedShiftInfo.employeeIdx].name}\n`
                                        : 'No employee assigned to this shift.\n'}
                                    {selectedShiftInfo.week === 1
                                            ? `Date: ${week1[selectedShiftInfo.dayIdx].shortDate}\n`
                                            : `Date: ${week2[selectedShiftInfo.dayIdx].shortDate}\n`}
                                    {`${selectedShiftInfo.shiftType} shift `}
                                </Text>
                                <Picker
                                    selectedValue={selectedEmployeeIdx}
                                    style={{ height: 50, width: 200, color: 'white', backgroundColor: '#444' }}
                                    onValueChange={(itemValue, itemIndex) => setSelectedEmployeeIdx(itemValue)}
                                >
                                    {employees.map(emp => (
                                        <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                                    ))}
                                </Picker>
                                <Pressable
                                    onPress={() => {
                                        if (selectedEmployeeIdx !== null) {
                                            // Swap logic: replace employees[selectedShiftInfo.employeeIdx].name with selectedEmployeeIdx
                                            week1.forEach((day) => {
                                                if (day.dayDate === selectedShiftInfo.date?.toLocaleDateString()) {
                                                    if (selectedShiftInfo.shiftType === 'AM') {
                                                        day.AMshift[0] = selectedEmployeeIdx;
                                                    } else {
                                                        day.PMshift[0] = selectedEmployeeIdx;
                                                    }
                                                    employees[selectedEmployeeIdx].numShifts++;
                                                    employees[selectedShiftInfo.employeeIdx].numShifts--;
                                                }
                                            });
                                            week2.forEach((day) => {
                                                if (day.dayDate === selectedShiftInfo.date?.toLocaleDateString()) {
                                                    if (selectedShiftInfo.shiftType === 'AM') {
                                                        day.AMshift[0] = selectedEmployeeIdx;
                                                    } else {
                                                        day.PMshift[0] = selectedEmployeeIdx;
                                                    }
                                                    employees[selectedEmployeeIdx].numShifts++;
                                                    employees[selectedShiftInfo.employeeIdx].numShifts--;
                                                }
                                            });
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
                {show && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChange}
                    />
                )}
            </View>
            <Text style={styles.title}>Your Schedule:</Text>
            
            {/*actual schedule goes here*/}
            <View style={{ width: '90%', alignItems: 'center', padding: 4, backgroundColor: '#222', borderRadius: 8 }}>
                <Text style={{fontSize: 18, color: 'white'}}>Hold on an employee name to swap</Text>
            </View>
            <View style={styles.scheduleContainer}>
                <View style= {{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 26}}>Week 1</Text>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 26}}>Week 2</Text>
                </View>
                
                {/* week 1 */}
                
                <View style={styles.weekContainer}>   
                    {week1.map((item, idx) => (
                        <View key={idx} style={styles.dayContainer}>
                        
                            <Text style={{color: 'white', fontSize: 18}}>
                                {item.shortDate}
                            </Text>
                            
                            <View style={styles.cells}>
                                
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', }}>
                                        AM:
                                    </Text>
                                    <Pressable onLongPress={() => handleLongPress(item.AMshift[0], 1, idx, 'AM', new Date(date.getFullYear(), date.getMonth(), date.getDate() + idx))}>
                                        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#444', borderRadius: 4}}>
                                            {" "}{item.AMshift[0] !== -1 ? employees[item.AMshift[0]].name : 'No one'}{" "}
                                        </Text>
                                    </Pressable>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        PM:
                                    </Text>
                                    <Pressable onLongPress={() => handleLongPress(item.PMshift[0], 1, idx, 'PM', new Date(date.getFullYear(), date.getMonth(), date.getDate() + idx))}>
                                        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#222', borderRadius: 4}}>
                                            {" "}{item.PMshift[0] !== -1 ? employees[item.PMshift[0]].name : 'No one'}{" "}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
                
                {/* week 2 */}

                <View style={styles.weekContainer}>   
                    {week2.map((item, idx) => (
                        <View key={idx} style={styles.dayContainer}>
                        
                            <Text style={{color: 'white', fontSize: 18}}>
                                {item.shortDate}
                            </Text>
                            
                            <View style={styles.cells}>
                                
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', }}>
                                        AM:
                                    </Text>
                                    <Pressable onLongPress={() => handleLongPress(item.AMshift[0], 2, idx, 'AM', new Date(date.getFullYear(), date.getMonth(), date.getDate() + idx + 7))}>
                                        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#444', borderRadius: 4}}>
                                            {" "}{item.AMshift[0] !== -1 ? employees[item.AMshift[0]].name : 'No one'}{" "}
                                        </Text>
                                    </Pressable>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        PM:
                                    </Text>
                                    <Pressable onLongPress={() => handleLongPress(item.PMshift[0], 2, idx, 'PM', new Date(date.getFullYear(), date.getMonth(), date.getDate() + idx + 7))}>
                                        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', backgroundColor: '#222', borderRadius: 4}}>
                                            {" "}{item.PMshift[0] !== -1 ? employees[item.PMshift[0]].name : 'No one'}{" "}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            {/* Timestamp */}
            <View style={{
                backgroundColor: '#333',
                width: '90%',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
            }}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
                    Up to date {lastUpdated.toLocaleDateString()} - {lastUpdated.toLocaleTimeString()}
                </Text>
            </View>
            {/* Shuffle shifts */}
            <Pressable style={[styles.button, { width: '90%', marginTop: 0, borderRadius: 0 }]} onPress={() => {resetShifts();}}>
                <Text style={styles.buttonText}>Shuffle Shifts</Text>
            </Pressable>
            <View style={styles.separator} />
            {/* Save schedule button */}
            <Pressable style={styles.button} onPress={() => saveSchedule({ employees, week1, week2 })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                    <Ionicons name="save" size={22} color="#fff" style={{ marginLeft: 8 }} />
                    <Text style={styles.buttonText}>Save Schedule</Text>
                </View>
            </Pressable>
            
            <View style={{ width: '90%', padding: 8, backgroundColor: '#444', borderRadius: 8, gap: 8, marginBottom: 16 }}>
            <Text style={styles.title}>Info:</Text>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'left' }}>
                    This is a schedule management app for the managers of Aquaguard.
                </Text>
                <View style= {styles.separator} />
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'left' }}>
                    Start by selecting the first day of the schedule.
                    Then add employees, edit their names, and set the days they are unable to work.
                    Then press Shuffle Shifts. 
                    To manually adjust shifts, long press on the name of an employee, then select the employee you want to swap them with.
                </Text>
                <View style= {styles.separator} />
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'left' }}>
                    Rules in place when shuffled:
                    {"\n"}- Employees are never selected twice in the same day
                    {"\n"}- Employees are never selected on days they cannot work
                    {"\n"}- Employees are given a roughly equal number of shifts*
                </Text>
                <View style= {styles.separator} />
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'left' }}>
                    *Every employee is given a roughly equal number of shifts by default.
                    However, if you wish to set an unequal number of shifts between employees,
                    long press on their name for each shift and swap them out manually.
                    The reason for this is to ensure regular balance in the distribution of shifts,
                    and that the managers are always conscious of any imbalances.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#222',
        alignItems: 'center',
        gap: 8,
    },
    optionsContainer:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 16,
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
        backgroundColor: '#666',
        marginVertical: 1,
    },
    
});

export default mainpage;