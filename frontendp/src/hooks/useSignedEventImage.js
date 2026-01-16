// src/hooks/useSignedEventImage.js
import { useEffect, useRef, useState } from "react";
import { appApiClient } from "../api/endpoints";

export const useSignedEventImage = (key) => {
  const [url, setUrl] = useState(null);
  const refreshTimer = useRef(null);

  const fetchUrl = async () => {
    if (!key) return;

    const res = await appApiClient.get(
      `/secure/event-image/?key=${encodeURIComponent(key)}`
    );

    setUrl(res.data.url);

    const refreshInMs = res.data.expires_in * 0.8 * 1000;

    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(fetchUrl, refreshInMs);
  };

  useEffect(() => {
    fetchUrl();
    return () => clearTimeout(refreshTimer.current);
  }, [key]);

  return url;
};
