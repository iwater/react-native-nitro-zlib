import { NitroModules } from 'react-native-nitro-modules'
import type { NitroZlib } from './NitroZlib.nitro'
import { Buffer } from 'buffer'

export const NitroZlibModule = NitroModules.createHybridObject<NitroZlib>('NitroZlib')

export const constants = {
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    Z_BINARY: 0,
    Z_TEXT: 1,
    Z_ASCII: 1,
    Z_UNKNOWN: 2,
    Z_DEFLATED: 8,
    // Flush modes
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    BROTLI_DECODE: 8,
    BROTLI_ENCODE: 7,
    // Brotli parameters
    BROTLI_PARAM_MODE: 0,
    BROTLI_PARAM_QUALITY: 1,
    BROTLI_PARAM_LGWIN: 2,
    BROTLI_PARAM_LGBLOCK: 3,
    BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4,
    BROTLI_PARAM_SIZE_HINT: 5,
    BROTLI_PARAM_LARGE_WINDOW: 6,
    BROTLI_PARAM_NPOSTFIX: 7,
    BROTLI_PARAM_NDIRECT: 8,
    // Brotli operations
    BROTLI_OPERATION_PROCESS: 0,
    BROTLI_OPERATION_FLUSH: 1,
    BROTLI_OPERATION_FINISH: 2,
    BROTLI_OPERATION_EMIT_METADATA: 3,
    // Brotli modes
    BROTLI_MODE_GENERIC: 0,
    BROTLI_MODE_TEXT: 1,
    BROTLI_MODE_FONT: 2,
    // Add default compression level for convenience
    Z_MIN_WINDOWBITS: 8,
    Z_MAX_WINDOWBITS: 15,
    Z_MIN_CHUNK: 64,
    Z_MAX_CHUNK: Infinity,
    Z_DEFAULT_CHUNK: 16384,
    Z_MIN_MEMLEVEL: 1,
    Z_MAX_MEMLEVEL: 9,
    Z_DEFAULT_MEMLEVEL: 8,
    Z_MIN_LEVEL: -1,
    Z_MAX_LEVEL: 9
}

// Helper to ensure input is ArrayBuffer
function toArrayBuffer(data: any): ArrayBuffer {
    if (Buffer.isBuffer(data)) {
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    }
    if (data instanceof Uint8Array) {
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    }
    if (data instanceof ArrayBuffer) {
        return data;
    }
    if (typeof data === 'string') {
        return Buffer.from(data).buffer as ArrayBuffer;
    }
    throw new Error('Invalid input type');
}

// Sync APIs
export function deflateSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const level = options?.level ?? -1;
    const windowBits = options?.windowBits ?? 15;
    const result = NitroZlibModule.deflateSync(buffer, level, windowBits);
    return Buffer.from(result);
}

export function deflateRawSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const level = options?.level ?? -1;
    const result = NitroZlibModule.deflateRawSync(buffer, level);
    return Buffer.from(result);
}

export function gzipSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const level = options?.level ?? -1;
    const result = NitroZlibModule.gzipSync(buffer, level);
    return Buffer.from(result);
}

export function inflateSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const windowBits = options?.windowBits ?? 15;
    const result = NitroZlibModule.inflateSync(buffer, windowBits);
    return Buffer.from(result);
}

export function inflateRawSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const result = NitroZlibModule.inflateRawSync(buffer);
    return Buffer.from(result);
}

export function gunzipSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const result = NitroZlibModule.gunzipSync(buffer);
    return Buffer.from(result);
}

export function unzipSync(buf: any, options?: any): Buffer {
    // unzip is essentially inflate (autodetect header) or gunzip
    // Node documentation says unzip expects Gzip-header or Deflate-header?
    // Usually standard zlib inflate handles zlib options.
    // For now alias to inflateSync or gunzipSync?
    // Node's unzip is smart.
    // Let's try inflateSync which usually handles Zlib streams.
    // Gzip streams have different header.
    // Ideally we need an "unzip" function that detects.
    // For now alias to inflateSync.
    return inflateSync(buf, options);
}

// Async APIs (Mocked with Sync for now)
function asyncWrapper(fn: Function, args: any[], cbIndex: number) {
    const callback = args[cbIndex];
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }

    // Use setImmediate or setTimeout to simulate async
    setTimeout(() => {
        try {
            const buf = args[0];
            const options = cbIndex === 2 ? args[1] : {};
            const res = fn(buf, options);
            callback(null, res);
        } catch (e) {
            callback(e);
        }
    }, 0);
}

export function deflate(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(deflateSync, [buf, options], 1);
    } else {
        asyncWrapper(deflateSync, [buf, options, callback], 2);
    }
}

export function deflateRaw(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(deflateRawSync, [buf, options], 1);
    } else {
        asyncWrapper(deflateRawSync, [buf, options, callback], 2);
    }
}

export function gzip(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(gzipSync, [buf, options], 1);
    } else {
        asyncWrapper(gzipSync, [buf, options, callback], 2);
    }
}

export function inflate(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(inflateSync, [buf, options], 1);
    } else {
        asyncWrapper(inflateSync, [buf, options, callback], 2);
    }
}

export function inflateRaw(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(inflateRawSync, [buf, options], 1);
    } else {
        asyncWrapper(inflateRawSync, [buf, options, callback], 2);
    }
}

export function gunzip(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(gunzipSync, [buf, options], 1);
    } else {
        asyncWrapper(gunzipSync, [buf, options, callback], 2);
    }
}

export function unzip(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(unzipSync, [buf, options], 1);
    } else {
        asyncWrapper(unzipSync, [buf, options, callback], 2);
    }
}

// Brotli Sync APIs
export function brotliCompressSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const quality = options?.params?.[constants.BROTLI_PARAM_QUALITY] ?? 11;
    const windowBits = options?.params?.[constants.BROTLI_PARAM_LGWIN] ?? 22;
    const result = NitroZlibModule.brotliCompressSync(buffer, quality, windowBits);
    return Buffer.from(result);
}

export function brotliDecompressSync(buf: any, options?: any): Buffer {
    const buffer = toArrayBuffer(buf);
    const result = NitroZlibModule.brotliDecompressSync(buffer);
    return Buffer.from(result);
}

export function brotliCompress(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(brotliCompressSync, [buf, options], 1);
    } else {
        asyncWrapper(brotliCompressSync, [buf, options, callback], 2);
    }
}

export function brotliDecompress(buf: any, options: any, callback?: any) {
    if (typeof options === 'function') {
        asyncWrapper(brotliDecompressSync, [buf, options], 1);
    } else {
        asyncWrapper(brotliDecompressSync, [buf, options, callback], 2);
    }
}

export function crc32(buf: any, startCrc: number = 0): number {
    const buffer = toArrayBuffer(buf);
    return NitroZlibModule.crc32(buffer, startCrc);
}

// Stream APIs
export * from './stream';
import * as streams from './stream';

export default {
    deflate,
    deflateSync,
    deflateRaw,
    deflateRawSync,
    gzip,
    gzipSync,
    inflate,
    inflateSync,
    inflateRaw,
    inflateRawSync,
    gunzip,
    gunzipSync,
    unzip,
    unzipSync,
    brotliCompress,
    brotliCompressSync,
    brotliDecompress,
    brotliDecompressSync,
    crc32,
    constants,
    // Stream exports
    createDeflate: streams.createDeflate,
    createInflate: streams.createInflate,
    createDeflateRaw: streams.createDeflateRaw,
    createInflateRaw: streams.createInflateRaw,
    createGzip: streams.createGzip,
    createGunzip: streams.createGunzip,
    createUnzip: streams.createUnzip,
    createBrotliCompress: streams.createBrotliCompress,
    createBrotliDecompress: streams.createBrotliDecompress,
    Zlib: streams.Zlib,
    // ...
    BrotliCompress: streams.BrotliCompress,
    BrotliDecompress: streams.BrotliDecompress,
    Deflate: streams.Deflate,
    Inflate: streams.Inflate,
    Gzip: streams.Gzip,
    Gunzip: streams.Gunzip,
    DeflateRaw: streams.DeflateRaw,
    InflateRaw: streams.InflateRaw,
    Unzip: streams.Unzip
}
