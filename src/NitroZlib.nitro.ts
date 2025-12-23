import { type HybridObject } from 'react-native-nitro-modules'

export interface HybridZlibStream extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
    /**
     * Writes data to the stream.
     * @param data Input chunk
     * @param flush Flush mode (0=No, 2=Sync, 4=Finish)
     * @returns Output chunk (if any)
     */
    write(data: ArrayBuffer, flush: number): ArrayBuffer
}

export interface NitroZlib extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
    deflateSync(data: ArrayBuffer, level: number, windowBits: number): ArrayBuffer
    deflateRawSync(data: ArrayBuffer, level: number): ArrayBuffer
    gzipSync(data: ArrayBuffer, level: number): ArrayBuffer

    inflateSync(data: ArrayBuffer, windowBits: number): ArrayBuffer
    inflateRawSync(data: ArrayBuffer): ArrayBuffer
    gunzipSync(data: ArrayBuffer): ArrayBuffer
    brotliCompressSync(data: ArrayBuffer, quality: number, windowBits: number): ArrayBuffer
    brotliDecompressSync(data: ArrayBuffer): ArrayBuffer
    crc32(data: ArrayBuffer, startCrc: number): number

    /**
     * Creates a new Zlib stream context.
     * @param mode 0=Deflate, 1=Inflate, 2=Gzip, 3=Gunzip, 4=DeflateRaw, 5=InflateRaw, 6=Unzip, 7=BrotliCompress, 8=BrotliDecompress
     */
    createStream(mode: number, level: number, windowBits: number): HybridZlibStream
}
