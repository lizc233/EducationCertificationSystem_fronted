<template>
  <section class="section-card">
    <div v-if="title || $slots.header || $slots.extra" class="section-card__header">
      <div>
        <slot name="header">
          <h3 v-if="title" class="section-card__title">{{ title }}</h3>
        </slot>
      </div>
      <div v-if="$slots.extra" class="section-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <slot />
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>
