import { TableContainer } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import React from "react";
import { Box } from "@mui/system";

// After looking at this, I realize this is duplicated code. 
//  What I can do as a cleaner refactor with more time is to setup props to be modular and expect a 
//  fixed input object, since both the hourly and the daily weather forecast tables share the same data inputs, 
//  but from different parts of the API response.  And then when I call these components, 
//  I could just pass in the different data fields depending on whether it’s from the hourly data payload or 
//  the daily data payload

export const MultiDayWeatherForecast = ({forecast, days, fahrenheit}) => {
    return (
        <div>
            <h2>{days} day forecast</h2>
        <Box>
            <TableContainer component = {Paper}>
            <Table sx={{ maxWidth: 300 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Weather</TableCell>
                        <TableCell>Temperature</TableCell>
                        <TableCell>Humidity</TableCell>
                        <TableCell>Wind Speed (MPH)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {forecast.forecastday.map(day => (
                        <TableRow key={day.date}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell> <img src = {day.day.condition.icon}/></TableCell>
                            <TableCell>{ fahrenheit ? `${day.day.maxtemp_f}°/${day.day.mintemp_f}°`: `${day.day.maxtemp_c}°/${day.day.mintemp_c}°`}</TableCell>
                            <TableCell>{day.day.avghumidity}%</TableCell>
                            <TableCell>{day.day.maxwind_mph}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                
            </Table>
            
            </TableContainer>
            </Box>

            
        </div>
    )
};