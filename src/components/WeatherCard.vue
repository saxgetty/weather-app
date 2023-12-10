<template>
  <div
    class="w-64 md:mr-20 mb-10 transition duration-500 ease-in-out transform bg-white rounded-lg hover:scale-105 border flex flex-col justify-center items-center text-center p-6"
  >
    <button class="absolute top-2 right-2 text-red-500" @click="removeCard" v-if="removable">
      X
    </button>
    <div class="text-md font-bold flex flex-col text-gray-900">
      <span class="uppercase">
        <div v-if="weatherData">
          {{ getCurrentLocation(weatherData) }}
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
import LoadingCircle from "@/components/LoadingCircle.vue";
export default {
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
  methods: {
    getCurrentLocation(weatherData) {
      if (
        weatherData &&
        weatherData.name &&
        weatherData.sys &&
        weatherData.sys.country
      ) {
        return `${weatherData.name}, ${weatherData.sys.country}`
      } else if (weatherData && weatherData.name) {
        return weatherData.name
      }
      return "Unknown Location"
    },
    removeCard() {
      // Emit an event to notify the parent component about removal
      this.$emit("removeCard");
    },
    convertToCelsius(tempF) {
      const tempC = ((tempF - 32) * 5) / 9
      return tempC.toFixed(2)
    },
  },
}
</script>
