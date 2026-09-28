<template>
  <v-window-item
    :value="tabValue"
    class="flex-grow-1 info-page"
    :class="[`info-page-${tabValue}`, {'info-page-active': _isActive}]"
    :style="cssVars"
  >
    <div class="info-text">
      <slot />
    </div>
  </v-window-item>
</template>

<script setup lang="ts">
import { inject, computed, onUnmounted } from "vue";

import { injectionKey } from "./InformationSheet.vue";

const props = defineProps<{
    title: string,
    value?: string,
    bgColor?: string | undefined,
  }>();

const cssVars = computed(() => (props.bgColor ? { '--info-sheet-page-bg': props.bgColor } : {}));

const tabsProvider = inject(injectionKey, null);
if (!tabsProvider?.withinTabs) {
  throw new Error('InformationPage must be used within an InformationSheet');
}

const kebabCase = (str: string) => str
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .replace(/[\s_]+/g, '-')
  .toLowerCase();

const tabValue = props.value ?? kebabCase(props.title);

tabsProvider.registerTab(tabValue, props.title);

const _isActive = computed(() => tabsProvider.activeTab.value === tabValue);

onUnmounted(() => {
  const unregisered = tabsProvider.unregisterTab(tabValue);
  if (!unregisered) {
    console.warn(`InfoPage "${props.title}" was not unregistered. Check that it was registered properly`);
  } else {
    console.log(`InfoPage "${props.title}" unregistered successfully`);
  }
});
</script>


<!-- we also make sure they are "scoped" by specifying them as children of cds-info-sheet belonging in the cds-info-sheet  -->
<style scoped lang="less">
// v-card
.cds-info-sheet .info-page {
  display: block;
  position: relative;
  z-index: 0;

  overflow-x: hidden;
  overflow-wrap: break-word;
  background-color: var(--info-sheet-page-bg);

  // takes the place of .scrollable
  overflow-y: visible;
  height: 100%;
}

// What v-card-text
.cds-info-sheet .info-text {
  flex: 1 1 auto;
  line-height: 1.425;

  // takes the place of .scrollable
  overflow-y: visible;
  height: 100%;
}
</style>
