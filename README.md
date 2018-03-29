matrixes-lib
=========================
Node.js module for create a gRPC server as Microservices or Koa server as ApiGateway.

## Aim

This project was forked from [agreatfool/sasdn](https://github.com/agreatfool/sasdn), and was intended to separate Command Tools and gRpc Server Source Code.

* other difference
  * Remove bluebird, and use util.promisify
  * The NPM package size is more littler, and install more faster

## Install

```bash
npm install matrixes-lib -save
```

## How to user

### Create gRPC Server

```typescript
import { RpcApplication } from 'matrixes-lib';
import { registerServices } from './services/Register';

class Server {
    private _initialized: boolean;
    public app: RpcApplication;

    constructor() {
        this._initialized = false;
    }

    public async init(isDev: boolean = false): Promise<any> {
        this.app = new RpcApplication();
        this._initialized = true;

        return Promise.resolve();
    }

    public start(): void {
        if (!this._initialized) {
            return;
        }

        registerServices(this.app);

        const host = '0.0.0.0';
        const port = '8080';
        this.app.bind(`${host}:${port}`).start();
        console.log(`server start, Address: ${host}:${port}!`);
    }
}


const server = new Server();
server.init(process.env.NODE_ENV === 'development')
    .then(() => {
        server.start();
    })
    .catch((error) => {
        console.log(`MicroService init failed error = ${error.stack}`);
    });

process.on('uncaughtException', (error) => {
    console.log(`process on uncaughtException error = ${error.stack}`);
});

process.on('unhandledRejection', (error) => {
    console.log(`process on unhandledRejection error = ${error.stack}`);
});
```

### Create gRPC Client

```typescript
import * as grpc from 'grpc';
import {Duplex, Readable, Writable} from 'stream';
import {BookServiceClient} from './proto/book/book_grpc_pb';
import {Book, GetBookRequest, GetBookViaAuthorRequest} from './proto/book/book_pb';
import MSBookServiceClient from './clients/book/MSBookServiceClient';

const md = new grpc.Metadata();
md.set('name', 'fengjie');

let bookClient = new MSBookServiceClient('127.0.0.1:8080');

function getBook() {
    const request = new GetBookRequest();
    request.setIsbn(6);

    bookClient.getBook(request, md)
        .then((res) => {
            console.log(`[getBook] response: ${JSON.stringify(res.toObject())}`);
            console.log(`[getBook] done`);
        })
        .catch((err) => {
            console.log(`[getBook] err: ${err.message}`);
            console.log(`[getBook] done`);
        });
}

getBook();
```

### Create API Gateway Server

```typescript
import {Koa, KoaBodyParser} from 'matrixes-lib';
import RouterLoader from './router/Router';

class Server {
    private _initialized: boolean;
    public app: Koa;

    constructor() {
        this._initialized = false;
    }

    public async init(isDev: boolean = false): Promise<any> {

        await RouterLoader.instance().init();

        this.app = new Koa();
        this.app.use(KoaBodyParser({ formLimit: '2048kb' }));
        this.app.use(RouterLoader.instance().getRouter().routes());
        this._initialized = true;

        return Promise.resolve();
    }

    public start(): void {
        if (!this._initialized) {
            return;
        }

        const host = '0.0.0.0';
        const port = '8081';
        this.app.listen(port, host, () => {
            console.log(`server start, Address: ${host}:${port}!`);
        });
    }
}


const server = new Server();
server.init(process.env.NODE_ENV === 'development')
    .then(() => {
        server.start();
    })
    .catch((error) => {
        console.log(`Gateway init failed error = ${error.stack}`);
    });

process.on('uncaughtException', (error) => {
    console.log(`process on uncaughtException error = ${error.stack}`);
});

process.on('unhandledRejection', (error) => {
    console.log(`process on unhandledRejection error = ${error.stack}`);
});
```

### Test API Gateway

```bash
# api 
curl -d "isbn=1" "http://127.0.0.1:8081/v1/getBookUser"

# mock api when SET NODE_ENV=development
curl -d "isbn=1" "http://127.0.0.1:8081/v1/getBookUser?mock=1"
```

## Tool Chain

- [protoc-gen-grpc](https://github.com/niklaus0823/protoc-gen-grpc)
- [matrixes-cli](https://github.com/niklaus0823/matrixes-cli)
- [matrixes-lib](https://github.com/niklaus0823/matrixes-lib)

## Simple

- [matrixes-simple](https://github.com/niklaus0823/matrixes-simple)

