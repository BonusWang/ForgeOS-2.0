const resourceBase =
  typeof window === 'undefined'
    ? `${import.meta.env.BASE_URL}resources/`
    : new URL('resources/', window.location.href).toString();

export const resources = {
  background: `${resourceBase}forge-bg-texture.png`,
  emptyState: `${resourceBase}forge-empty-state.png`,
  logoPixel: `${resourceBase}forge-logo-pixel.png`,
};
