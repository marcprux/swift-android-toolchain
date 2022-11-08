var Builder = require("../Builder");
var Component = require("../Components");
var Archs = require("../Archs");

module.exports = class SwiftCollectionsBuilder extends Builder {
  constructor() {
    super(Component.scoll, Archs.host);
  }

  executeConfigure() {
    var cmd = `
      cd ${this.paths.builds} && cmake
      -G Ninja
      -D CMAKE_INSTALL_PREFIX=/
      -D CMAKE_BUILD_TYPE=Release
      -D BUILD_SHARED_LIBS=YES
      -D CMAKE_OSX_DEPLOYMENT_TARGET=10.15
      -D BUILD_EXAMPLES=FALSE
      -D BUILD_TESTING=FALSE
      ${this.paths.sources}
`;
    this.executeCommands(cmd);
  }

  executeBuild() {
    this.execute(`cd ${this.paths.builds} && ninja -j${this.numberOfJobs}`);
  }

  executeInstall() {
    this.execute(`DESTDIR=${this.paths.installs} cmake --build ${this.paths.builds} --target install`);
  }
};
