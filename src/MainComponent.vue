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
        @close="closeSplashScreen"
      >
        <p class="small text-center">
          This Data Story is brought to you by
          <a
            href="https://www.cosmicds.cfa.harvard.edu/"
            target="_blank"
            rel="noopener"
          >Cosmic Data Stories</a> and
          <a
            href="https://www.worldwidetelescope.org/home/"
            target="_blank"
            rel="noopener"
          >WorldWide Telescope</a>.
        </p>
      </SplashScreen>

      <wwt-loader v-model="isLoading" />


      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

      <div id="top-content">
        <div id="left-buttons">
          <icon-button
            v-model="showTextSheet"
            icon="book-open"
            :ariaLabel="showTextSheet ? 'Hide Info' : 'Learn More'"
            :color="buttonColor"
            :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
            tooltip-location="start"
          >
          </icon-button>
          <icon-button
            v-model="showVideoSheet"
            icon="video"
            ariaLabel="Watch video"
            :color="buttonColor"
            tooltip-text="Watch video"
            tooltip-location="start"
          >
          </icon-button>
        </div>
        <div id="center-buttons">
        </div>
        <div id="right-buttons">
        </div>
      </div>


      <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

      <div id="bottom-content">
        <div v-if="!smallSize" id="body-logos">
          <credit-logos
            :default-logos="['cosmicds', 'wwt', 'nasa']"
            :extra-logos="extraLogos"
          />
        </div>
      </div>


      <!-- This dialog contains the video that is displayed when the video icon is clicked -->

      <v-dialog
        id="video-container"
        v-model="showVideoSheet"
        transition="slide-y-transition"
        fullscreen
      >
        <div class="video-wrapper">
          <font-awesome-icon
            id="video-close-icon"
            class="close-icon"
            icon="times"
            size="lg"
            tabindex="0"
            @click="showVideoSheet = false"
            @keyup.enter="showVideoSheet = false"
          ></font-awesome-icon>
          <video
            id="info-video"
            controls
          >
            <source src="" type="video/mp4">
          </video>
        </div>
      </v-dialog>


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
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, WWTComponent as WorldWideTelescope, engineStore } from "@wwtelescope/engine-pinia";
import {
  BackgroundImageset,
  skyBackgroundImagesets,
  blurActiveElement,
  useWWTKeyboardControls,
  IconButton,
  CreditLogos,
} from "@cosmicds/vue-toolkit";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import SplashScreen from "./components/SplashScreen.vue";
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

type SheetType = "text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface MainComponentProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const store = engineStore();

useWWTKeyboardControls(store);

const { smallSize, sidePanel } = useAppLayout();

const props = withDefaults(defineProps<MainComponentProps>(), {
  wwtNamespace: "vue-ds-template",
  initialCameraParams: () => {
    return {
      raRad: 0,
      decRad: 0,
      zoomDeg: 60
    };
  }
});

const splash = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
const showSplashScreen = ref(splash);
const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#ffffff");
const buttonColor = ref("#ffffff");

const showWebGL2Warning = ref(false);

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
      ...props.initialCameraParams,
      instant: true
    }).then(() => positionSet.value = true);

    // If there are layers to set up, do that here!
    layersLoaded.value = true;
  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
  };
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

const showVideoSheet = computed({
  get() {
    return sheet.value === "video";
  },
  set(value: boolean) {
    selectSheet("video");
    if (!value) {
      const video = document.querySelector("#info-video") as HTMLVideoElement;
      video.pause();
    }
  }
});

/**
  This is convenient if there's any other logic that we want to run
  when the splash screen is closed
*/
function closeSplashScreen() {
  showSplashScreen.value = false;
}

function selectSheet(sheetType: SheetType | null) {
  if (sheet.value === sheetType) {
    sheet.value = null;
    nextTick(() => {
      blurActiveElement();
    });
  } else {
    sheet.value = sheetType;
  }
}
</script>

<style lang="less">
:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
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
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}


#top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;
}

#bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible,
button:focus-visible,
.focus-visible,
.v-selection-control--focus-visible .v-selection-control__input {
  outline: 9px double white !important;
  box-shadow: 0 0 0 6px black !important;
  border-radius: .125rem;
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;

  #video-close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;
    
    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#info-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
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
