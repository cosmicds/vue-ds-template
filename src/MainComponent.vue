<template>
<v-app
  id="app"
  :style="cssVars"
>
  <div
    id="main-content"
  >
    <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>


    <!-- This contains the splash screen content -->

    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      :style="cssVars"
      id="splash-overlay"
    >
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
        <div
          id="close-splash-button"
          @click="closeSplashScreen"
          >&times;
        </div>
        <div id="splash-screen-text">
          <p>Splash Screen Content</p>
        </div>
        <div id="splash-screen-acknowledgements" class="small">
          This Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-logos">
            <credit-logos logo-size="5vmin"/>
          </div>
        </div>
      </div>
    </v-overlay>

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>


    <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

    <div id="top-content">
      <div id="left-buttons">
        <icon-button
          v-model="showTextSheet"
          fa-icon="book-open"
          :color="buttonColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        >
        </icon-button>
        <icon-button
          v-model="showVideoSheet"
          fa-icon="video"
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
      <div id="body-logos" v-if= "!smallSize">
        <credit-logos/>
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
          @click="showVideoSheet = false"
          @keyup.enter="showVideoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <video
          controls
          id="info-video"
        >
          <source src="" type="video/mp4">
        </video>
      </div>
    </v-dialog>


    <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->

    <v-dialog
      :style="cssVars"
      class="bottom-sheet"
      id="text-bottom-sheet"
      hide-overlay
      persistent
      no-click-animation
      absolute
      width="100%"
      :scrim="false"
      location="bottom"
      v-model="showTextSheet"
      transition="dialog-bottom-transition"
    >
      <v-card height="100%">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="accentColor"
          :slider-color="accentColor"
          id="tabs"
          dense
        >
          <v-tab class="info-tabs" tabindex="0"><h3>Information</h3></v-tab>
          <v-tab class="info-tabs" tabindex="0"><h3>Using WWT</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showTextSheet = false"
          @keyup.enter="showTextSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                Information goes here
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                <v-container>
                  <v-row align="center">
                  <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Pan
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? ":" : "or" }}  <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row align="center">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Zoom
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":" : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="credits">
                      <h3>Credits:</h3>
                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
                      John Lewis<br>
                      Jon Carifio<br>
                      Pat Udomprasert<br>
                      Alyssa Goodman<br>
                      Mary Dussault<br>
                      Harry Houghton<br>
                      Anna Nolin<br>
                      Evaluator: Sue Sunbury<br>
                      <br>
                      <h4>WorldWide Telescope Team:</h4>
                      Peter Williams<br>
                      A. David Weigel<br>
                      Jon Carifio<br>
                      </div>
                      <v-spacer class="end-spacer"></v-spacer>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <funding-acknowledgement/>
                    </v-col>
                  </v-row>
                </v-container>              
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>

  </div>
</v-app>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@cosmicds/vue-toolkit";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";

type SheetType = "text" | "video" | null;

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wwtNamespace: {
      type: String,
      required: true
    },
    initialCameraParams: {
      type: Object as PropType<Omit<GotoRADecZoomParams, 'instant'>>,
      default() {
        return {
          raRad: 0,
          decRad: 0,
          zoomDeg: 60
        };
      }
    }
  },
  data() {
    const showSplashScreen = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
    return {
      showSplashScreen,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      
      accentColor: "#ffffff",
      buttonColor: "#ffffff",

      tab: 0
    };
  },

  mounted() {
    this.waitForReady().then(async () => {
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.gotoRADecZoom({
        ...this.initialCameraParams,
        instant: true
      }).then(() => this.positionSet = true);

      // If there are layers to set up, do that here!
      this.layersLoaded = true;

    });
  },

  computed: {

    /**
    These properties relate to the state of the mini.
    `isLoading` is a bit redundant here, but it could potentially have
    independent logic.
    */
    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
    },

    /**
    Properties related to device/screen characteristics
    */
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },

    /**
    This lets us inject component data into element CSS
    */
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },

    /**
    Computed flags that control whether the relevant dialogs display.
    The `sheet` data member stores which sheet is open, so these are just
    computed wrappers around modifying/querying that which can be used as
    dialog v-model values
    */
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
      }
    },
    showVideoSheet: {
      get(): boolean {
        return this.sheet === "video";
      },
      set(value: boolean) {
        this.selectSheet('video');
        if (!value) {
          const video = document.querySelector("#info-video") as HTMLVideoElement;
          video.pause();
        }
      }
    }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false; 
    },

    selectSheet(name: SheetType) {
      if (this.sheet === name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    }
  }
});
</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/fonts/HighwayGothicNarrow.ttf");
}

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
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
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


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

#splash-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#splash-screen {
  color: #FFFFFF;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: space-around;

  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
  font-size: min(8vw, 7vh);

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  padding-top: 4rem;
  padding-bottom: 1rem;

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }

  div {
    margin-inline: auto;
    text-align: center;
  }

  .small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #close-splash-button {
    position: absolute;
    top: 0.5rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
  }
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

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
    height: 34%;
  }

  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }
  
  .info-text {
    height: 33vh;
    padding-bottom: 25px;
  
    & a {
      text-decoration: none;
    }
  }
  
  .close-icon {
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
  
  .scrollable {
    overflow-y: auto;
  }
  
  #tab-items {
    // padding-bottom: 2px !important;
  
    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";
  
      .end-spacer {
        height: 25px;
      }
    }
  
  }
  
  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}
</style>
