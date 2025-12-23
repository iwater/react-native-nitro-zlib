#pragma once

#include "HybridHybridZlibStreamSpec.hpp"
#include "HybridNitroZlibSpec.hpp"
#include <NitroModules/ArrayBuffer.hpp>

extern "C" {
#include "zlib_ffi.h"
}

namespace margelo::nitro::nitro_zlib {

using namespace margelo::nitro;

class HybridZlib : public HybridNitroZlibSpec {
public:
  HybridZlib() : HybridObject(TAG), HybridNitroZlibSpec() {}

  std::shared_ptr<ArrayBuffer>
  deflateSync(const std::shared_ptr<ArrayBuffer> &data, double level,
              double windowBits) override;
  std::shared_ptr<ArrayBuffer>
  deflateRawSync(const std::shared_ptr<ArrayBuffer> &data,
                 double level) override;
  std::shared_ptr<ArrayBuffer>
  gzipSync(const std::shared_ptr<ArrayBuffer> &data, double level) override;

  std::shared_ptr<ArrayBuffer>
  inflateSync(const std::shared_ptr<ArrayBuffer> &data,
              double windowBits) override;
  std::shared_ptr<ArrayBuffer>
  inflateRawSync(const std::shared_ptr<ArrayBuffer> &data) override;
  std::shared_ptr<ArrayBuffer>
  gunzipSync(const std::shared_ptr<ArrayBuffer> &data) override;
  std::shared_ptr<ArrayBuffer>
  brotliCompressSync(const std::shared_ptr<ArrayBuffer> &data, double quality,
                     double windowBits) override;
  std::shared_ptr<ArrayBuffer>
  brotliDecompressSync(const std::shared_ptr<ArrayBuffer> &data) override;
  double crc32(const std::shared_ptr<ArrayBuffer> &data,
               double startCrc) override;

  std::shared_ptr<HybridHybridZlibStreamSpec>
  createStream(double mode, double level, double windowBits) override;
};

} // namespace margelo::nitro::nitro_zlib
