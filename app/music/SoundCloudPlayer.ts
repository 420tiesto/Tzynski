declare global {
    interface Window {
      SC: any;
    }
  }
  
  export class SoundCloudPlayer {
    private widget: any;
    private onTrackChangeCallback: (title: string) => void;
  
    constructor(iframeElement: HTMLIFrameElement, onTrackChange: (title: string) => void) {
      this.onTrackChangeCallback = onTrackChange;
      
      // Load the SoundCloud Widget API
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      document.body.appendChild(script);
  
      script.onload = () => {
        this.widget = window.SC.Widget(iframeElement);
        
        // Set up event listeners
        this.widget.bind(window.SC.Widget.Events.READY, () => {
          this.widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, () => {
            this.widget.getCurrentSound((soundData: any) => {
              if (soundData) {
                this.onTrackChangeCallback(soundData.title);
              }
            });
          });
        });
      };
    }
  
    play() {
      this.widget?.play();
    }
  
    pause() {
      this.widget?.pause();
    }
  
    next() {
      this.widget?.next();
    }
  
    previous() {
      this.widget?.prev();
    }
  }