<template>
  <div class="standard-page">
    <header class="page-header">
      <div class="page-header__main">
        <el-breadcrumb v-if="breadcrumbItems.length">
          <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item">
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <p v-if="description" class="page-header__description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="page-header__actions">
        <slot name="actions" />
      </div>
    </header>

    <section v-if="$slots.filters" class="filter-panel">
      <slot name="filters" />
    </section>

    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { buildBreadcrumbs } from '../../data/navigation';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  },
  description: {
    type: String,
    default: ''
  }
});

const route = useRoute();

const breadcrumbItems = computed(() => {
  if (props.breadcrumbs.length) {
    return props.breadcrumbs;
  }

  return buildBreadcrumbs(String(route.query.from || route.path), props.title ? [props.title] : []);
});
</script>
