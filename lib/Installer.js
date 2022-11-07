/*
 * The MIT License
 *
 * Copyright (c) 2019 Volodymyr Gorlov (https://github.com/vgorloff)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var fs = require("fs");
var path = require("path");
const cp = require("child_process");

var Tool = require("./Tool");
var Config = require("./Config");
var Paths = require("./Paths");
var Components = require("./Components");
var Settings = require("./Settings");
var Folder = require("./Folder");
var DispatchBuilder = require("./Builders/DispatchBuilder");
var FoundationBuilder = require("./Builders/FoundationBuilder");
var SwiftStdLibBuilder = require("./Builders/SwiftStdLibBuilder");
var SwiftBuilder = require("./Builders/SwiftBuilder");
var XMLBuilder = require("./Builders/XMLBuilder");
var SSLBuilder = require("./Builders/SSLBuilder");
var CURLBuilder = require("./Builders/CURLBuilder");
var ICUBuilder = require("./Builders/ICUBuilder");
var CBLASBuilder = require("./Builders/CBLASBuilder");
var SPMBuilder = require("./Builders/SPMBuilder");
var LLBBuilder = require("./Builders/LLBBuilder");
var SwiftTSCBuilder = require("./Builders/SwiftTSCBuilder");
const SAPBuilder = require("./Builders/SAPBuilder");
const YAMSBuilder = require("./Builders/YAMSBuilder");
const SwiftDriverBuilder = require("./Builders/SwiftDriverBuilder");
const SwiftCryptoBuilder = require("./Builders/SwiftCryptoBuilder");
const SwiftSystemBuilder = require("./Builders/SwiftSystemBuilder");

module.exports = class Installer extends Tool {
  install() {
    var toolchainDir = Config.toolChainBuildOutput;
    this.print(`Installing toolchain into "${toolchainDir}"`, 32);

    if (fs.existsSync(toolchainDir)) {
      fs.rmdirSync(toolchainDir, { recursive: true });
    }
    fs.mkdirSync(toolchainDir, { recursive: true });

    this.copyToolchainFiles();
    this.makeSymbolicLinks();
    this.copyAssets();
    this.copyLicenses();
    this.fixModuleMaps();
    this.print(`Toolchain installed into "${toolchainDir}"`, 36);
  }

  makeSymbolicLinks() {
    var libDirPath = path.join(Config.toolChainBuildOutput, "usr", "lib");
    this.execute(`cd "${libDirPath}" && ln -svf ./swift/macosx/libArgumentParser.dylib`);
    this.execute(`cd "${libDirPath}" && ln -svf ./swift/macosx/libYams.dylib`);
    this.execute(`cd "${libDirPath}" && ln -svf ./swift/macosx/libCrypto.dylib`);
    this.execute(`cd "${libDirPath}" && ln -svf ./swift/macosx/libSystem.dylib`);
  }

  copyToolchainFiles() {
    var dstDir = path.join(Config.toolChainBuildOutput, "usr");
    new SwiftBuilder().copyTo(dstDir);
    new SPMBuilder().copyTo(dstDir);
    new LLBBuilder().copyTo(dstDir);
    new SwiftTSCBuilder().copyTo(dstDir);
    new SAPBuilder().copyTo(dstDir);
    new YAMSBuilder().copyTo(dstDir);
    new SwiftDriverBuilder().copyTo(dstDir);
    new SwiftCryptoBuilder().copyTo(dstDir);
    new SwiftSystemBuilder().copyTo(dstDir);
    this.archs.forEach((arch) => {
      new DispatchBuilder(arch).copyTo(dstDir);
      new FoundationBuilder(arch).copyTo(dstDir);
      new SwiftStdLibBuilder(arch).copyTo(dstDir);
      new XMLBuilder(arch).copyLibsTo(dstDir);
      new SSLBuilder(arch).copyLibsTo(dstDir);
      new CURLBuilder(arch).copyLibsTo(dstDir);
      new ICUBuilder(arch).copyLibsTo(dstDir);
      new CBLASBuilder(arch).copyLibsTo(dstDir);
    });
  }

  fixModuleMaps() {
    var moduleMaps = cp
      .execSync(`find "${Config.toolChainBuildOutput}/usr/lib/swift" -iname glibc.modulemap`)
      .toString()
      .trim()
      .split("\n");
    moduleMaps.forEach((file) => {
      this.logMessage(`* Correcting modulemap file "${file}"`);
      var contents = fs.readFileSync(file, "utf8").toString();
      contents = contents.replace(/header\s+\".+sysroot/g, `header \"${Settings.sharedNDKDirPath}/sysroot`);
      fs.writeFileSync(file, contents);
    });
  }

  copyAssets() {
    var toolchainDir = Config.toolChainBuildOutput;
    this.execute(`cp -f "${Config.root}/CHANGELOG.md" ${toolchainDir}`);
    this.execute(`cp -f "${Config.root}/VERSION" ${toolchainDir}`);
    this.execute(`cp -f "${Config.root}/NDK_VERSION" ${toolchainDir}`);
    this.execute(`cp -f "${Config.root}/LICENSE.txt" ${toolchainDir}`);
    this.execute(`cp -f "${Config.root}/Assets/Readme.md" ${toolchainDir}`);
    this.execute(`mkdir -p "${toolchainDir}/usr/bin"`);

    var output = cp.execSync(`find "${Config.root}/Assets" -type f`).toString().trim().split("\n");
    output = output.filter((item) => !item.endsWith("Readme.md"));
    output.forEach((item) => {
      this.execute(`cp -f "${item}" "${toolchainDir}/usr/bin"`);
    });
  }

  copyLicenses() {
    var toolchainDir = Config.toolChainBuildOutput;
    var sourcesDir = path.join(Config.toolChain, Folder.sources);
    var files = [];
    files.push(`${Paths.sourcesDirPath(Components.cmark)}/COPYING`);
    files.push(`${Paths.sourcesDirPath(Components.curl)}/COPYING`);
    files.push(`${Paths.sourcesDirPath(Components.icu)}/icu4c/LICENSE`);
    files.push(`${Paths.sourcesDirPath(Components.llvm)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.llvm)}/clang/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.llvm)}/compiler-rt/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.ssl)}/LICENSE`);
    files.push(`${Paths.sourcesDirPath(Components.dispatch)}/LICENSE`);
    files.push(`${Paths.sourcesDirPath(Components.foundation)}/LICENSE`);
    files.push(`${Paths.sourcesDirPath(Components.spm)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.llb)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.xml)}/Copyright`);
    files.push(`${Paths.sourcesDirPath(Components.tsc)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.sap)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.sd)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.sc)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.ss)}/LICENSE.txt`);
    files.push(`${Paths.sourcesDirPath(Components.yams)}/LICENSE`);
    // files.push(`${Paths.sourcesDirPath(Components.swift)}/LICENSE.txt`) // Already copied by StdLib builder.
    files.forEach((file) => {
      var dst = file.replace(sourcesDir, `${toolchainDir}/usr/share`);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      this.execute(`cp -f "${file}" ${dst}`);
    });
  }
};
