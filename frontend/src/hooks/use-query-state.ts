import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';

export const useQueryState = (query: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  const setQuery = useCallback(
    (value: string | null | undefined) => {
      // Parse existing query parameters
      const existingQueries = qs.parse(location.search, {
        ignoreQueryPrefix: true,
      });

      // Create a new object to avoid mutation issues
      const newQueries = { ...existingQueries };

      // Handle null/undefined/empty string by removing the parameter
      if (value === null || value === undefined || value === '') {
        delete newQueries[query];
      } else {
        newQueries[query] = value;
      }

      // Create the new query string
      const queryString = qs.stringify(newQueries, { skipNulls: true });

      // Navigate to the new URL
      navigate(
        {
          pathname: location.pathname,
          search: queryString ? `?${queryString}` : '',
        },
        { replace: true },
      );
    },
    [navigate, location, query],
  );

  // Get the current value from the URL
  const currentValue = qs.parse(location.search, { ignoreQueryPrefix: true })[
    query
  ];

  return [currentValue, setQuery];
};
