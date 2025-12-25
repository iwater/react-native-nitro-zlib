#include "RNZlibOnLoad.hpp"
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return margelo::nitro::nitro_zlib::initialize(vm);
}
