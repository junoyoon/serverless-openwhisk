'use strict';

const BaseRuntime = require('./base');
const exec = require('exec');
const fs = require('fs');
const glob = require("glob");

class GradleJava extends BaseRuntime {
  constructor (serverless) {
    super(serverless);
    this.kind = 'java'
  }


  calculateFunctionMain(functionObject) {
    return functionObject.handler;
  }

  resolveBuildArtifact(artifact) {
    // if artifact is end with jar... just return it..
    
    const files = glob.readdirSync(artifact + '/*.jar', {});
    return files.map((v)=> {
      return { 
        name:v,
        time:fs.statSync(dir + v).mtime.getTime()
      };
    })
      .sort(function(a, b) { return b.time - a.time; })
      .map(function(v) { return v.name; })[0];
  }
  
  generateActionPackage(functionObject) {
    let build = this.serverless.service.package.build || "build.sh";
    let artifact = this.serverless.service.package.artifact;
    let command = build;
    switch(build) {
      case "mvn" :
        command = "mvn package";
        artifact = artifact || "build/libs";
        break;
      case "mvnw" :
        command = (process.platform === "win32" ? "mvnw.bat package" : "mvnw package");
        artifact = artifact || "target";
        break;
      case "gradle" :
        command = "gradle package";
        artifact = artifact || "target";
        break;
      case "gradlew" :
        command = (process.platform === "win32" ? "gradlew.bat package" : "gradlew package");
        artifact = artifact || "build/libs";
        break;
    }
    
    return build(command)
      .then(() => {
        artifact = this.resolveBuildArtifact(artifact);
        // 로드 
    });
  
  }
  
  build(cmd, callback) {
    const exec = BbPromise.promisify(exec);
    return exec(cmd, (err, out, code)  => {
      if (err instanceof Error)
        throw err;
      process.stderr.write(err);
      process.stdout.write(out);
      if (code === 0) {
        callback();
      }
    });
  }
}

module.exports = Java
