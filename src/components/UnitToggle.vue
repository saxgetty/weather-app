<template>
  <div class="flex items-center cursor-pointer gap-2">
    <span class="label-text">Metric</span> 
    <input
      type="checkbox"
      class="toggle"
      :checked="unitType === 'imperial'"
      @change="toggleUnit"
    />
    <span class="label-text">Imperial</span> 
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
