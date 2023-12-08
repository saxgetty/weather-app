import axios from "axios"

const dailyWeather = import.meta.env.VITE_OPENWEATHERMAP_DAILY_WEATHER
const eightDayForecast = import.meta.env.VITE_OPENWEATHERMAP_EIGHT_DAY_FORECAST
const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

export async function fetchWeather(city) {
  try {
    const response = await axios.get(dailyWeather, {
      params: {
        q: city,
        appid: apiKey,
        units: "imperial",
      },
    })

    return response.data
  } catch (error) {
    throw new Error(error.response.data.message)
  }
}

export async function fetchWeatherForecast(city, numberOfDays) {
  try {
    const response = await axios.get(`${eightDayForecast}`, {
      params: {
        q: city,
        appid: apiKey,
        units: "imperial",
        cnt: parseInt(numberOfDays),
      },
    })

    return response.data
  } catch (error) {
    throw new Error(error.response.data.message)
  }
}

export async function fetchWeatherByCoords(lat, lon) {
  try {
    const response = await axios.get(dailyWeather, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: "imperial",
      },
    })

    return response.data
  } catch (error) {
    throw new Error(error.response.data.message)
  }
}
