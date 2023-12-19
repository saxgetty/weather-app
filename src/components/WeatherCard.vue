<template>
  <div class="transition duration-500 ease-in-out transform bg-white rounded-3xl hover:scale-105 border flex flex-col justify-center items-center text-center p-6">
    <button
      class="absolute top-2 right-2 text-red-500"
      @click="removeCard"
      v-if="removable"
    >
      X
    </button>
    <div class="text-md font-bold flex flex-col text-gray-900">
      <span class="uppercase">
        <div v-if="weatherData">
          {{ getCurrentLocation() }}
          <!-- Additional Weather Details -->
          <p v-if="weatherData.main">
            {{ weatherData.main.temp }} {{ formatTemperature }}
          </p>
          <div class="flex items-center justify-center">
            <img
              v-if="weatherData.weather && weatherData.weather.length > 0"
              :src="getWeatherIconURL(weatherData)"
              class="mx-auto"
              alt="Weather Icon"
              width="64"
              height="64"
            />
          </div>
          <p v-if="weatherData.wind">
            {{ weatherData.wind.speed }} {{ formatWindSpeed }}
          </p>
          <!-- Add more weather details as needed -->
        </div>
        <div v-else-if="error" class="text-red-500">
          {{ error }}
        </div>
        <div v-else>
          <LoadingCircle />
        </div>
      </span>
      <span class="font-normal text-gray-700 text-sm">{{ formattedDate }}</span>
    </div>
    <!-- Other weather details here -->
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
      return `${props.unitType === 'imperial' ? '°F' : '°C'}`
    })

    const formatWindSpeed = computed(() => {
      return `${props.unitType === 'imperial' ? 'mph' : 'm/s'}`
    })

    const getCurrentLocation = () => {
      if (
        props.weatherData &&
        props.weatherData.name &&
        props.weatherData.sys &&
        props.weatherData.sys.country
      ) {
        return `${props.weatherData.name}, ${props.weatherData.sys.country}`
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

    watch(() => props.unitType, () => {
    })

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
