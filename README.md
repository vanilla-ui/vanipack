<p align="center">
  <a href="https://github.com/vanilla-ui/vanipack">
    <img src="https://rawgit.com/vanilla-ui/logo/master/vanipack/logo.png" alt="Vanipack" width="800" height="240" align="middle" />
  </a>
</p>

<p align="center">
  Universal build system for isomorphic app.
</p>

<p align="center">
  <a href="https://travis-ci.org/vanilla-ui/vanipack"><img src="https://img.shields.io/travis/vanilla-ui/vanipack.svg" alt="build status" align="middle" /></a>
  <a href="https://www.npmjs.com/package/vanipack"><img src="https://img.shields.io/npm/v/vanipack.svg" alt="version" align="middle" /></a>
  <a href="https://www.npmjs.com/package/vanipack"><img src="https://img.shields.io/npm/l/vanipack.svg" alt="license" align="middle" /></a>
</p>

***

## Installation

``` shell
$ npm install --save vanipack
```

## Usage

``` shell
# start development server
$ vanipack serve

# build for production
$ NODE_ENV=production vanipack build

# start production server
$ NODE_ENV=production vanipack start
```

## Config

``` javascript
// vanipack.js

export default {
  plugins: [],

  webpack: null,

  path: {
    public: "/",
    static: "./static",
  },

  entry: {
    client: "./entry/client",
    server: "./entry/server",
  },

  bind: {
    client: {
      host: "127.0.0.1",
      port: 8080,
    },
    server: {
      host: "127.0.0.1",
      port: 8000,
    },
  },
};
```

## Plugins

- [vanipack-plugin-react](https://github.com/vanilla-ui/vanipack-plugin-react)

## Examples

- [vanipack-example](https://github.com/vanilla-ui/vanipack-example)

***

<p align="center">
  <a href="http://chicory.io/">
    <img src="https://rawgit.com/chicory-project/logo/master/icon-24.svg" width="24" height="24" align="middle" /><br />
    Chicory Project
  </a>
</p>
