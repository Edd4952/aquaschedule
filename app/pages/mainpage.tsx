import { StyleSheet, Text, View, ScrollView, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';

const employeeList = [
    { id: 0, name: 'Karol' },
    { id: 1, name: 'Edward' },
    { id: 2, name: 'Olivier' },
    { id: 3, name: 'Anna' },
    { id: 4, name: 'Alina' },    
];

const userPage = () => {

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const week1 = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        dayDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + i).toLocaleDateString(),
        AMshift: [Math.floor(Math.random() * 5)],
        PMshift: [Math.floor(Math.random() * 5)],
    }));
    const week2 = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        dayDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + i + 7).toLocaleDateString(),
        AMshift: [Math.floor(Math.random() * 5)],
        PMshift: [Math.floor(Math.random() * 5)],
    }));
    

    const onChange = (event: any, selectedDate?: Date | undefined) => {
        setShow(true);
        if (selectedDate){
            setDate(selectedDate);
            setShow(false);
        } 
    };
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* options */}
            <View style={styles.optionsContainer}>
                <Text style={styles.title}>Options</Text>
                <Button title='select first day of the schedule' onPress={() => setShow(true)} />
                <Text style={{ color: 'white', margin: 8 }}>
                    Selected date: {date.toLocaleDateString()}
                </Text>
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
                                {item.dayDate}
                            </Text>
                            <Text style={{color: 'white', fontSize: 18}}>
                                {item.AMshift} {item.PMshift}
                            </Text>
                        </View>
                    ))}
                </View>
                {/* week 2 */}
                <View style={styles.weekContainer}>   
                    {week2.map((item, idx) => (
                        <View key={idx} style={styles.dayContainer}>
                            <Text style={{color: 'white', fontSize: 18}}>
                                {item.dayDate}
                            </Text>
                            <Text style={{color: 'white', fontSize: 18}}>
                                {item.AMshift} {item.PMshift}
                            </Text>
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
        padding: 16,
        borderWidth: 1,
        borderColor: 'red',

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
        borderWidth: 1,
        borderColor: 'yellow',
    },
    dayContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: 4,
        borderWidth: 1,
        borderColor: 'blue',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 24,
        color: 'white', // White text
    },
    link: {
        color: '#007AFF',
        fontSize: 18,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default userPage;