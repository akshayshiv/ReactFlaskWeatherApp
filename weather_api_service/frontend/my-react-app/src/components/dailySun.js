import "../Table.css"
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';

const sunriseStyle = {
  display: "inline-block",
  paddingTop:"20px"
  
};

export const SunriseSunset = ({forecast, fahrenheit}) => {
    return (
        <div>            
            <TableContainer component = {Paper}>
                <div style = {sunriseStyle}>
                    <Table sx={{ maxWidth: 300 }} aria-label="simple table">
                        <TableRow><img src = {forecast.current.condition.icon}/><p>{forecast.current.condition.text}</p></TableRow>
                        <TableRow>Sunrise: {forecast.forecast.forecastday[0].astro.sunrise}</TableRow>
                        <TableRow>Sunset: {forecast.forecast.forecastday[0].astro.sunset}</TableRow>
                        <TableRow>Moonrise: {forecast.forecast.forecastday[0].astro.moonrise}</TableRow>
                        <TableRow>Moonset: {forecast.forecast.forecastday[0].astro.moonset}</TableRow>
                    <TableRow>Current Temperature: {fahrenheit ?forecast.current.temp_f:forecast.current.temp_c}</TableRow>
                    </Table>
                </div>
            </TableContainer>
        </div>
    )
}