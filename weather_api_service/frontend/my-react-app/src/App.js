import './App.css';
import Select from 'react-select';
import { Forecast } from './components/forecast';
import { useState } from 'react';
import { MultiDayWeatherForecast } from './components/weatherTable';
import AsyncSelect from 'react-select/async';
import { Grid } from "@mui/material";
import Login from './components/Login';
import { SunriseSunset } from './components/dailySun';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';


const gridStyle = {
  overflowX: "auto",
   overflowY: "auto",
   paddingTop:"50px",
}

function App() {
  const [select, setSelect] = useState(false);
  const [weatherData, setWeatherData] = useState({})
  const [numberDays, setNumberDays] = useState(5)
  const [city, setCity] = useState("")

  // Fetches the api with selected options of city and days
  const handleChange =   (selectedOptions, numberDays) => {
    setCity(selectedOptions)
     fetch(`http://127.0.0.1:5900/forecast/${selectedOptions.name + ", " + selectedOptions.subcountry }/${numberDays}`, {
        method: "get"
    }).then(res => res.json())
    .then((data) => {
      setSelect(true)
      setWeatherData(data)
      setSelectedValue(selectedOptions.name);
    });
  }

  // Editing number of days involves requerying the weather
  const editBoth =  (options) => {
    setNumberDays(options.value)
    if(city == ""){ // checks to see if the city hasn't been set yet
      return
    }
     handleChange(city, options.value)
    
  }
  // Searching through json was absurdly slow so it was converted to a table in the DB and this is querying that
  const newData =  async (inputValue) => {
    if (inputValue == ""){
      return
    }
    return fetch(`http://127.0.0.1:5900/countries/${inputValue}`)
    .then(res => res.json())
    .then(data => data['cities'])
  }


  //dropdown for number of days
  const days = [
    {label: "3 days", value: 3},
    {label: "5 days", value: 5},
    {label: "7 days", value: 7},
  ]

  //hooks and variables for the async dropdown component
  const [inputValue, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const handleInputChange = value => {
    setValue(value);
  };

  const [token, setToken] = useState(false);

  let [fahrenheit, setFahrenheit] = useState(true); 
    const handleChangeFahrenheit = (event) => {
        fahrenheit = !fahrenheit
        setFahrenheit(event.target.checked);
    };

  /* cookie to ensure inactivity, logs out at inactivity of an hour */
  let validated = Number(localStorage.getItem('items'))
  if(validated != null && (Date.now() >= validated + 3600000)){
    validated = false;
    localStorage.removeItem('items')
  }
  if (!token && !validated){
    return <Login setToken={setToken} />
  } 
  return (
    <div className="App">
      <header className="App-header">
        <span>Welcome to Akshay Shivkumar's weather app!
        <div className="select">
          <AsyncSelect
            cacheOptions
            defaultOptions
            value={selectedValue}
            getOptionLabel={(option) => option.name + ", " +  option.subcountry}
            getOptionValue={(option) => option.geonameid} // It should be unique value in the options. E.g. ID
            placeholder = {'Enter a city to find it\'s weather'}
            onChange={(city) => handleChange(city, numberDays)}
            onInputChange = {handleInputChange}
            loadOptions = {newData}
          />
        </div>
        <div className = "select">
          <Select
            options={days}
            placeholder = {'Number of days of forecast'}
            onChange={editBoth}
          />
          
        </div>
      </span>
    
      <div>
        {select && <SunriseSunset forecast={weatherData} fahrenheit={fahrenheit}/>} 
        <div>
          {select && <FormControlLabel
          control={<Switch checked={fahrenheit} onChange={handleChangeFahrenheit} />}
          label="F/C"
          />}
        </div>
        <Grid container style={gridStyle}>
            <Grid>
              {select && <Forecast forecast={weatherData} fahrenheit= {fahrenheit}/>}
            </Grid>
            
            <Grid>
              {select && <MultiDayWeatherForecast forecast = {weatherData.forecast} days = {numberDays} fahrenheit= {fahrenheit}/>}
            </Grid>
          </Grid>
        </div>

      </header>

    </div>
  );
}

export default App;
