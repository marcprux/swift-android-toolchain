var Component = require("./Component");
var Revision = require("../Git/Revision");
var Repo = require("../Git/Repo");

module.exports = class SwiftCollectionsComponent extends Component {
  constructor() {
    super();
    this.sources = "swift-collections";
    this.name = "swift-collections";
    this.revision = Revision.scoll;
    this.repository = Repo.scoll;
    this.patches = this.name;
  }
};
