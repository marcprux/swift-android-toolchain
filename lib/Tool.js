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

const cp = require("child_process");
const Archs = require("./Archs");

module.exports = class Tool {
  constructor() {
    this.platform = "darwin";

    // fewer archs speeds up the build
    this.archs = [Archs.x86_64];
    //this.archs = [Archs.arm64];
    //this.archs = [Archs.arm64, Archs.x86_64];
    //this.archs = [Archs.arm, Archs.arm64, Archs.x86_64];
    //this.archs = [Archs.arm, Archs.arm64, Archs.x86, Archs.x86_64];

    var args = process.argv.slice(2);
    this.isDryRun = args.filter((item) => item == "--dry-run").length > 0

    var arg = args.filter((item) => item.startsWith("arch"))[0];
    if (arg) {
      var components = arg.split(":");
      if (components.length == 2) {
        var arch = components[1];
        var archsToBuild = this.archs.filter((item) => item.name == arch);
        if (archsToBuild.length > 0) {
          this.archs = archsToBuild;
        }
      }
    }
  }

  print(message, color) {
    // See: How to change node.js's console font color? - Stack Overflow: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    console.log(`\x1b[${color}m${message}\x1b[0m`);
  }

  logError(message) {
    this.print(message, 31); // Red color.
  }

  logInfo(message) {
    this.print(message, 36); // Light blue color.
  }

  logMessage(message) {
    this.print(message, 32); // Green color.
  }

  execute(command) {
    this.print(command, 32); // Green color.
    if (this.isDryRun) {
      return
    }
    try {
      cp.execSync(command, { stdio: "inherit" });
    } catch (error) {
      this.logInfo("Execution of command is failed:");
      this.logError(command);
      var help = `
If error was due Memory, CPU, or Disk peak resource usage (i.e. missed file while file exists),
then try to run previous command again. Build process will perform "configure" step again,
but most of compilation steps will be skipped.
`;
      this.logMessage(help);
      throw error;
    }
  }

  executeCommands(/** @type {String} */ commands) {
    var lines = commands.split("\n").map((line) => line.trim());
    lines = lines.filter((line) => (line.startsWith("#") || line.startsWith("//") || line.length == 0) != true);
    this.execute(lines.join(" \\\n   "));
  }
};
