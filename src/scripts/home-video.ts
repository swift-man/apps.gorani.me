type MotionPreference = Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>;
type VideoRoot = Pick<Document, 'querySelectorAll'>;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function readsBooleanDataAttribute(value: string | undefined): boolean {
  return value === 'true';
}

export async function applyHomeVideoPreference(
  video: HTMLVideoElement,
  motionPreference: Pick<MediaQueryList, 'matches'>
): Promise<void> {
  const wantsAutoplay = readsBooleanDataAttribute(video.dataset.autoplay);
  const wantsControls = readsBooleanDataAttribute(video.dataset.controls);

  if (motionPreference.matches) {
    video.autoplay = false;
    video.controls = true;
    video.pause();
    return;
  }

  if (!wantsAutoplay) {
    video.autoplay = false;
    video.controls = wantsControls;
    return;
  }

  video.autoplay = true;
  video.controls = true;

  try {
    await video.play();
    if (!motionPreference.matches) {
      video.controls = wantsControls;
    }
  } catch {
    video.controls = true;
  }
}

export function setupHomeVideos(
  root: VideoRoot = document,
  motionPreference: MotionPreference = window.matchMedia(REDUCED_MOTION_QUERY)
): () => void {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('[data-home-video]'));
  if (videos.length === 0) return () => {};

  const applyPreferences = () => {
    videos.forEach((video) => void applyHomeVideoPreference(video, motionPreference));
  };
  const handlePreferenceChange = () => applyPreferences();

  applyPreferences();
  motionPreference.addEventListener('change', handlePreferenceChange);

  return () => motionPreference.removeEventListener('change', handlePreferenceChange);
}
