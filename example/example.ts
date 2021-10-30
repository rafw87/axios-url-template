import axios, { AxiosResponse } from "axios";
import { useUrlTemplateInterceptor } from "../src";

function loggingInterceptor(response: AxiosResponse) {
  const { status, statusText } = response;
  const { urlTemplate, urlTemplateParams } = response.config;
  const url = axios.getUri(response.config);

  const logObject = {
    status,
    statusText,
    url,
    route: urlTemplate ?? url,
    routeParams: urlTemplateParams,
  };

  // do something with such log object
  console.log(JSON.stringify(logObject, null, 2));
}

useUrlTemplateInterceptor(axios, { urlAsTemplate: true });
axios.interceptors.response.use(loggingInterceptor);

async function execute() {
  await axios.get("https://postman-echo.com/status/{status}", {
    urlTemplateParams: { status: 201 },
  });

  await axios.get("https://postman-echo.com/get{?foo,bar}", {
    urlTemplateParams: { foo: "foo1", bar: "bar1" },
    params: { baz: 'baz1' }, // additional param, not being part of route
  });
}
execute().catch(console.error);
