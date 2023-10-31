<template>
  <div>
    <input
      type="text"
      v-model="cityInput"
      placeholder="Enter city name"
      @keyup.enter="fetchWeatherData"
    />
    <button @click="fetchWeatherData">Get Weather</button>

    <h1 v-if="currentWeather">Current Weather in {{ currentWeather.name }}</h1>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="currentWeather">
      <p>Temperature: {{ currentWeather.main.temp }}°F</p>
      <!-- Display other weather information as needed -->
    </div>
    <div v-else>
      <p>Loading weather data...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { fetchWeather, fetchWeatherByCoords } from "@/services/WeatherService"

export default {
  name: "Weather",
  setup() {
    const cityInput = ref("")
    const currentWeather = ref(null)
    const error = ref(null)
    let activeWeatherData = currentWeather

    const fetchWeatherByCoordinates = async (position) => {
      try {
        const { coords } = position
        const newWeatherData = await fetchWeatherByCoords(
          coords.latitude,
          coords.longitude
        )
        activeWeatherData.value = newWeatherData
      } catch (err) {
        console.error("Error fetching weather by coordinates:", err)
        error.value = "Failed to fetch weather data by location."
      }
    }

    const fetchUserLocationWeather = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          fetchWeatherByCoordinates,
          (error) => {
            console.error("Error accessing Geolocation:", error)
            if (error.code === error.PERMISSION_DENIED) {
              error.value =
                "Location access denied. Fetching weather based on manually entered city."
              fetchWeatherData()
            } else {
              error.value = "Failed to fetch weather data by location."
            }
          }
        )
      } else {
        error.value =
          "Geolocation is not supported. Fetching weather based on manually entered city."
        fetchWeatherData()
      }
    }

    const fetchWeatherData = async () => {
      try {
        if (cityInput.value.trim() !== "") {
          const newWeatherData = await fetchWeather(cityInput.value)
          activeWeatherData.value = newWeatherData
        } else {
          error.value = "Please enter a city name"
        }
      } catch (err) {
        console.error("Error fetching weather:", err)
        error.value = "Failed to fetch weather data for the entered city."
      }
    }

    const autoRefreshWeather = () => {
      setInterval(() => {
        if (cityInput.value.trim() === "") {
          fetchUserLocationWeather()
        } else {
          fetchWeatherData()
        }
      }, 150000)
    }

    onMounted(() => {
      fetchUserLocationWeather()
      autoRefreshWeather()
    })

    onBeforeUnmount(() => {
      clearInterval(autoRefreshWeather)
    })

    return {
      cityInput,
      currentWeather,
      error,
      fetchWeatherData,
    }
  },
}
</script>
