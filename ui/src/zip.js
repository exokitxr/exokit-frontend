var yazl = require("yazl");
var fs = require("fs");

var zipfile = new yazl.ZipFile();
var options = {compress: true, forceZip64Format: false};
var addStrategy = "addFile";
var verbose = true;

var args = process.argv.slice(2);


args.forEach(function(arg) {
  // file thing
  var stats = fs.statSync(arg);
  if (stats.isFile()) {
    if (verbose) console.log("addFile(" +
                             JSON.stringify(arg) + ", " +
                             JSON.stringify(arg) + ", " +
                             JSON.stringify(options) + ");");
    zipfile.addFile(arg, arg, options);
  } else if (stats.isDirectory()) {
    if (verbose) console.log("addEmptyDirectory(" +
                             JSON.stringify(arg) + ", ");
    zipfile.addEmptyDirectory(arg);
  } else {
    throw new Error("what is this: " + arg);
  }
});

var stream = fs.createWriteStream("outexokit.apk");
zipfile.outputStream.pipe(stream);

zipfile.end({forceZip64Format: options.forceZip64Format}, function(finalSize) {
  console.log("finalSize prediction: " + finalSize);
});
