import { urlTemplateInterceptor, useUrlTemplateInterceptor } from "axios-url-template";
import {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig,
} from "axios";

describe("urlTemplateInterceptor", () => {
  describe("for default options", () => {
    const interceptor = urlTemplateInterceptor();

    it("should inject path variables", () => {
      const config = {
        urlTemplate: "https://www.example.com/test/{id}",
        urlTemplateParams: { id: 123 },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        ...config,
        url: "https://www.example.com/test/123",
        urlTemplate: config.urlTemplate,
        urlTemplateParams: config.urlTemplateParams,
      });
    });

    it("should inject query variables", () => {
      const config = {
        urlTemplate: "https://www.example.com/test{?foo,bar}",
        urlTemplateParams: { foo: "foo", bar: "bar" },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: "https://www.example.com/test?foo=foo&bar=bar",
        urlTemplate: config.urlTemplate,
        urlTemplateParams: config.urlTemplateParams,
      });
    });

    it("should give priority to `urlTemplate` over `url` if both provided", () => {
      const config = {
        url: "https://www.example.com/test2/123",
        urlTemplate: "https://www.example.com/test/{id}",
        urlTemplateParams: { id: 123 },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: "https://www.example.com/test/123",
        urlTemplate: config.urlTemplate,
        urlTemplateParams: config.urlTemplateParams,
      });
    });

    it("should pass through `url` if provided", () => {
      const config = {
        url: "https://www.example.com/test/123",
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: config.url,
        urlTemplate: config.url,
        urlTemplateParams: {},
      });
    });

    it("should modify `url` if is template", () => {
      const config = {
        url: "https://www.example.com/test/{id}",
        urlTemplateParams: { id: 123 },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: "https://www.example.com/test/123",
        urlTemplate: config.url,
        urlTemplateParams: config.urlTemplateParams,
      });
    });
  });
  describe("for urlAsTemplate=false", () => {
    const interceptor = urlTemplateInterceptor({ urlAsTemplate: false });

    it("should pass through `url` if provided", () => {
      const config = {
        url: "https://www.example.com/test/123",
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: config.url,
      });
    });

    it("should not modify `url` even if is template", () => {
      const config = {
        url: "https://www.example.com/test/{id}",
        urlTemplateParams: { id: 1 },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: config.url,
        urlTemplateParams: config.urlTemplateParams,
      });
    });
  });

  describe("for urlAsTemplate=true", () => {
    const interceptor = urlTemplateInterceptor({ urlAsTemplate: true });

    it("should pass through `url` if provided", () => {
      const config = {
        url: "https://www.example.com/test/123",
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: config.url,
        urlTemplate: config.url,
        urlTemplateParams: {},
      });
    });

    it("should modify `url` if is template", () => {
      const config = {
        url: "https://www.example.com/test/{id}",
        urlTemplateParams: { id: 123 },
      };
      const result = interceptor(config);
      expect(result).toStrictEqual({
        url: "https://www.example.com/test/123",
        urlTemplate: config.url,
        urlTemplateParams: config.urlTemplateParams,
      });
    });

    it("should handle no `url` provided", () => {
      const config = {};
      const result = interceptor(config);
      expect(result).toStrictEqual({});
    });
  });
});

describe("useUrlTemplateInterceptor", () => {
  const useMock = jest.fn();
  const axiosInstanceMock = {
    interceptors: {
      request: {
        use: useMock as AxiosInterceptorManager<AxiosRequestConfig>["use"],
      },
    },
  } as AxiosInstance;

  it("should attach proper interceptor for default options", () => {
    useUrlTemplateInterceptor(axiosInstanceMock);
    expect(useMock).toBeCalledTimes(1);
    expect(useMock).toBeCalledWith(expect.any(Function));
    const interceptor = useMock.mock.calls[0][0] as (
      value: AxiosRequestConfig
    ) => AxiosRequestConfig;

    const config = {
      url: "https://www.example.com/test/{id}",
      urlTemplateParams: { id: 123 },
    };
    const result = interceptor(config);
    expect(result).toStrictEqual({
      url: "https://www.example.com/test/123",
      urlTemplate: config.url,
      urlTemplateParams: config.urlTemplateParams,
    });
  });

  it("should attach proper interceptor for custom options", () => {
    useUrlTemplateInterceptor(axiosInstanceMock, { urlAsTemplate: false });
    expect(useMock).toBeCalledTimes(1);
    expect(useMock).toBeCalledWith(expect.any(Function));
    const interceptor = useMock.mock.calls[0][0] as (
      value: AxiosRequestConfig
    ) => AxiosRequestConfig;

    const config = {
      url: "https://www.example.com/test/{id}",
      urlTemplateParams: { id: 123 },
    };
    const result = interceptor(config);
    expect(result).toStrictEqual(config);
  });
});
