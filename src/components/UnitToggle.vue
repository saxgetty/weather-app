<template>
  <div class="ml-4">
    <!-- <input type="checkbox" class="toggle" checked /> -->
    <input
      type="checkbox"
      class="toggle"
      :checked="unitType === 'imperial'"
      @change="toggleUnit"
    />
  </div>
</template>

<script>
export default {
  name: "UnitToggle",
  props: {
    unitType: String,
  },
  methods: {
    toggleUnit(event) {
      this.$emit("toggleUnit", event.target.checked)
    },
  },
}
</script>
