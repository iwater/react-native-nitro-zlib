#pragma once

#include "HybridHybridZlibStreamSpec.hpp"
#include <NitroModules/ArrayBuffer.hpp>

extern "C" {
#include "zlib_ffi.h"
}

namespace margelo::nitro::nitro_zlib {

using namespace margelo::nitro;

class HybridZlibStream : public HybridHybridZlibStreamSpec {
public:
  HybridZlibStream() : HybridObject(TAG), HybridHybridZlibStreamSpec() {
    _ctx = nullptr;
  }

  HybridZlibStream(double mode, double level, double windowBits)
      : HybridObject(TAG), HybridHybridZlibStreamSpec() {
    _ctx = zlib_stream_create((int)mode, (int)level, (int)windowBits);
  }

  // For when we need to return shared_ptr from createStream
  // We can't use constructor directly from createStream if it needs to return
  // std::shared_ptr<HybridZlibStream> which implements HybridObject.

  ~HybridZlibStream() override {
    if (_ctx) {
      zlib_stream_destroy(_ctx);
      _ctx = nullptr;
    }
  }

  std::shared_ptr<ArrayBuffer> write(const std::shared_ptr<ArrayBuffer> &data,
                                     double flush) override;

private:
  void *_ctx;
};

} // namespace margelo::nitro::nitro_zlib
