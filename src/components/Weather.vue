<template>
  <div class="items-center flex flex-col">
    <div class="flex flex-row text-gray-600 relative">
      <input
        class="w-64 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
        type="search"
        name="search"
        placeholder="Search"
        v-model="cityInput"
        @keyup.enter="fetchWeatherData"
      />
      <button
        class="absolute right-4 top-1/2 transform -translate-y-1/2"
        type="submit"
        @click="fetchWeatherData"
      >
        <!-- SVG icon for search -->
      </button>
    </div>

    <div class="m-10 flex flex-wrap justify-center">
  <!-- Base Card -->
  <template v-if="baseWeatherData">
    <WeatherCard
      :weatherData="baseWeatherData"
      :key="'base'"
      :removable="false"
      :error="error"
      class="w-full md:w-1/2 lg:w-1/4 mb-4"
    />
  </template>

  <!-- Additional Weather Cards -->
  <template v-for="(weatherData, index) in additionalWeatherData" :key="index">
    <WeatherCard
      :weatherData="weatherData"
      :removable="true"
      @removeCard="removeCard(index)"
      :error="error"
      class="w-full md:w-1/2 lg:w-1/4 mb-4"
    />
  </template>
</div>

  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { fetchWeather, fetchWeatherByCoords } from "@/services/WeatherService"
import WeatherCard from "@/components/WeatherCard.vue"

export default {
  name: "Weather",
  components: {
    WeatherCard,
  },
  setup() {
    const cityInput = ref("")
    const baseWeatherData = ref(null)
    const additionalWeatherData = ref([])
    const error = ref(null)

    const fetchWeatherByCoordinates = async (position) => {
      try {
        const { coords } = position
        const newWeatherData = await fetchWeatherByCoords(
          coords.latitude,
          coords.longitude
        )
        baseWeatherData.value = newWeatherData
      } catch (err) {
        error.value = "Failed to fetch weather data by location."
      }
    }

    const fetchUserLocationWeather = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          fetchWeatherByCoordinates,
          (error) => {
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
          if (!baseWeatherData.value) {
            baseWeatherData.value = newWeatherData
          } else if (additionalWeatherData.value.length < 8) {
            additionalWeatherData.value.push(newWeatherData)
          } else {
            error.value = "Maximum limit reached for additional locations."
          }
        } else {
          error.value = "Please enter a city name"
        }
      } catch (err) {
        error.value = "Failed to fetch weather data for the entered city."
      }
    }

    const autoRefreshWeather = () => {
      setInterval(async () => {
        if (cityInput.value.trim() === "") {
          fetchUserLocationWeather()
        } else {
          try {
            if (baseWeatherData.value) {
              const updatedBaseWeather = await fetchWeatherByCoords(
                baseWeatherData.value.coord.latitude,
                baseWeatherData.value.coord.longitude
              )
              baseWeatherData.value = updatedBaseWeather
            }

            for (let i = 0; i < additionalWeatherData.value.length; i++) {
              const updatedWeather = await fetchWeatherByCoords(
                additionalWeatherData.value[i].coord.latitude,
                additionalWeatherData.value[i].coord.longitude
              )
              additionalWeatherData.value[i] = updatedWeather
            }
          } catch (err) {
            error.value = "Failed to update weather data."
          }
        }
      }, 500000) // make 150000 as default
    }

    const removeCard = (index) => {
      if (additionalWeatherData.value.length > 0) {
        additionalWeatherData.value.splice(index, 1)
      } else {
        error.value = "Minimum limit reached. Cannot remove base card."
      }
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
      baseWeatherData,
      additionalWeatherData,
      error,
      fetchWeatherData,
      removeCard,
    }
  },
}
</script>
