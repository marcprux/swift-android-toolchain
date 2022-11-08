var Component = require("./Component");
var Revision = require("../Git/Revision");
var Repo = require("../Git/Repo");

module.exports = class SwiftSystemComponent extends Component {
  constructor() {
    super();
    this.sources = "swift-system";
    this.name = "swift-system";
    this.revision = Revision.ss;
    this.repository = Repo.ss;
    this.patches = this.name;
  }
};
