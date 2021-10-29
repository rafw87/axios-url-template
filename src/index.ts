import urlTemplateParser from "url-template";
import { Axios, AxiosRequestConfig } from "axios";

type TParamValue = string | number | boolean;

declare module "axios" {
  interface AxiosRequestConfig {
    urlTemplate?: string;
    urlTemplateParams?: Record<string, TParamValue>;
  }
}

export type UrlTemplateInterceptorOptions = {
  urlAsTemplate?: boolean;
};

export const urlTemplateInterceptor =
  (options: UrlTemplateInterceptorOptions = {}) =>
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const { url: originalUrl, urlTemplate, urlTemplateParams = {} } = config;
    const { urlAsTemplate = true } = options;

    if (urlTemplate != null) {
      const url = urlTemplateParser
        .parse(urlTemplate)
        .expand(urlTemplateParams);
      return {
        ...config,
        url,
        urlTemplate,
        urlTemplateParams,
      };
    } else if (urlAsTemplate && originalUrl != null) {
      const url = urlTemplateParser
        .parse(originalUrl)
        .expand(urlTemplateParams);
      return {
        ...config,
        url,
        urlTemplate: originalUrl,
        urlTemplateParams,
      };
    }
    return config;
  };

export const useUrlTemplateInterceptor = (
  instance: Axios,
  options: UrlTemplateInterceptorOptions = {}
) => {
  instance.interceptors.request.use(urlTemplateInterceptor(options));
};
