<template>
  <div
    class="transition duration-500 ease-in-out transform bg-white rounded-lg hover:scale-105 border flex flex-col justify-center items-center text-center p-6"
  >
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
            Temperature: {{ weatherData.main.temp }} °F
          </p>
          <p v-if="weatherData.weather && weatherData.weather.length > 0">
            Description: {{ weatherData.weather[0].description }}
          </p>
          <p v-if="weatherData.wind">
            Wind Speed: {{ weatherData.wind.speed }} m/s
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
import { defineComponent, ref } from "vue"
import LoadingCircle from "@/components/LoadingCircle.vue"

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
  },
  setup(props, { emit }) {
    const currentDate = new Date()
    const options = { month: "long", day: "2-digit" }
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      currentDate
    )

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

    const removeCard = () => {
      // Emit an event to notify the parent component about removal
      emit("removeCard")
    }

    const convertToCelsius = (tempF) => {
      const tempC = ((tempF - 32) * 5) / 9
      return tempC.toFixed(2)
    }

    return {
      formattedDate,
      getCurrentLocation,
      removeCard,
      convertToCelsius,
    }
  },
})
</script>
