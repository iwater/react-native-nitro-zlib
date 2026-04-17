#include "HybridZlib.hpp"
#include "HybridZlibStream.hpp"
#include <stdexcept>
#include <string>
#include <vector>
#include "minilzo.h"

namespace margelo::nitro::nitro_zlib {

static bool did_init_lzo = false;
static void init_lzo_if_needed() {
  if (!did_init_lzo) {
    if (lzo_init() != LZO_E_OK) {
      throw std::runtime_error("miniLZO initialization failed!");
    }
    did_init_lzo = true;
  }
}

// Helper to convert ZlibResult to ArrayBuffer and free result
std::shared_ptr<ArrayBuffer> resultToArrayBuffer(ZlibResult res) {
  if (res.error) {
    std::string err(res.error);
    zlib_free_result(res);
    throw std::runtime_error(err);
  }

  // Create new ArrayBuffer copying the data
  auto buffer = ArrayBuffer::allocate(res.len);
  std::memcpy(buffer->data(), res.data, res.len);

  zlib_free_result(res);
  return buffer;
}

std::shared_ptr<ArrayBuffer>
HybridZlib::deflateSync(const std::shared_ptr<ArrayBuffer> &data, double level,
                        double windowBits) {
  ZlibResult res = zlib_deflate_sync(data->data(), data->size(), (int)level,
                                     (int)windowBits);
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::deflateRawSync(const std::shared_ptr<ArrayBuffer> &data,
                           double level) {
  ZlibResult res =
      zlib_deflate_raw_sync(data->data(), data->size(), (int)level);
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::gzipSync(const std::shared_ptr<ArrayBuffer> &data, double level) {
  ZlibResult res = zlib_gzip_sync(data->data(), data->size(), (int)level);
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::inflateSync(const std::shared_ptr<ArrayBuffer> &data,
                        double windowBits) {
  ZlibResult res =
      zlib_inflate_sync(data->data(), data->size(), (int)windowBits);
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::inflateRawSync(const std::shared_ptr<ArrayBuffer> &data) {
  ZlibResult res = zlib_inflate_raw_sync(data->data(), data->size());
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::gunzipSync(const std::shared_ptr<ArrayBuffer> &data) {
  ZlibResult res = zlib_gunzip_sync(data->data(), data->size());
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::brotliCompressSync(const std::shared_ptr<ArrayBuffer> &data,
                               double quality, double windowBits) {
  ZlibResult res = zlib_brotli_compress_sync(data->data(), data->size(),
                                             (int)quality, (int)windowBits);
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::brotliDecompressSync(const std::shared_ptr<ArrayBuffer> &data) {
  ZlibResult res = zlib_brotli_decompress_sync(data->data(), data->size());
  return resultToArrayBuffer(res);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::lzoCompressSync(const std::shared_ptr<ArrayBuffer> &data) {
  init_lzo_if_needed();

  lzo_uint in_len = data->size();
  // Safe estimate for output buffer size: in_len + in_len / 16 + 64 + 3
  lzo_uint out_len_estimated = in_len + (in_len / 16) + 64 + 3;
  auto buffer = ArrayBuffer::allocate(out_len_estimated);

  lzo_uint out_actual_len = 0;
  // wrkmem size is fixed for LZO1X-1
  static std::vector<uint8_t> wrkmem(LZO1X_1_MEM_COMPRESS);

  int r = lzo1x_1_compress((const lzo_bytep)data->data(), in_len,
                           (lzo_bytep)buffer->data(), &out_actual_len,
                           wrkmem.data());

  if (r != LZO_E_OK) {
    throw std::runtime_error("LZO compression failed with error code: " +
                             std::to_string(r));
  }

  // Return a copy with exact size
  return ArrayBuffer::copy(buffer->data(), out_actual_len);
}

std::shared_ptr<ArrayBuffer>
HybridZlib::lzoDecompressSync(const std::shared_ptr<ArrayBuffer> &data,
                              std::optional<double> outputLength) {
  init_lzo_if_needed();

  if (outputLength.has_value()) {
    // 1. Path with known output length (MDict/Optimized)
    lzo_uint original_len = (lzo_uint)outputLength.value();
    auto buffer = ArrayBuffer::allocate(original_len);
    lzo_uint decompressed_len = original_len;

    int r = lzo1x_decompress_safe((const lzo_bytep)data->data(), data->size(),
                                  (lzo_bytep)buffer->data(), &decompressed_len,
                                  nullptr);

    if (r != LZO_E_OK) {
      throw std::runtime_error("LZO decompression failed with error code: " +
                               std::to_string(r));
    }

    if (decompressed_len != original_len) {
      return ArrayBuffer::copy(buffer->data(), decompressed_len);
    }
    return buffer;
  } else {
    // 2. Dynamic growth path (Convenience/Interop)
    lzo_uint current_guess =
        std::max((lzo_uint)(data->size() * 3), (lzo_uint)65536);
    const lzo_uint max_size = 256 * 1024 * 1024; // 256MB safety limit

    while (current_guess <= max_size) {
      auto buffer = ArrayBuffer::allocate(current_guess);
      lzo_uint decompressed_len = current_guess;

      int r = lzo1x_decompress_safe((const lzo_bytep)data->data(), data->size(),
                                    (lzo_bytep)buffer->data(),
                                    &decompressed_len, nullptr);

      if (r == LZO_E_OK) {
        // Successful decompression
        return ArrayBuffer::copy(buffer->data(), decompressed_len);
      } else if (r == LZO_E_OUTPUT_OVERRUN) {
        // Buffer too small, grow and retry
        current_guess *= 2;
        continue;
      } else {
        throw std::runtime_error("LZO decompression failed with error code: " +
                                 std::to_string(r));
      }
    }
    throw std::runtime_error(
        "LZO decompression failed: Output buffer size limit exceeded");
  }
}

double HybridZlib::crc32(const std::shared_ptr<ArrayBuffer> &data,
                         double startCrc) {
  return (double)zlib_crc32(data->data(), data->size(), (uint32_t)startCrc);
}

std::shared_ptr<HybridHybridZlibStreamSpec>
HybridZlib::createStream(double mode, double level, double windowBits) {
  return std::make_shared<HybridZlibStream>(mode, level, windowBits);
}

} // namespace margelo::nitro::nitro_zlib
