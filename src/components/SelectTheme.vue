<template>
  <div class="space-x-2">
    <select
      class="select select-bordered w-full max-w-xs"
      @change="changeTheme"
    >
      <option disabled selected>Theme</option>
      <option>retro</option>
      <option>fantasy</option>
    </select>
  </div>
</template>

<script>
import { onMounted } from "vue"
import { themeChange } from "theme-change"

export default {
  name: "SelectTheme",
  setup() {
    onMounted(() => {
      // Retrieve the saved theme from local storage
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        themeChange(savedTheme)
      }
    })

    const changeTheme = (event) => {
      // Get the selected theme value
      const selectedTheme = event.target.value
      // Save the selected theme to local storage
      localStorage.setItem("theme", selectedTheme)
      // Apply the selected theme
      themeChange(selectedTheme)
    }

    return {
      changeTheme,
    }
  },
}
</script>
