require_relative "../Common/Builder.rb"

class XMLBuilder < Builder

   def initialize(arch = Arch.default)
      super(Lib.xml, arch)
   end

   def checkout
      # v2.9.9-rc2: a71b98ec9dee2d44e16a74ab8472868891bbc7b4
      checkoutIfNeeded(@sources, "https://github.com/GNOME/libxml2.git", "a71b98ec9dee2d44e16a74ab8472868891bbc7b4")
   end

   def prepare
      # Not used at the moment.
      # prepareBuilds()
   end

   def configure
      logConfigureStarted
      prepare
      # Arguments took from `swift/swift-corelibs-foundation/build-android`
      ndk = AndroidBuilder.new(@arch)
      archFlags = "-march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16"
      ldFlags = "-march=armv7-a -Wl,--fix-cortex-a8"
      cmd = ["cd #{@sources} &&"]
      cmd << "PATH=#{ndk.bin}:$PATH"
      cmd << "CC=#{ndk.bin}/arm-linux-androideabi-clang"
      cmd << "CXX=#{ndk.bin}/arm-linux-androideabi-clang++"
      cmd << "AR=#{ndk.bin}/arm-linux-androideabi-ar"
      cmd << "AS=#{ndk.bin}/arm-linux-androideabi-as"
      cmd << "LD=#{ndk.bin}/arm-linux-androideabi-ld"
      cmd << "RANLIB=#{ndk.bin}/arm-linux-androideabi-ranlib"
      cmd << "NM=#{ndk.bin}/arm-linux-androideabi-nm"
      cmd << "STRIP=#{ndk.bin}/arm-linux-androideabi-strip"
      cmd << "CHOST=arm-linux-androideabi"
      cmd << "CPPFLAGS=\"#{archFlags} -fpic -ffunction-sections -funwind-tables -fstack-protector -fno-strict-aliasing\""
      cmd << "CXXFLAGS=\"#{archFlags} -fpic -ffunction-sections -funwind-tables -fstack-protector -fno-strict-aliasing -frtti -fexceptions -std=c++11 -Wno-error=unused-command-line-argument\""
      cmd << "CFLAGS=\"#{archFlags} -fpic -ffunction-sections -funwind-tables -fstack-protector -fno-strict-aliasing\""
      cmd << "LDFLAGS=\"#{ldFlags}\""

      execute cmd.join(" ") + " autoreconf -i"

      args = "--with-sysroot=#{ndk.installs}/sysroot --with-zlib=#{ndk.installs}/sysroot/usr --prefix=#{@installs} --host=arm-linux-androideabi --without-lzma --disable-static --enable-shared --without-http --without-html --without-ftp"
      execute cmd.join(" ") + " ./configure " + args
      logConfigureCompleted
   end

   def build
      logBuildStarted
      prepare
      execute "cd #{@sources} && make libxml2.la"
      logBuildCompleted
   end

   def install
      logInstallStarted
      execute "cd #{@sources} && make install-libLTLIBRARIES"
      execute "cd #{@sources}/include && make install"
      logInstallCompleted
   end

   def make
      configure
      build
      install
   end

   def clean
      removeBuilds()
      cleanGitRepo()
   end

end
