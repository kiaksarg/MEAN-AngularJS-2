//Modules
var gulp = require("gulp");
var shell = require("gulp-shell");
var dockerode = require("dockerode");
var docker = dockerode();
var config = require("../config.js");

/* !Tasks 
- setup.dependant
- setup.dependant.npm
- setup.dependant.semantic
- setup.dependant.bower

- setup.tsd
- setup.tsd.server
- setup.tsd.client

- setup.docker
- setup.docker.nodejs
- setup.docker.mongodb

- setup.certs
*/

// !Dependancies
gulp.task("setup.dependant", gulp.series(
	gulp.series("setup.dependant.npm"),
	gulp.parallel("setup.dependant.semantic", "setup.dependant.bower")
));

//Install npm dependancies
gulp.task("setup.dependant.npm", shell.task([
	"npm install --save-dev --ignore-scripts semantic-ui",
],{
	verbose: true
}));


//Install semantic dependancies
gulp.task("setup.dependant.semantic", shell.task([
	"npm install",
	"gulp install"
],{
	verbose: true,
	cwd: "node_modules/semantic-ui",
	interactive: true
}));

//Install bower dependancies
gulp.task("setup.dependant.bower", shell.task([
	"bower install --config.analytics=false --allow-root"
]));

// !Tsd Typings
gulp.task("setup.tsd", gulp.parallel("setup.tsd.server", "setup.tsd.client"));

//Install tsd server typings
gulp.task("setup.tsd.server", shell.task([
	"tsd install"
],{
	cwd: "server"
}));

//Install tsd client typings
gulp.task("setup.tsd.client", shell.task([
	"tsd install"
],{
	cwd: "client"
}));

// !Docker Dependancies
gulp.task("setup.docker", gulp.series("setup.docker.mongodb", "setup.docker.nodejs"));

//Pull required mongodb docker images
gulp.task("setup.docker.mongodb", function(done){
	docker.pull("mongo:latest", function (err, stream) {
		if (err){ throw err; }
		
		//Track progress
		docker.modem.followProgress(stream, function (err, output){
			if (err){ throw err; }
			console.log(output);
			done();
		});
	});
});

//Pull required nodejs docker images
gulp.task("setup.docker.nodejs", function(done){
	docker.pull("node:slim", function (err, stream) {
		if (err){ throw err; }
		
		//Track progress
		docker.modem.followProgress(stream, function (err, output){
			if (err){ throw err; }
			console.log(output);
			done();
		});
	});
});

// !Certificates

//Certificate subject string
var subj = "'/C=" + config.certs.details.country + "/ST=" + config.certs.details.state + "/L=" + config.certs.details.city + "/O=" + config.certs.details.organisation + "/CN=" + config.certs.details.hostname + "'";

//Generate certificates and key files
gulp.task("setup.certs", shell.task([
	"openssl req -new -newkey rsa:2048 -days 1825 -nodes -x509 -subj " + subj + " -keyout " + config.https.ssl.key + " -out " + config.https.ssl.cert,
	"openssl req -new -newkey rsa:2048 -days 1825 -nodes -x509 -subj " + subj + " -keyout " + config.database.ssl.key + " -out " + config.database.ssl.cert,
	"openssl rand -base64 741 > " + config.database.repl.key + " && chmod 600 " + config.database.repl.key,
	"cat " + config.database.ssl.key + " " + config.database.ssl.cert + " > " + config.database.ssl.pem,
	"chown 999:999 " + config.https.ssl.cert + " " + config.database.ssl.cert + " " + config.database.repl.key + " " + config.database.ssl.pem,
],{
	verbose: true,
	cwd: "certs"
}));