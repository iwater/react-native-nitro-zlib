#include "HybridZlibStream.hpp"
#include <stdexcept>
#include <string>

namespace margelo::nitro::nitro_zlib {

static std::shared_ptr<ArrayBuffer> resultToArrayBufferStream(ZlibResult res) {
  if (res.error) {
    std::string err(res.error);
    zlib_free_result(res);
    throw std::runtime_error(err);
  }

  auto buffer = ArrayBuffer::allocate(res.len);
  std::memcpy(buffer->data(), res.data, res.len);

  zlib_free_result(res);
  return buffer;
}

std::shared_ptr<ArrayBuffer>
HybridZlibStream::write(const std::shared_ptr<ArrayBuffer> &data,
                        double flush) {
  ZlibResult res =
      zlib_stream_write(_ctx, data->data(), data->size(), (int)flush);
  return resultToArrayBufferStream(res);
}

} // namespace margelo::nitro::nitro_zlib
