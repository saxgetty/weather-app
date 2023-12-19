<template>
  <div class="grid grid-cols-10 gap-4 w-full sm:max-w-screen-sm">
    <div class="flex justify-end col-span-full">
      <RadioTheme />
      <UnitToggle :unitType="unitType" @toggleUnit="toggleUnit" />
    </div>
    <!-- Search Bar -->
    <div class="col-span-full">
      <input
        class="relative w-full rounded-2xl border-2 border-gray-300 text-gray-600 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
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
      ></button>
    </div>

    <!-- Weather Cards -->
    <template v-if="baseWeatherData">
      <WeatherCard
        :weatherData="baseWeatherData"
        :key="'base'"
        :removable="false"
        :error="error"
        :unitType="unitType"
        class="col-span-full h-80"
      />
    </template>

    <template
      v-for="(weatherData, index) in additionalWeatherData"
      :key="index"
    >
      <WeatherCard
        :weatherData="weatherData"
        :removable="true"
        @removeCard="removeCard(index)"
        :error="error"
        :unitType="unitType"
        class="col-span-5 h-96"
      />
    </template>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { fetchWeather, fetchWeatherByCoords } from "@/services/WeatherService"
import WeatherCard from "@/components/WeatherCard.vue"
import RadioTheme from "@/components/RadioTheme.vue"
import UnitToggle from "@/components/UnitToggle.vue"

export default {
  name: "Weather",
  components: {
    WeatherCard,
    RadioTheme,
    UnitToggle,
  },
  setup() {
    const cityInput = ref("")
    const baseWeatherData = ref(null)
    const additionalWeatherData = ref([])
    const error = ref(null)
    const unitType = ref("imperial")

    const convertToCelsius = (tempF) => {
      const tempC = ((tempF - 32) * 5) / 9
      return tempC.toFixed(2)
    }

    const convertToFahrenheit = (tempC) => {
      const tempF = (tempC * 9) / 5 + 32
      return tempF.toFixed(2)
    }

    const convertToMilesPerHour = (speedMs) => {
      const speedMph = speedMs * 2.23694 // m/s to mph conversion factor
      return speedMph.toFixed(2)
    }

    const convertToKilometersPerHour = (speedMs) => {
      const speedKph = speedMs * 3.6 // m/s to km/h conversion factor
      return speedKph.toFixed(2)
    }

    const toggleUnit = (isChecked) => {
      unitType.value = isChecked ? "imperial" : "metric"

      if (baseWeatherData.value) {
        if (unitType.value === "metric") {
          baseWeatherData.value.main.temp = convertToCelsius(
            baseWeatherData.value.main.temp
          )
          baseWeatherData.value.wind.speed = convertToKilometersPerHour(
            baseWeatherData.value.wind.speed
          )
        } else {
          baseWeatherData.value.main.temp = convertToFahrenheit(
            baseWeatherData.value.main.temp
          )
          baseWeatherData.value.wind.speed = convertToMilesPerHour(
            baseWeatherData.value.wind.speed
          )
        }
      }

      additionalWeatherData.value.forEach((data) => {
        if (unitType.value === "metric") {
          data.main.temp = convertToCelsius(data.main.temp)
          data.wind.speed = convertToKilometersPerHour(data.wind.speed)
        } else {
          data.main.temp = convertToFahrenheit(data.main.temp)
          data.wind.speed = convertToMilesPerHour(data.wind.speed)
        }
      })
    }

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
          cityInput.value = ""
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
      unitType,
      toggleUnit,
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
