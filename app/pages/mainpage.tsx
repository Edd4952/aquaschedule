import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Employee = {
    id: number;
    name: string;
    numShifts: number;
    daysCantWork: number[];
};

const employeeList: Employee[] = [
    { id: 0, name: 'Karol', numShifts: 0, daysCantWork: [] },
    { id: 1, name: 'Edward', numShifts: 0, daysCantWork: [] },
    { id: 2, name: 'Olivier', numShifts: 0, daysCantWork: [] },
    { id: 3, name: 'Anna', numShifts: 0, daysCantWork: [] },
    { id: 4, name: 'Alina', numShifts: 0, daysCantWork: [] },    
];

const userPage = () => {
    
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [employees, setEmployees] = useState(employeeList);
    const maxShifts = (28 / employeeList.length);
    
    function resetShifts() {
        setEmployees(employees.map(emp => ({ ...emp, numShifts: 0 })));
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
    
    const week1 = Array.from({ length: 7 }, (_, i) => {
        let localEmployees = [...employees]; // Make a copy for counting
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
    const week2 = Array.from({ length: 7 }, (_, i) => {
        //shifts are a random number that represents the index of the employee in the employees
        let AMshift = findNewEmplFromList(-1, employees, i + 7);
        let PMshift = findNewEmplFromList(AMshift, employees, i + 7);

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
                <Text style={{ color: 'white', margin: 8 }}>
                    Selected date: {date.toLocaleDateString()}
                    maxshifts: {maxShifts}
                    {"\n"}
                    karol: {employees[0].numShifts}
                    {"\n"}
                    edward: {employees[1].numShifts}
                    {"\n"}
                    olivier: {employees[2].numShifts}
                    {"\n"}
                    anna: {employees[3].numShifts}
                    {"\n"}
                    alina: {employees[4].numShifts}
                </Text>
                <Pressable style={styles.button} onPress={() => resetShifts()}>
                    <Text style={styles.buttonText}>Reset Shifts</Text>
                </Pressable>


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
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', }}>
                                        {item.AMshift[0] !== -1 ? employees[item.AMshift[0]].name : 'No one'}
                                    </Text>
                                </View>
                                
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        PM:
                                    </Text>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        {item.PMshift[0] !== -1 ? employees[item.PMshift[0]].name : 'No one'}
                                    </Text>
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
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', }}>
                                        {item.AMshift[0] !== -1 ? employees[item.AMshift[0]].name : 'No one'}
                                    </Text>
                                </View>
                                
                                <View style={styles.cell}>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        PM:
                                    </Text>
                                    <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                                        {item.PMshift[0] !== -1 ? employees[item.PMshift[0]].name : 'No one'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#222', // Changed to dark background
        alignItems: 'center',
    },
    optionsContainer:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '90%',
        borderWidth: 1,
        borderColor: 'red',
        gap: 8,
    },
    scheduleContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '90%',
        borderWidth: 1,
        borderColor: 'green', 

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
        borderWidth: 1,
        borderColor: 'purple',
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
        marginHorizontal: 8,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 8,
    },
});

export default userPage;