#ifndef RN_ZLIB_H
#define RN_ZLIB_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
  uint8_t *data;
  size_t len;
  char *error;
} ZlibResult;

void zlib_free_result(ZlibResult res);

ZlibResult zlib_deflate_sync(const uint8_t *data, size_t len, int level,
                             int window_bits);
ZlibResult zlib_deflate_raw_sync(const uint8_t *data, size_t len, int level);
ZlibResult zlib_gzip_sync(const uint8_t *data, size_t len, int level);
ZlibResult zlib_inflate_sync(const uint8_t *data, size_t len, int window_bits);
ZlibResult zlib_inflate_raw_sync(const uint8_t *data, size_t len);
ZlibResult zlib_gunzip_sync(const uint8_t *data, size_t len);

// Stream API
void *zlib_stream_create(int mode, int level, int window_bits);
ZlibResult zlib_stream_write(void *ctx, const uint8_t *data, size_t len,
                             int flush);
void zlib_stream_destroy(void *ctx);

// Brotli API
ZlibResult zlib_brotli_compress_sync(const uint8_t *data, size_t len,
                                     int quality, int window_bits);
ZlibResult zlib_brotli_decompress_sync(const uint8_t *data, size_t len);

// Constants
#define BROTLI_PARAM_MODE 0
#define BROTLI_PARAM_QUALITY 1
#define BROTLI_PARAM_LGWIN 2
#define BROTLI_PARAM_LGBLOCK 3
#define BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING 4
#define BROTLI_PARAM_SIZE_HINT 5
#define BROTLI_PARAM_LARGE_WINDOW 6
#define BROTLI_PARAM_NPOSTFIX 7
#define BROTLI_PARAM_NDIRECT 8

uint32_t zlib_crc32(const uint8_t *data, size_t len, uint32_t start_crc);

#ifdef __cplusplus
}
#endif

#endif
