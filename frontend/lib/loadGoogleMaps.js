let mapsPromise;

// A script load event (or the maps namespace) does not imply async API readiness.
export function loadGoogleMaps(apiKey) {
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const callback = '__himalayaGoogleMapsReady';
    let script = document.getElementById('google-maps-api-script');
    let importing = false;
    let settled = false;
    const cleanup = () => {
      clearTimeout(timeout);
      clearInterval(poll);
      script?.removeEventListener('error', onError);
      delete window[callback];
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(window.google.maps);
    };
    const onError = () => finish(new Error('Google Maps failed to load. Check API key and referrer restrictions.'));
    const checkReady = async () => {
      if (importing || settled) return;
      const maps = window.google?.maps;
      if (typeof maps?.importLibrary === 'function') {
        importing = true;
        try {
          await Promise.all(['maps', 'marker', 'geometry', 'places'].map((name) => maps.importLibrary(name)));
          if (typeof maps.Map !== 'function') throw new Error('Google Maps constructor is unavailable.');
          finish();
        } catch (error) {
          finish(error);
        }
      } else if (typeof maps?.Map === 'function' && typeof maps?.places?.Autocomplete === 'function' && maps?.geometry) {
        finish();
      }
    };
    const timeout = setTimeout(() => finish(new Error('Google Maps timed out while loading. Please reload the page.')), 30000);
    // Also handles an existing script whose load event already fired.
    const poll = setInterval(checkReady, 100);
    window[callback] = checkReady;
    if (!script && !window.google?.maps?.importLibrary && typeof window.google?.maps?.Map !== 'function') {
      script = document.createElement('script');
      script.id = 'google-maps-api-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry,places&loading=async&callback=${callback}`;
      script.async = true;
      script.addEventListener('error', onError);
      document.body.appendChild(script);
    } else {
      script?.addEventListener('error', onError);
    }
    void checkReady();
  }).catch((error) => {
    mapsPromise = undefined;
    throw error;
  });

  return mapsPromise;
}
