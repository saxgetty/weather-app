import axios from "axios"

const baseURL = "https://api.openweathermap.org/data/2.5/weather"
const apiKey = "cf6758e29b7037c7096741e46f9bce2f"

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
