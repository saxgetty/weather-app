import axios from "axios"

const baseURL = import.meta.env.VITE_OPENWEATHERMAP_BASE_URL
const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

export async function fetchWeather(city) {
  try {
    const response = await axios.get(baseURL, {
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

export async function fetchWeatherByCoords(lat, lon) {
  try {
    const response = await axios.get(baseURL, {
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
