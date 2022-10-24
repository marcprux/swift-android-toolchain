//
//  Created by Arman Soudi on 10/24/22.
//

var Component = require("./Component");
var Revision = require("../Git/Revision");
var Repo = require("../Git/Repo");

module.exports = class CBLASCompoment extends Component {
  constructor() {
    super()
    this.sources = "cblas"
    this.name = "cblas"
    this.revision = Revision.cblas
    this.repository = Repo.cblas
    this.patches = this.name;
  }
};
