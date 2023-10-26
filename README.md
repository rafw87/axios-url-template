# axios-url-template

[![npm version](https://img.shields.io/npm/v/axios-url-template.svg?style=flat-square)](https://www.npmjs.org/package/axios-url-template)
![Build status](https://github.com/rafw87/axios-url-template/actions/workflows/test.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/rafw87/axios-url-template/badge.svg?branch=master)](https://coveralls.io/github/rafw87/axios-url-template?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=axios-url-template)](https://packagephobia.now.sh/result?p=axios-url-template)

This package adds support for URL templates to [Axios](https://www.npmjs.com/package/axios),
according to [RFC 6570 URI Template specification](https://datatracker.ietf.org/doc/html/rfc6570).

It uses [url-template](https://www.npmjs.com/package/url-template) package and wraps it into Axios interceptor.

## Installation

```bash
$ npm install axios-url-template
```
or
```bash
$ yarn add axios-url-template
```


## Usage

Importing library:
```typescript
import { urlTemplateInterceptor } from "axios-url-template";
```

Attaching interceptor to Axios global instance:
```typescript
axios.interceptors.request.use(urlTemplateInterceptor());
```

Passing options:
```typescript
axios.interceptors.request.use(urlTemplateInterceptor({
  urlAsTemplate: false,
}));
```

Attaching interceptor to Axios instance
```typescript
const instance = axios.create({ /* ... */});
instance.interceptors.request.use(urlTemplateInterceptor());
```

Example requests:
```typescript
const response1 = await axios.get('/test/{id}', {
  urlTemplateParams: { id: 123 },
});
// config:
// {
//   url: '/test/123',
//   urlTemplate: '/test/{id}',
//   urlTemplateParams: { id: 123 }
// }

const response2 = await axios.get('/test{?foo,bar}', {
  urlTemplateParams: { foo: 'foo1', bar: 'bar1' },
});
// config:
// {
//   url: '/test?foo=foo1&bar=bar1',
//   urlTemplate: '/test{?foo,bar}',
//   urlTemplateParams: { foo: 'foo1', bar: 'bar1' },
// }

const response3 = await axios.request({
  urlTemplate: '/test/{id}',
  urlTemplateParams: { id: 123 },
});
// config:
// {
//   url: '/test/123',
//   urlTemplate: '/test/{id}',
//   urlTemplateParams: { id: 123 },
// }
```
Interceptor may be also registered using shortcut method:
```typescript
import { useUrlTemplateInterceptor } from "axios-url-template";

useUrlTemplateInterceptor(axios);

const instance = axios.create({ /* ... */});
useUrlTemplateInterceptor(instance, { urlAsTemplate: false });
```


### Options
- `urlAsTemplate`: when set to `true`, then `url` is treated as template and possibly interpolated.
  When set to `false` it does not touch `url` unless `urlTemplate` is explicitly specified. Default: `true`.


## Behavior

When `urlTemplate` (and optional `urlTemplateParams`) is provided in Axios config object,
this interceptor uses it to generate `url`. Those template fields are persisted in config object,
so after execution config will contain all of those fields:
- `url`
- `urlTemplate`
- `urlTemplateParams` - when no parameter are provided it will be an empty object

When `urlAsTemplate` option is set to `true` (default), then `url` will be also treated as url template
and passed through interpolation. In this case, `urlTemplate` and `urlTemplateParams`
will be added accordingly, and `url` will be replaced  with interpolated value,
giving the same effect as for `urlTemplate`.

When no `urlTemplate` is provided and `urlAsTemplate` option is set to `false` then
the interceptor passes request config without any changes.


## Use cases
This interceptor helps to automate things like structural logging and/or request metrics,
where low cardinality route is preferred over full URL with dynamic parts.

When request is performed in traditional way, there is no easy option to retrieve such route
from full URL provided in call to Axios. It may be provided as custom fields,
but it increases overhead and may generate mistakes.

The interceptor ensures consistency, as actual URL provided to Axios is computed
from route (url template) and parameters.

Example (in TypeScript):
```typescript
import axios, { AxiosResponse } from 'axios';
import { useUrlTemplateInterceptor } from "axios-url-template";

// example logging interceptor
function loggingInterceptor(response: AxiosResponse) {
  const { status, statusText } = response;
  const { urlTemplate, urlTemplateParams } = response.config;
  const url = axios.getUri(response.config);

  const logObject = {
    status,
    statusText,
    url,
    route: urlTemplate, // low cardinality value is preferred
    routeParams: urlTemplateParams, // dynamic route parts
  };

  // do something with such log object
  console.log(JSON.stringify(logObject, null, 2));
}

// attach url template interceptor
useUrlTemplateInterceptor(axios, { urlAsTemplate: true })

// attach logging interceptor
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
```

Result:
```jsonl
{
  "status": 201,
  "statusText": "Created",
  "url": "https://postman-echo.com/status/201",
  "route": "https://postman-echo.com/status/{status}",
  "routeParams": {
    "status": 201
  }
}
{
  "status": 200,
  "statusText": "OK",
  "url": "https://postman-echo.com/get?foo=foo1&bar=bar1&baz=baz1",
  "route": "https://postman-echo.com/get{?foo,bar}",
  "routeParams": {
    "foo": "foo1",
    "bar": "bar1"
  }
}
```

## License
MIT
