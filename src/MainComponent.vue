<template>
  <v-app
    id="app"
    :style="cssVars"
    :class="[smallSize ? 'app-is-small' : '', sidePanel ? 'app-side-panel' : '']"
  >
    <webgl-test @webgl2-disabled="showWebGL2Warning = true" />

    <div
      id="main-content"
    >
      <WorldWideTelescope
        :wwt-namespace="wwtNamespace"
      ></WorldWideTelescope>


      <!-- This contains the splash screen content -->

      <SplashScreen
        v-model="showSplashScreen"
        :color="accentColor"
        fullscreen-on-small
        @close="closeSplashScreen"
      >
        <div class="splash-content">
          <!-- the text styling comes through the a plain p-tag css selector 
            .splash-lead and .hightlight get larger fonts, and highlight gets accentColor
           -->
          <p class="splash-lead">
            Explore
          </p>
          <p class="highlight">
            the night sky
          </p>
          <p>
            &amp; let it inspire you to dare to do mighty things. it's reading rainbow
          </p>
        </div>
      </SplashScreen>

      <wwt-loader v-model="isLoading" />


      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen) -->

      <div
        v-show="!showSplashScreen"
        id="wwt-overlay"
      >
        <div id="top-content">
          <div id="left-buttons">
            <!-- icon-buttons default to size="1em"
             id's and classes will be added to the div.icon-wrapper
             it uses slotted styles so it's specificiy is (0,2,0)
              -->
            <icon-button
              v-model="showTextSheet"
              icon="question"
              :ariaLabel="showTextSheet ? 'Hide Info' : 'Learn More'"
              :color="accentColor"
              :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
              tooltip-location="start"
            >
            </icon-button>
            <icon-button
              v-model="showVideo"
              icon="video"
              ariaLabel="Watch video"
              :color="accentColor"
              tooltip-text="Watch video"
              tooltip-location="start"
            >
            </icon-button>
            <icon-button
              v-model="showShort"
              icon="mdi-youtube"
              ariaLabel="Watch short"
              :color="accentColor"
              tooltip-text="Watch short"
              tooltip-location="start"
            >
            </icon-button>
          </div>
          <div id="center-buttons">
          </div>
          <div id="right-buttons">
          </div>
        </div>

        <div id="bottom-content">
          <div v-if="!smallSize" id="body-logos">
            <credit-logos
              :default-logos="['cosmicds', 'wwt', 'nasa']"
              :extra-logos="extraLogos"
            />
          </div>
        </div>
      </div>


      <!-- This dialog contains the video that is displayed when the video icon is clicked -->

      <VideoWrapper
        v-model="showVideo"
        src="./test-video-vertical.mp4"
      />

      <!-- This dialog contains the YouTube short that is displayed when the YouTube icon is clicked -->

      <VideoWrapper
        v-model="showShort"
        src="https://youtube.com/shorts/-4kALiBHA5Y?si=Cse3ujkEkx49B3al"
      />
    </div>


    <!--
    This contains the informational content that is displayed when the book icon is clicked.
    It's an in-flow flex sibling of #main-content, so opening it shrinks the WWT view
    (from the side normally, from the bottom on small screens) instead of covering it.
  -->

    <div
      v-show="!showSplashScreen"
      id="side-drawer"
      :class="[sidePanel ? 'info-side' : 'info-bottom', showTextSheet ? 'side-drawer-open' : 'side-drawer-closed']"
    >
      <!--
        The Information Sheet and InfoPage are vue "tightly coupled" components
        This means an InfoPage can only be used within an InformationSheet.
        The info-page automatically registers itself as a tab in the information sheet, and unregisters itself when it is destroyed.

        v-model:tab is the name of the currently selected tab. It comes from the title in kebab-case or the value if specified
        Each tab must havea unique value. If the sheet is closed and you want to show a specific tab, you must set
        the showTextSheet to true and set the infoSheetTab to the value of the tab you want to show.
      -->
      <information-sheet
        v-model="showTextSheet"
        v-model:tab="infoSheetTab"
        :tab-color="accentColor"
        :slider-color="accentColor"
        :accent-color="accentColor"
        closable
        align-tabs="start"
      >
        <!-- info-page content is wrapped in a .info-page class  -->
        <info-page title="Information">
          <!-- we generally use heading level 3 (the same level as the tabs) -->
          <h3>Science Information</h3>
          <p>
            Learn some cool science facts
          </p>
        </info-page>

        <user-guide />
      </information-sheet>
    </div>
  </v-app>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ref, reactive, computed, onMounted, watch } from "vue";
import type { StyleValue } from "vue";
import { WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, WWTComponent as WorldWideTelescope, engineStore } from "@wwtelescope/engine-pinia";
import {
  BackgroundImageset,
  skyBackgroundImagesets,
  useWWTKeyboardControls,
  IconButton,
  CreditLogos,
} from "@cosmicds/vue-toolkit";
import SplashScreen from "./components/SplashScreen.vue";
import VideoWrapper from "./components/VideoWrapper.vue";
import WwtLoader from "./components/Loader.vue";
import WebglTest from "./components/WebGlTest.vue";
import InformationSheet from "./components/InformationSheet.vue";
import InfoPage from "./components/InfoPage.vue";
import UserGuide from "./components/UserGuide.vue";
import { useAppLayout } from "./composables/useAppLayout";

const extraLogos = [{
  src: "./CfA_Logo_Vertical_Reverse.png",
  href: "https://www.cfa.harvard.edu/",
  alt: "Center for Astrophysics | Harvard & Smithsonian Logo",
  name: "cfa",
}];

export interface MainComponentProps {
  wwtNamespace?: string;
}

const store = engineStore();

useWWTKeyboardControls(store);

const { smallSize, sidePanel } = useAppLayout();

withDefaults(defineProps<MainComponentProps>(), {
  wwtNamespace: "vue-ds-template",
});

const initialCameraParams = {
  raRad: 0,
  decRad: 0,
  zoomDeg: 60
} as Omit<GotoRADecZoomParams, "instant">;

const splash = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
const showSplashScreen = ref(splash);
const backgroundImagesets = reactive<BackgroundImageset[]>([]);

const showVideo = ref(false);
const showShort = ref(false);

const showWebGL2Warning = ref(false);

import {useTheme} from "vuetify";
const theme = useTheme();
// in the past we have used accentColor and accentColor2, but these serve the same purpose
// as vuetify's primary and secondary colors, so we tie them to that. vuetify components
// can access them directly as `color="primary" on the prop, and they are aleady available in the CSS as --v-theme-primary and --v-theme-secondary
const accentColor = computed(() => theme.current.value.colors.primary);
const accentColor2 = computed(() => theme.current.value.colors.secondary);

onMounted(() => {
  if (showWebGL2Warning.value) {
    showSplashScreen.value = false;
    WWTControl.singleton.canvas.setAttribute("hidden", "true");
    WWTControl.singleton.renderOneFrame = function() {};
    return;
  }

  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));
    store.gotoRADecZoom({
      ...initialCameraParams,
      instant: true
    }).then(() => positionSet.value = true);

    // If there are layers to set up, do that here!
    layersLoaded.value = true;
  });
});

const layersLoaded = ref(false);
const positionSet = ref(false);
const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

// we do not need to add the accent colors anymore since they are availabe via the css theme
// but we use this to demonstrate the pattern.
/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ["--accent-color" as any]: accentColor.value,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ["--accent-color-2" as any]: accentColor2.value
  } as StyleValue;
});


/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showTextSheet = ref(false);
const infoSheetTab = ref("");
/** open a tab on the info sheet */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function openInfoSheetTab(tabValue: string) {
  infoSheetTab.value = tabValue;
  showTextSheet.value = true;
}

/**
  This is convenient if there's any other logic that we want to run
  when the splash screen is closed
*/
function closeSplashScreen() {
  showSplashScreen.value = false;
}
</script>

<style lang="less">
@import url(@/css/universal.css);
:root {
  --default-font-size: clamp(0.7rem, 1.7vmin, 1.1rem);
  --default-line-height: clamp(1rem, 2.2vmin, 1.6rem);
}

// based on Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible:not(.v-btn):not(.v-field):not(.v-input) {
  // outline: 4px double white;
  // box-shadow: 0 0 0 2px black;
  outline: none; /* outline needs to be none to override the broswer */
  box-shadow: 
    inset 0 0 0 2px white,  /* from -2 to 0*/
    0 0 0 3px #0B5CB3, /* from 0 to 3 -  */
    0 0 0 5px white; /* from 0 to 5 */
  border-radius: .125rem;
}


html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;

  
  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#main-content {
  // containing block for the absolutely positioned WWT host and overlay
  position: relative;
  display: block;
  // shrinkable with no min-size floor, so an open drawer takes its share of the space
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
  font-size: 11pt;
}


// WWT fills #main-content, which gets its size from the flex layout above.
// This breaks if #main-content stops having a definite size from layout.
.wwtelescope-component {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.wwtelescope-component > canvas {
  display: block;
  width: 100%;
  height: 100%;
}

// #wwt-overlay is positioned against #main-content, not the viewport
#wwt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 1rem;
  pointer-events: none;

  display: flex;
  flex-direction: column;
  justify-content: space-between; // pushes top and bottom content apart
}

#wwt-overlay > * {
  // turns #wwt-overlay into a stacking context
  isolation: isolate;
}


#top-content {
  width: 100%;
  pointer-events: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;
  pointer-events: auto;
}

#bottom-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: none;
  align-items: center;
  gap: 5px;
}


/** ====== Define our standard Side/Bottom panel layout
The default DOM structure is basically
<div #app>
  <div .v-application__wrap>
    <div #main-content>
      <WorldWideTelescope />
      <div #wwt-overlay />
    </div>
    <div #side-drawer />
  </div>
</div>
======== */

// Default is the column/bottom-panel layout; a side panel opts in with .app-side-panel
#app > .v-application__wrap {
  // default, but specify anyway
  flex-direction: column;
  max-height: 100svh;
}

#app.app-side-panel > .v-application__wrap {
  flex-direction: row;
}


// side-panel layout: #side-drawer follows #main-content in the DOM,
// so flipping the order is what puts the panel on the left of the view
// order sets the order of the children of a flex container
#app.app-side-panel {
  #main-content {
    order: 1; // on the right
  }

  #side-drawer {
    order: 0; // on the left
  }
}

// in-flow flex sibling of #main-content, so opening it shrinks the WWT view
// instead of covering it. Default is the bottom panel: full width, growing in height.
#side-drawer {
  flex: 0 0 auto;
  overflow: hidden;
  width: 100%;
  height: 0;
  border-radius: 5px 5px 0 0;

  &.side-drawer-open {
    height: 34%;
  }
}

// side panel: full height, growing in width
.app-side-panel #side-drawer {
  width: 0;
  height: 100%;
  border-radius: 0 5px 5px 0;

  &.side-drawer-open {
    width: 34%;
  }
}

.info-text {
  padding: 1rem;
}

// Basic text styling for the InformationSheet's content - simpler to set
// here globally than to thread a heading-color prop through.
.cds-info-sheet .info-text {
  h3, h4, h5 {
    color: steelblue;
  }
}
</style>
