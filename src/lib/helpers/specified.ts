interface GeolocationError extends Error {
  code?: number;
}

export function getCurrentPositionAsync(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (geoError: GeolocationPositionError) => {
        const err: GeolocationError = new Error(geoError.message);
        err.code = geoError.code;
        reject(err);
      },
      options
    );
  });
}
