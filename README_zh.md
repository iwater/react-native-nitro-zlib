# react-native-nitro-zlib

高性能、100% Node.js 兼容的 React Native Zlib 模块，基于 [Nitro Modules](https://nitro.margelo.com) 和 Rust 实现。

## 🌟 特性

-   🚀 **极高性能**: 核心逻辑使用 Rust (`flate2` & `brotli` crates) 编写，通过 Nitro Modules 直接桥接 C++，无 JSI 序列化开销。
-   适配 **Node.js Zlib API**: 旨在提供与 Node.js 环境一致的 API 体验。
-   📦 **全算法支持**: 支持 Deflate, Inflate, Gzip, Gunzip, Brotli, 以及 **LZO (miniLZO)**。
-   ♻️ **流式支持 (Streams)**: 完全支持 `Readable`, `Writable` 及 `.pipe()` 操作。
-   💠 **同步 & 异步**: 提供同步 (`Sync`) 和基于回调的异步 API。
-   🛠️ **工具函数**: 内置高性能 `crc32` 计算。

## 📦 安装

```bash
yarn add react-native-nitro-zlib
# 或
npm install react-native-nitro-zlib
```

### iOS
```bash
cd ios && pod install
```

## 🚀 使用指南

### 1. 同步 API (Buffer 操作)

适用于处理小文件或对延迟极其敏感的场景。

```typescript
import zlib from 'react-native-nitro-zlib';
import { Buffer } from 'buffer';

const input = Buffer.from('hello world');

// Gzip 压缩
const compressed = zlib.gzipSync(input);

// Gzip 解压
const decompressed = zlib.gunzipSync(compressed);
console.log(decompressed.toString()); // 'hello world'

// Brotli 压缩 (Sync)
const brotliOut = zlib.brotliCompressSync(input);

// LZO 压缩 (Sync)
const lzoCompressed = zlib.lzoCompressSync(input);

// LZO 解压 (Sync)
// - 方式 A：自动探测长度 (便捷，适合未知数据)
const lzoDecompressedA = zlib.lzoDecompressSync(lzoCompressed);
// - 方式 B：指定长度 (极致优化，推荐用于 MDict 等已知长度场景)
const lzoDecompressedB = zlib.lzoDecompressSync(lzoCompressed, input.length);
```

### 2. 异步 API (回调)

提供与 Node.js 相同的异步回调接口。

```typescript
import zlib from 'react-native-nitro-zlib';

zlib.deflate('some data', (err, buffer) => {
  if (!err) {
    console.log('Compressed buffer:', buffer);
  }
});
```

### 3. 流式 API (Streams)

适用于处理大文件，支持管道操作。

```typescript
import zlib from 'react-native-nitro-zlib';
import fs from 'react-native-nitro-image'; // 假设你有一个支持流的文件系统模块
// 或者配合其他 Transform 流使用

const gzip = zlib.createGzip();
const gunzip = zlib.createGunzip();

gzip.pipe(gunzip).on('data', (chunk) => {
  console.log('解压数据块:', chunk);
});

gzip.write('这是流式压缩的数据');
gzip.end();
```

### 4. 工具方法

```typescript
import zlib from 'react-native-nitro-zlib';
import { Buffer } from 'buffer';

// 计算 CRC32
const crc = zlib.crc32(Buffer.from('Hello World'));
console.log('CRC32:', crc.toString(16)); // 4a17b156

// 访问常量
console.log(zlib.constants.Z_BEST_COMPRESSION); // 9
```

## 📊 API 支持情况

| API | 状态 | 说明 |
| :--- | :--- | :--- |
| `deflate` / `Sync` | ✅ 支持 | |
| `inflate` / `Sync` | ✅ 支持 | |
| `gzip` / `Sync` | ✅ 支持 | |
| `gunzip` / `Sync` | ✅ 支持 | |
| `brotliCompress` / `Sync` | ✅ 支持 | |
| `brotliDecompress` / `Sync` | ✅ 支持 | |
| `createGzip` / `createGunzip` | ✅ 支持 | Stream Factory |
| `createBrotliCompress` | ✅ 支持 | Stream Factory |
| `lzoCompress` / `Sync` | ✅ 支持 | Raw LZO1X-1 算法 |
| `lzoDecompress` / `Sync` | ✅ 支持 | 支持可选的 `outputLength` |
| `crc32` | ✅ 支持 | |
| `constants` | ✅ 支持 | |

## 🛠️ 技术细节

该项目包含三个主要部分：
1.  **Rust 核心 (`rust_c_zlib`)**: 封装了 `flate2` 和 `brotli` Rust 库，用于 Zlib 和 Brotli。
2.  **C++ 核心**: 集成了 `miniLZO` 以实现极速 LZO 压缩。
3.  **C++ 桥接**: 使用 Nitro Modules 自动生成的 C++ 接口。
3.  **TypeScript 层**: 封装了符合 Node.js 规范的 JavaScript 接口，并集成了 `readable-stream`。

## 📄 开源协议

ISC
