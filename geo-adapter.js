/**
 * Devuelve coords {lat, lng} usando:
 * 1) Capacitor Geolocation (si existe)
 * 2) navigator.geolocation (fallback en web)
 */
async function getCurrentCoords() {
  try {
    // Detecta si estás dentro de un runtime nativo de Capacitor
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor);

    if (isNative && window.Capacitor && window.Capacitor.Plugins) {
      // Capacitor v3/v4/v5: plugins disponibles en Capacitor.Plugins o registrados
      const Geo = window.Capacitor.Plugins.Geolocation || window.Geolocation; // según setup
      if (!Geo) throw new Error('Capacitor Geolocation no está accesible');

      // Pide permisos (Android 6+ requiere runtime permission)
      if (Geo.requestPermissions) {
        await Geo.requestPermissions(); // { location: 'granted' | 'denied' }
      }

      const pos = await Geo.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }

    // Fallback web
    const pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocalización no disponible'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, timeout: 10000, maximumAge: 0
      });
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (err) {
    console.warn('No se pudo obtener ubicación:', err);
    throw err;
  }
}

/** Actualiza el iframe de Google Maps con query + coords (si hay) */
function updateMapIframe(queryInputId, iframeId, coords) {
  const qInput = document.getElementById(queryInputId);
  const map = document.getElementById(iframeId);
  const q = encodeURIComponent((qInput?.value || 'emprendimientos') + '');
  if (coords && coords.lat && coords.lng) {
    map.src = `https://www.google.com/maps?q=${q}%20near%20${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}&output=embed`;
  } else {
    map.src = `https://www.google.com/maps?q=${q}&output=embed`;
  }
}

/** Conecta botones estándar: "Usar mi ubicación" y "Buscar en el mapa" */
function wireMapUI({ queryInputId = 'query', iframeId = 'map', geoBtnId = 'geoBtn', searchBtnId = 'searchBtn', defaultQuery = 'cerca de mí' } = {}) {
  const qInput = document.getElementById(queryInputId);
  const geoBtn = document.getElementById(geoBtnId);
  const searchBtn = document.getElementById(searchBtnId);

  if (qInput && !qInput.value) qInput.value = defaultQuery;

  if (searchBtn) {
    searchBtn.addEventListener('click', () => updateMapIframe(queryInputId, iframeId));
  }

  if (geoBtn) {
    geoBtn.addEventListener('click', async () => {
      try {
        const coords = await getCurrentCoords();
        updateMapIframe(queryInputId, iframeId, coords);
      } catch (err) {
        const msg = err && err.message ? err.message : 'Error de geolocalización';
        alert('No se pudo obtener tu ubicación. ' + msg);
      }
    });
  }
}

// Exporta global para que lo llames al final de cada página de categoría:
window.AquitappGeo = { wireMapUI, updateMapIframe, getCurrentCoords };