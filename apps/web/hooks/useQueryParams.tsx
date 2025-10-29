"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

type QueryValue = string | number | null;
type QueryParams = Record<string, QueryValue>;
type StringQueryParams = Record<string, string>;

/**
 * useQueryParams — A high-performance Next.js hook for reading, writing,
 * and managing URL query parameters with default values and clean APIs.
 */
export const useQueryParams = (defaults: StringQueryParams = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** getCleanQuery — returns current query params as a plain object */
  const getCleanQuery = useCallback((): StringQueryParams => {
    const result: StringQueryParams = {};
    for (const [key, value] of searchParams.entries()) result[key] = value;
    return result;
  }, [searchParams]);

  /** mergedQuery — merges default params with current active query */
  const mergedQuery = useMemo(
    () => ({ ...defaults, ...getCleanQuery() }),
    [defaults, getCleanQuery]
  );

  /** updateQueryParams — core helper to mutate query params efficiently */
  const updateQueryParams = useCallback(
    (updateFn: (params: URLSearchParams) => void, method: "replace" | "push" = "replace") => {
      const params = new URLSearchParams(searchParams.toString());
      updateFn(params);
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router[method](url);
    },
    [pathname, router, searchParams]
  );

  /** getParam — retrieves a specific query parameter’s value */
  const getParam = useCallback(
    (key: string): string => searchParams.get(key) ?? "",
    [searchParams]
  );

  /** setParam — updates a single query parameter */
  const setParam = useCallback(
    (key: string, value: QueryValue, method: "replace" | "push" = "replace") => {
      updateQueryParams((params) => {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }, method);
    },
    [updateQueryParams]
  );

  /** setBulk — updates multiple query parameters simultaneously */
  const setBulk = useCallback(
    (entries: QueryParams, method: "replace" | "push" = "replace") => {
      updateQueryParams((params) => {
        Object.entries(entries).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") params.delete(key);
          else params.set(key, String(value));
        });
      }, method);
    },
    [updateQueryParams]
  );

  /** resetParams — resets query parameters to their default values */
  const resetParams = useCallback(() => {
    updateQueryParams((params) => {
      params.forEach((_, key) => params.delete(key));
      Object.entries(defaults).forEach(([key, value]) => params.set(key, value));
    });
  }, [defaults, updateQueryParams]);

  /** initialize defaults — applies defaults on mount if URL has no params */
  useEffect(() => {
    if (searchParams.size === 0 && Object.keys(defaults).length > 0) {
      const query = new URLSearchParams(defaults).toString();
      router.replace(`${pathname}?${query}`);
    }
  }, [defaults, pathname, router, searchParams]);

  return {
    getParam,
    setParam,
    setBulk,
    resetParams,
    searchParams: mergedQuery,
  };
};
