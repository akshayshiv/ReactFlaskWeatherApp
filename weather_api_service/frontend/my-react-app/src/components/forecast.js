import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from "@mui/system";

// After looking at this, I realize this is duplicated code. 
//  What I can do as a cleaner refactor with more time is to setup props to be modular and expect a 
//  fixed input object, since both the hourly and the daily weather forecast tables share the same data inputs, 
//  but from different parts of the API response.  And then when I call these components, 
//  I could just pass in the different data fields depending on whether it’s from the hourly data payload or 
//  the daily data payload
export const Forecast = ({forecast, fahrenheit}) => {

    let arr = forecast.forecast.forecastday[0].hour
    arr = [arr[0], arr[3], arr[6], arr[9], arr[12], arr[15], arr[18], arr[21]] // these are the hours that we want per the example
    return (
        <div>
            <h2>Weather in {forecast.location.name}, {forecast.location.region}</h2>
            <Box>
                <TableContainer component = {Paper}>         
                    <Table sx={{ maxWidth: 300 }} aria-label="simple table">
                    
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Weather</TableCell>
                                <TableCell>Temperature</TableCell>
                                <TableCell>Humidity</TableCell>
                                <TableCell>Wind Speed (MPH)</TableCell>
                            </TableRow>
                        </TableHead>
                        
                        <TableBody>
                            {arr.map(hour => (
                                <TableRow key={hour.time}>
                                    <TableCell>{hour.time}</TableCell>
                                    <TableCell> <img src = {hour.condition.icon}/></TableCell>
                                    <TableCell>{fahrenheit? hour.temp_f : hour.temp_c }°</TableCell>
                                    <TableCell>{hour.humidity}%</TableCell>
                                    <TableCell>{hour.wind_mph}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                
                </TableContainer>
            </Box>
            
           
            
    </div>
    )
};