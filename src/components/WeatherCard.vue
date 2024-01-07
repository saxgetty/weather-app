<template>
  <div
    class="card bg-white shadow-lg p-20 rounded-3xl transition duration-500 ease-in-out transform hover:scale-105"
  >
    <button class="btn btn-circle btn-outline absolute top-6 right-6" @click="removeCard" v-if="removable">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <div class="flex justify-between items-start">
      <!-- Left section: Weather icon and Right section: Location, date -->
      <div class="flex items-start">
        <!-- Weather icon -->
        <div class="mr-4">
          <img
            v-if="weatherData.weather && weatherData.weather.length > 0"
            :src="getWeatherIconURL(weatherData)"
            alt="Weather Icon"
            width="64"
            height="64"
          />
        </div>

        <!-- Location and Date -->
        <div>
          <p class="font-bold text-3xl">{{ getCurrentLocation() }}</p>
          <p class="text-lg">{{ formattedDate }}</p>
        </div>
      </div>

      <!-- Right section: Temperature and wind speed -->
      <div class="flex flex-col items-end">
        <p class="font-bold text-3xl">
          {{ weatherData.main.temp }} {{ formatTemperature }}
        </p>
        <p class="text-lg">
          {{ weatherData.wind.speed }} {{ formatWindSpeed }}
        </p>
      </div>
    </div>

    <!-- Bottom section: Days of the week temperatures -->
    <div class="pt-20 text-center">
      <!-- Placeholder for days of the week temperatures -->
      <p>Days of the week temperatures</p>
    </div>
  </div>
</template>

<script>
import { defineComponent, watch, computed } from "vue"
import LoadingCircle from "@/components/LoadingCircle.vue"
import { BaseIconService } from "@/services/BaseIconService"

export default defineComponent({
  name: "WeatherCard",
  components: {
    LoadingCircle,
  },
  props: {
    weatherData: {
      type: Object,
      default: null,
    },
    removable: {
      type: Boolean,
      default: false,
    },
    unitType: {
      type: String,
      default: "imperial",
    },
  },
  setup(props, { emit }) {
    const currentDate = new Date()
    const options = { month: "long", day: "2-digit" }
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      currentDate
    )

    const formatTemperature = computed(() => {
      return `${props.unitType === "imperial" ? "°F" : "°C"}`
    })

    const formatWindSpeed = computed(() => {
      return `${props.unitType === "imperial" ? "mph" : "km/h"}`
    })

    const getCurrentLocation = () => {
      if (
        props.weatherData &&
        props.weatherData.name &&
        props.weatherData.sys &&
        props.weatherData.sys.country
      ) {
        return `${props.weatherData.name}`
      } else if (props.weatherData && props.weatherData.name) {
        return props.weatherData.name
      }
      return "Unknown Location"
    }

    const getWeatherIconURL = (weatherData) => {
      if (
        weatherData &&
        weatherData.weather &&
        weatherData.weather.length > 0
      ) {
        const weatherDescription =
          weatherData.weather[0].description.toLowerCase()

        if (weatherDescription in BaseIconService) {
          return BaseIconService[weatherDescription]
        }
      }

      return "https://img.icons8.com/sf-black-filled/64/default.png" // TODO: update the default icon
    }

    const removeCard = () => {
      emit("removeCard")
    }

    watch(
      () => props.unitType,
      () => {}
    )

    return {
      formattedDate,
      getCurrentLocation,
      getWeatherIconURL,
      removeCard,
      formatWindSpeed,
      formatTemperature,
    }
  },
})
</script>
