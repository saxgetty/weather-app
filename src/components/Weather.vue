<template>
  <div className="items-center flex flex-col">
    <div className="mr-20 flex flex-row text-gray-600 relative">
      <input
        className="w-64 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
        type="search"
        name="search"
        placeholder="Search"
        v-model="cityInput"
        @keyup.enter="fetchWeatherData"
      />
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
        type="submit" 
        @click="fetchWeatherData"
      >
        <svg
          class="text-gray-600 h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Capa_1"
          x="0px"
          y="0px"
          viewBox="0 0 56.966 56.966"
          style="enable-background: new 0 0 56.966 56.966"
          xml:space="preserve"
          width="512px"
          height="512px"
        >
          <path
            d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
          />
        </svg>
      </button>
    </div>
    <div class="m-10 items-center flex flex-col md:flex-row md:justify-center">
      <div
        class="w-64 md:mr-20 mb-10 transition duration-500 ease-in-out transform bg-white rounded-lg hover:scale-105 cursor-pointer border flex flex-col justify-center items-center text-center p-6"
      >
        <div class="text-md font-bold flex flex-col text-gray-900">
          <span class="uppercase">
            <div v-if="currentWeather">
              {{ getCurrentLocation(currentWeather) }}
            </div>
            <div v-else-if="error" className="text-red-500">
              {{ error }}
            </div>
            <div v-else>
              <LoadingCircle />
            </div>
          </span>
          <span class="font-normal text-gray-700 text-sm">{{ formattedDate }}</span>
        </div>
        <div class="w-32 h-32 flex items-center justify-center">
          <svg
            width="95"
            height="72"
            viewBox="0 0 95 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="clip0">
                <rect width="95" height="72" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <p class="text-gray-700 mb-2">
          <div v-if="currentWeather">
            {{ currentWeather.weather[0].description }}
          </div>
          <div v-else>
            <p>Failed to load.</p>
          </div>
        </p>
        <div class="text-3xl font-bold text-gray-900 mb-6">
          <div v-if="currentWeather">
            {{ currentWeather.main.temp }}º<span
              class="font-normal text-gray-700 mx-1"
              >/</span
            >{{ convertToCelsius(currentWeather.main.temp) }}º
          </div>
          <div v-else-if="error" className="text-red-500">
            {{ error }}
          </div>
          <div v-else>
            <LoadingCircle />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { fetchWeather, fetchWeatherByCoords } from "@/services/WeatherService"
import LoadingCircle from "@/components/LoadingCircle.vue"

export default {
  name: "Weather",
  components: {
    LoadingCircle,
  },
  setup() {
    const cityInput = ref("")
    const currentWeather = ref(null)
    const error = ref(null)
    const currentDate = new Date()
    const options = { month: 'long', day: '2-digit' }
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(currentDate)
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
          const cityQuery = `${cityInput.value}, US` 
          const newWeatherData = await fetchWeather(cityQuery)
          activeWeatherData.value = newWeatherData
        } else {
          error.value = "Please enter a city name"
        }
      } catch (err) {
        console.error("Error fetching weather:", err)
        error.value = "Failed to fetch weather data for the entered city."
      }
    }

    const convertToCelsius = (tempF) => {
      const tempC = ((tempF - 32) * 5) / 9
      return tempC.toFixed(2)
    }

    const getCurrentLocation = (weatherData) => {
      if (weatherData && weatherData.name && weatherData.sys && weatherData.sys.country) {
        return `${weatherData.name}, ${weatherData.sys.country}`
      } else if (weatherData && weatherData.name) {
        return weatherData.name
      }
      return 'Unknown Location'
    }

    const autoRefreshWeather = () => {
      setInterval(() => {
        if (cityInput.value.trim() === "") {
          fetchUserLocationWeather()
        } else {
          fetchWeatherData()
        }
      }, 500000) // make 150000 as default
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
      convertToCelsius,
      getCurrentLocation,
      formattedDate,
    }
  },
}
</script>
