cmake_minimum_required(VERSION 3.9.0)
project(RNZlib)

set(PACKAGE_NAME RNZlib)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Add our custom implementation and JNI adapter
add_library(${PACKAGE_NAME} SHARED
        ../cpp/HybridZlib.cpp
        ../cpp/HybridZlibStream.cpp
        OnLoad.cpp
)

# Include paths for our headers
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/../cpp
)

# Include the Nitrogen-generated CMake file
include(${CMAKE_CURRENT_SOURCE_DIR}/../nitrogen/generated/android/RNZlib+autolinking.cmake)

# Link the Rust Zlib library
target_link_directories(${PACKAGE_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/libs/${ANDROID_ABI})
target_link_libraries(${PACKAGE_NAME} 
    rust_c_zlib
    log # For android logging
)
