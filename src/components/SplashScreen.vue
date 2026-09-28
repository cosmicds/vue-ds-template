<template>
  <v-overlay
    id="splash-overlay"
    :model-value="showSplashScreen"
    :scrim="false"

    absolute
    :style="cssVars"
    transition="fade-transition"
  >
    <focus-trap>
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
        <div class="background">
          <div class="background-blur"></div>
        </div>
        <font-awesome-icon
          id="close-splash-button"
          icon="xmark"
          tabindex="0"
          aria-hidden="false"
          @click="closeSplashScreen"
          @keyup.enter="closeSplashScreen"
        />
        <slot />

        <div v-if="!props.hideButton">
          <v-btn
            class="splash-get-started"
            color="secondary"
            :density="(xs || isLandscape) ? 'compact' : 'default'"
            :size="width < 250 ? 'large' : 'x-large'"
            variant="elevated"
            rounded="lg"
            @click="closeSplashScreen"
            @keyup.enter="closeSplashScreen"
          >
            {{ props.loaded ? 'Get Started' : 'Loading...' }}
          </v-btn>
        </div>

        <div id="splash-screen-acknowledgements">
          <div id="splash-screen-logos">
            <credit-logos
              id="splash-screen-credit-logos"
              logo-size="clamp(36px, 5vmin, 65px)"
              :default-logos="['cosmicds', 'wwt', 'nasa']"
              :extra-logos="cfaExtraLogo"
            />
          </div>
        </div>
      </div>
    </focus-trap>
  </v-overlay>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { FocusTrap } from "focus-trap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { CreditLogos } from "@cosmicds/vue-toolkit";

const { width, height, xs } = useDisplay();
const isLandscape = computed(() => width.value > height.value * 1.25);

const cfaExtraLogo = [{
  src: "./CfA_Logo_Vertical_Reverse.png",
  href: 'https://www.cfa.harvard.edu/',
  alt: 'Center for Astrophysics | Harvard & Smithsonian Logo',
  name: 'cfa',
}];

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cssVars?: any;
  color?: string,
  highlightColor?: string,
  loaded?: boolean,
  /** an optional background image. this will go into a css url(<background>)
   * If in public: ./background.jpg, if in src: @/assets/background.jpg
   */
  backgroundImage?: string,
  /** hide the built-in "Get Started" button, e.g. when your own slot content has its own CTA */
  hideButton?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  cssVars: () => ({}),
  loaded: true,
  color: 'white',
  highlightColor: 'white'
});

const cssVars = computed(() => {
  return {
    ...props.cssVars,
    '--accent-color': props.color,
    '--background-image': props.backgroundImage ? `url("${props.backgroundImage}")` : 'none',
    '--background-opacity': props.backgroundImage ? 1 : 0.5,
  };
});

const emits = defineEmits(['close']);

const showSplashScreen = defineModel<boolean>({ default: true });


// watch(() => props.loaded, (l) =>{
//   if (l) {
//     setTimeout( () => {
//       showSplashScreen.value = false;
//     }, 5000)
//   }
// })


function closeSplashScreen() {
  showSplashScreen.value = false;
  emits('close');
}


</script>


<style lang="less">

#splash-overlay {
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 5vh);
  transition: width 0.5s, height 0.5s;
}

:deep(.v-fade-transition-enter-active),
:deep(.v-fade-transition-leave-active) {
  transition-duration: 6000ms !important;
}

#splash-screen {
  color: white;
  user-select: none;
  contain: paint;

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }
  --border-radius: 30px;

  .background {
    position: fixed;
    inset: 0;
    background-color: black;
    background-image: var(--background-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: var(--background-opacity);
    // dims a background photo enough to keep text over it legible; has no
    // visible effect on the plain black fallback
    filter: brightness(0.7);
    contain: strict;
    z-index: -1;
    border-radius: var(--border-radius);
  }

  .background-blur {
    backdrop-filter: blur(6px) saturate(1);
    position: fixed;
    inset: 0;
    border-radius: var(--border-radius);
  }

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-content: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-inline: 2rem;

  border-radius: var(--border-radius);
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Source Sans 3', 'Roboto', sans-serif;

  div {
    margin-inline: auto;
    text-align: center;
  }

  a {
    color: white;
  }
  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Source Sans 3', 'Roboto', sans-serif;
    font-weight: regular;
    vertical-align: middle;
  }

  p.highlight {
    color: var(--accent-color);
    text-transform: uppercase;
    font-weight: bold;
  }


  p.small {
    font-size: 0.8em;
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    position: absolute;
    top: 20px;
    right: 20px;
    text-align: end;
    font-size: min(5vw, 4vh);
    padding: 0.25rem;
    margin: -0.25rem;

    &:hover {
      cursor: pointer;
    }
  }

  .splash-content {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    line-height: 130%;

  }

  .splash-get-started {
    border: 2px solid white;
    font-size: 0.5em;
    font-weight: bold !important;
  }

  #splash-screen-guide {
    margin-block: 1.5em;
    font-size: min(5vw, 4vh);
    line-height: 140%;
    width: 75%;

    .v-col{
      padding: 0;
    }

    .svg-inline--fa {
      color:var(--accent-color);
      margin: 0 10px;
    }
  }

  #splash-screen-acknowledgements {
    // margin-top: 3rem;
    margin: clamp(0.5rem, 3vh, 3rem) auto;
    margin-bottom: 0;
    font-size: 1em;
    line-height: calc(var(--default-line-height));
    width: 80%;

    @media only screen and (max-width: 600px) {
      width: 80%;
    }
  }

  #splash-screen-credit-logos {
    img {
    // height: 65px;
    vertical-align: middle;
    margin-inline: 0.5em;
    margin-block: 0.25em;
  }

    // the CfA wordmark is a wide, thin image, so at the shared logo-size
    // height its text reads much smaller than the other (roughly square)
    // logos
    .logo-cfa img {
      height: clamp(39px, 7vmin, 91px);
    }

    svg {
      vertical-align: middle;
      height: 24px;
    }
  }
}

@media (max-height: 500px) {
  #splash-screen {
    // display: flex;
    // flex-direction: column;
    // max-width: 200vh;
    // justify-content: center;
    // align-items: center;
    // gap: calc(0.5 * var(--default-line-height));
    overflow: hidden;

  .splash-content {
    line-height: 75%;
  }

  .splash-get-started {
    margin-bottom: 0;
  }

  #splash-screen-acknowledgements {
    font-size: 1em;
  }
}

}

@media (max-height: 310px) {
  #splash-screen {
    width: 50vw;
    padding-block: 10px;
  }
  #splash-screen-acknowledgements  {
    display: none;
  }
}

</style>
