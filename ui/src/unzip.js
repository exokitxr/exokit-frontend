var yauzl = require("yauzl");
var path = require("path");
var fs = require("fs");
var util = require("util");
var Transform = require("stream").Transform;

var zipFilePath;
var args = process.argv.slice(2);
for (var i = 0; i < args.length; i++) {
  var arg = args[i];
  if (zipFilePath != null) throw new Error("too many arguments");
  zipFilePath = arg;
}


function mkdirp(dir, cb) {
  if (dir === ".") return cb();
  fs.stat(dir, function(err) {
    if (err == null) return cb(); // already exists

    var parent = path.dirname(dir);
    mkdirp(parent, function() {
      process.stdout.write(dir.replace(/\/$/, "") + "/\n");
      fs.mkdir(dir, cb);
    });
  });
}


yauzl.open(zipFilePath, {lazyEntries: true}, handleZipFile);

function handleZipFile(err, zipfile) {
  if (err) throw err;

  // track when we've closed all our file handles
  var handleCount = 0;
  function incrementHandleCount() {
    handleCount++;
  }
  function decrementHandleCount() {
    handleCount--;
    if (handleCount === 0) {
      console.log("all input and output handles closed");
    }
  }

  incrementHandleCount();
  zipfile.on("close", function() {
    console.log("closed input file");
    decrementHandleCount();
  });

  zipfile.readEntry();
  zipfile.on("entry", function(entry) {
    if (/\/$/.test(entry.fileName)) {
      // directory file names end with '/'
      mkdirp(entry.fileName, function() {
        if (err) throw err;
        zipfile.readEntry();
      });
    } else {
      // ensure parent directory exists
      mkdirp(path.dirname(entry.fileName), function() {
        zipfile.openReadStream(entry, function(err, readStream) {
          if (err) throw err;
          // report progress through large files
          var byteCount = 0;
          var totalBytes = entry.uncompressedSize;
          var lastReportedString = byteCount + "/" + totalBytes + "  0%";
          process.stdout.write(entry.fileName + "..." + lastReportedString);
          function reportString(msg) {
            var clearString = "";
            for (var i = 0; i < lastReportedString.length; i++) {
              clearString += "\b";
              if (i >= msg.length) {
                clearString += " \b";
              }
            }
            process.stdout.write(clearString + msg);
            lastReportedString = msg;
          }
          // report progress at 60Hz
          var progressInterval = setInterval(function() {
            reportString(byteCount + "/" + totalBytes + "  " + ((byteCount / totalBytes * 100) | 0) + "%");
          }, 1000 / 60);
          var filter = new Transform();
          filter._transform = function(chunk, encoding, cb) {
            byteCount += chunk.length;
            cb(null, chunk);
          };
          filter._flush = function(cb) {
            clearInterval(progressInterval);
            reportString("");
            // delete the "..."
            process.stdout.write("\b \b\b \b\b \b\n");
            cb();
            zipfile.readEntry();
          };

          // pump file contents
          var writeStream = fs.createWriteStream(entry.fileName);
          incrementHandleCount();
          writeStream.on("close", decrementHandleCount);
          readStream.pipe(filter).pipe(writeStream);
        });
      });
    }
  });
}
