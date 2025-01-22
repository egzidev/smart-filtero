export const transformLabelToQueryParam = (label: string) => {
  return label.toLowerCase().replace(/\s+/g, '_');
};

export const updateURLParams1 = (paramsObject: Record<string, string | null>) => {
  const params = new URLSearchParams(window.location.search);
  Object.keys(paramsObject).forEach((key) => {
    if (paramsObject[key]) {
      params.set(key, paramsObject[key] as string);
    } else {
      params.delete(key); // Remove the param if null or empty
    }
  });
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
};

export const updateURLParams = (paramsObject: Record<string, string | null>) => {
  // Attempt to use window.location.search; fallback to extracting from href
  let queryString = window.location.search;
  if (!queryString) {
    const href = window.location.href;
    const index = href.indexOf('?');
    queryString = index !== -1 ? href.substring(index) : '';
  }

  // Create URLSearchParams from the query string
  const params = new URLSearchParams(queryString);

  // Update or remove parameters as specified in paramsObject
  Object.keys(paramsObject).forEach((key) => {
    if (paramsObject[key]) {
      params.set(key, paramsObject[key] as string); // Add or update param
    } else {
      params.delete(key); // Remove param if value is null
    }
  });

  // Replace the current URL with the updated query parameters
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
};