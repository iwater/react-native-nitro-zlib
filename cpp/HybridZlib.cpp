#include "HybridZlib.hpp"
#include "HybridZlibStream.hpp"
#include <stdexcept>
#include <string>
#include <vector>

namespace margelo::nitro::nitro_zlib {

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

double HybridZlib::crc32(const std::shared_ptr<ArrayBuffer> &data,
                         double startCrc) {
  return (double)zlib_crc32(data->data(), data->size(), (uint32_t)startCrc);
}

std::shared_ptr<HybridHybridZlibStreamSpec>
HybridZlib::createStream(double mode, double level, double windowBits) {
  return std::make_shared<HybridZlibStream>(mode, level, windowBits);
}

} // namespace margelo::nitro::nitro_zlib
