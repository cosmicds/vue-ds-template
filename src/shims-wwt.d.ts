import "@wwtelescope/engine"; // we include top-level import so that it merges with existing engine declarations

declare module "@wwtelescope/engine" {
  // Typescript will merge this with the existing WWTControl interface
  interface WWTControl {
    canvas: HTMLCanvasElement;
  }
}
