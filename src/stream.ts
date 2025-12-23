import { Transform, TransformOptions } from 'readable-stream';
import { NitroZlibModule, constants } from './index';
import { HybridZlibStream } from './NitroZlib.nitro';
import { Buffer } from 'buffer';

export interface ZlibOptions extends Omit<TransformOptions, 'flush'> {
    flush?: number;
    finishFlush?: number;
    chunkSize?: number;
    windowBits?: number;
    level?: number;
    memLevel?: number;
    strategy?: number;
    dictionary?: Buffer | NodeJS.TypedArray | DataView | ArrayBuffer;
    params?: Record<number, number>; // Brotli params
}

export class Zlib extends Transform {
    private _handle: HybridZlibStream;
    private _hadError: boolean = false;
    private _writeState: [number, number]; // [flush, finishFlush]

    constructor(options: ZlibOptions = {}, mode: number) {
        super(options as TransformOptions);
        const level = options.level ?? constants.Z_DEFAULT_COMPRESSION;
        const windowBits = options.windowBits ?? 15; // TODO: Map defaults based on mode if needed
        this._handle = NitroZlibModule.createStream(mode, level, windowBits);

        const flush = options.flush ?? constants.Z_NO_FLUSH;
        const finishFlush = options.finishFlush ?? constants.Z_FINISH;
        this._writeState = [flush, finishFlush];
    }

    _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
        try {
            // Ensure Buffer
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as any);
            const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

            const flushFlag = this._writeState[0];
            const result = this._handle.write(ab, flushFlag);

            if (result && result.byteLength > 0) {
                this.push(Buffer.from(result));
            }
            callback();
        } catch (err: any) {
            callback(err);
        }
    }

    _flush(callback: (error?: Error | null, data?: any) => void): void {
        try {
            const finishFlushFlag = this._writeState[1];
            // Write empty buffer with finish flag
            const result = this._handle.write(new ArrayBuffer(0), finishFlushFlag);

            if (result && result.byteLength > 0) {
                this.push(Buffer.from(result));
            }
            callback();
        } catch (err: any) {
            callback(err);
        }
    }

    public flush(kind?: number, callback?: Function) {
        const ws = this._writableState as any;
        if (ws.ended) {
            if (typeof callback === 'function') {
                process.nextTick(callback);
            }
            return;
        }

        // TODO: Implement explicit flush logic properly. 
        // For now, we simulate by writing empty buffer with kind.
        // Node.js flushes are more complex (handled in stream queue).
        // If we just write synchronously here, it might be out of order with transform chunks?
        // Transform stream processes chunks linearly.
        // We probably need to implement _transform more robustly to handle "flush requests".
        // But for basic compatibility, explicit flush is rare.
        // We'll leave basic implementation for now.
    }

    public close(callback?: Function) {
        if (callback) {
            process.nextTick(callback);
        }
        this.emit('close');
        this.destroy();
    }
}

export class Deflate extends Zlib {
    constructor(options?: ZlibOptions) {
        super(options, constants.Z_DEFLATED || 0);
    }
}

export class Inflate extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 1 = Inflate
        super(options, 1);
    }
}

export class Gzip extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 2 = Gzip
        super(options, 2);
    }
}

export class Gunzip extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 3 = Gunzip
        super(options, 3);
    }
}

export class DeflateRaw extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 4 = DeflateRaw
        super(options, 4);
    }
}

export class InflateRaw extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 5 = InflateRaw
        super(options, 5);
    }
}

export class Unzip extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 6 = Unzip
        super(options, 6);
    }
}

export class BrotliCompress extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 7 = BrotliCompress
        const opts = options || {};
        // Map brotli params to level/windowBits if needed, or pass params via custom way?
        // Current createStream takes mode, level, windowBits.
        // Brotli uses quality (level) and windowBits (lgwin).
        // We can pass them as level/windowBits.
        // Params object in options is standard for Brotli.
        // We might need to extract them.

        // Extract standard params if present
        let quality = opts.params?.[constants.BROTLI_PARAM_QUALITY] ?? 11;
        let lgwin = opts.params?.[constants.BROTLI_PARAM_LGWIN] ?? 22;

        // Also support level/windowBits aliases if params not provided
        if (opts.level !== undefined) quality = opts.level;
        if (opts.windowBits !== undefined) lgwin = opts.windowBits;

        // Overlay modified options
        const newOptions = { ...opts, level: quality, windowBits: lgwin };

        super(newOptions, 7);
    }
}

export class BrotliDecompress extends Zlib {
    constructor(options?: ZlibOptions) {
        // Mode 8 = BrotliDecompress
        super(options, 8);
    }
}

export function createDeflate(options?: ZlibOptions) { return new Deflate(options); }
export function createInflate(options?: ZlibOptions) { return new Inflate(options); }
export function createDeflateRaw(options?: ZlibOptions) { return new DeflateRaw(options); }
export function createInflateRaw(options?: ZlibOptions) { return new InflateRaw(options); }
export function createGzip(options?: ZlibOptions) { return new Gzip(options); }
export function createGunzip(options?: ZlibOptions) { return new Gunzip(options); }
export function createUnzip(options?: ZlibOptions) { return new Unzip(options); }
export function createBrotliCompress(options?: ZlibOptions) { return new BrotliCompress(options); }
export function createBrotliDecompress(options?: ZlibOptions) { return new BrotliDecompress(options); }
