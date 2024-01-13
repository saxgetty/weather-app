<template>
  <div class="grid grid-cols-10 gap-4 w-full sm:max-w-screen-sm mt-10">
    <div class="flex justify-between col-span-full">
      <UnitToggle :unitType="unitType" @toggleUnit="toggleUnit" />
      <SelectTheme />
    </div>
    <!-- Search Bar -->
    <div class="col-span-full">
      <input
        class="relative w-full rounded-3xl shadow-lg bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
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
        class="col-span-full h-80"
      />
    </template>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { fetchWeather, fetchWeatherByCoords } from "@/services/WeatherService"
import WeatherCard from "@/components/WeatherCard.vue"
import SelectTheme from "@/components/SelectTheme.vue"
import UnitToggle from "@/components/UnitToggle.vue"

export default {
  name: "Weather",
  components: {
    WeatherCard,
    SelectTheme,
    UnitToggle,
  },
  setup() {
    const cityInput = ref("")
    const baseWeatherData = ref(null)
    const additionalWeatherData = ref([])
    const error = ref(null)
    const unitType = ref("imperial")

    const convertTemperature = (temperature, toUnit) => {
      if (toUnit === "metric") {
        return Number(((temperature - 32) * 5) / 9).toFixed(2) // Fahrenheit to Celsius conversion
      } else {
        return Number((temperature * 9) / 5 + 32).toFixed(2) // Celsius to Fahrenheit conversion
      }
    }

    const convertSpeed = (speed, unitType) => {
      if (unitType === "metric") {
        return Number(speed * 1.609344).toFixed(2) // mph to km\h conversion
      } else {
        return Number(speed * 0.6213711922).toFixed(2) // km\h to mph conversion
      }
    }

    const toggleUnit = (isChecked) => {
      unitType.value = isChecked ? "imperial" : "metric"

      if (baseWeatherData.value) {
        baseWeatherData.value.main.temp = convertTemperature(
          baseWeatherData.value.main.temp,
          unitType.value
        )

        baseWeatherData.value.wind.speed = convertSpeed(
          baseWeatherData.value.wind.speed,
          unitType.value
        )
      }

      additionalWeatherData.value.forEach((data) => {
        data.main.temp = convertTemperature(data.main.temp, unitType.value)
        data.wind.speed = convertSpeed(data.wind.speed, unitType.value)
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
