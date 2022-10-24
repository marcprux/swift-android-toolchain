//
//  Created by Arman Soudi on 10/24/22.
//

var Builder = require("../Builder");
var Component = require("../Components");
var Arch = require("../Archs/Arch");
var NDK = require("../NDK");
var Archs = require("../Archs");

module.exports = class CBLASBuilder extends Builder {
  constructor(/** @type {Arch} */ arch) {
    super(Component.cblas, arch);
    var ndk = new NDK();
    this.options = `NDK=${ndk.sources} 
    TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/darwin-x86_64`;
  }

  executeBuild() {

    var cmd = `
    ${this.options}
    make \
    ONLY_CBLAS=1 \
    HOSTCC=gcc \
    `;

    if (this.arch.name == Archs.arm.name) {
      cmd = `${cmd} TARGET=ARMV7 \
      ARM_SOFTFP_ABI=1 \ 
      CC="$TOOLCHAIN"/bin/armv7a-linux-androideabi21-clang \
      AR="$TOOLCHAIN"/bin/arm-linux-androideabi-ar \
      `;
    } else if (this.arch.name == Archs.arm64.name) {
      cmd = `${cmd} TARGET=CORTEXA57 \
      CC=$TOOLCHAIN/bin/aarch64-linux-android21-clang \
      AR=$TOOLCHAIN/bin/aarch64-linux-android-ar \
      `;
    } else if (this.arch.name == Archs.x86.name) {
      cmd = `${cmd} TARGET=ATOM \
      ARM_SOFTFP_ABI=1 \ 
      CC="$TOOLCHAIN"/bin/i686-linux-android21-clang \
      AR="$TOOLCHAIN"/bin/i686-linux-android-ar \
      `;
    } else if (this.arch.name == Archs.x86_64.name) {
      cmd = `${cmd} TARGET=ATOM BINARY=64\ 
      ARM_SOFTFP_ABI=1 \
      CC="$TOOLCHAIN"/bin/x86_64-linux-android21-clang \
      AR="$TOOLCHAIN"/bin/x86_64-linux-android-ar \
      `;
    }

    cmd = `${cmd} -j4`;

    this.executeCommands(`cd ${this.paths.sources} && make clean && ${cmd}`);
  }

  executeInstall() {
    this.executeCommands(
      `cd ${this.paths.sources} && make PREFIX=./build install`
    );
  }

  copyLibsTo(dirPath) {


    var fileName = ""
    if (this.arch.name == Archs.arm.name) {
      fileName = "libopenblas_armv7p-r0.3.21"
    } else if (this.arch.name == Archs.arm64.name) {
      fileName = "libopenblas_cortexa57p-r0.3.21"
    } else if (this.arch.name == Archs.x86.name) {
      fileName = "libopenblas_atomp-r0.3.21"
    } else if (this.arch.name == Archs.x86_64.name) {
      fileName = "libopenblas_atomp-r0.3.21"
    }

    console.log(`copying -> ${this.paths.sources}/build/lib/${fileName}.so ${dirPath}/lib/swift/android/${this.arch.swiftArch}/`)
    this.executeCommands(`mkdir -p ${dirPath}/lib/swift/android/${this.arch.swiftArch}/ &&
     cp ${this.paths.sources}/build/lib/${fileName}.so ${dirPath}/lib/swift/android/${this.arch.swiftArch}/ &&
     mv ${dirPath}/lib/swift/android/${this.arch.swiftArch}/${fileName}.so ${dirPath}/lib/swift/android/${this.arch.swiftArch}/libopenblas.so
     `);
  }

  get libs() {
    return []
  }
};
