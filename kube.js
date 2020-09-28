
// Configuration for parameters
const argv = require('yargs')
	.usage('Usage: $0 <command> [options]')
    .command('tail', 'Tails the given pod', {
        pod: {
        	alias: 'p',
        	description: 'Pod to be tailed',
        	type: 'string',
        	demand: 'Please specify pod to be tailed'
        },
    })

    .command('pods', 'Shows the list of pods for the namespace', {
    	info: {
    		description: 'Show more info for each pod',
    		alias: 'i',
    		type: 'boolean'
    	}
    })
    .option('namespace', {
    	alias: 'n',
    	type: 'string'
    })
    .demandOption(['namespace'], 'Please provide namespace to work with this tool')
    .help()
    .alias('help', 'h')
    .argv;



//const fs = require('fs');

const REQUEST = require('request');
const OPTIONS = require('./options');

if (argv._.includes('tail')) {
	//tailPod(argv.pod, argv.namespace);
}
else if (argv._.includes('pods')) {
	fetchPods(argv.namespace)
    .then( (pods) => {
        showPods(pods, argv.info);
    })
    .catch( (err) => {
        // Manage error pls, for now, only logging
        console.log(err);
    });
}



function showPods(pods, info) {
    console.log("Pods fetched: {}", pods.listMeta.totalItems);
    console.log("Name\tRestarts\tStatus\tCreatedTime\tVersion");
    for (var pod of pods) {
        var objectMeta = pod.objectMeta;
        if (info) {
            console.log("{}\t{}\t{}\t{}\t{}"
                , objectMeta.name
                , pod.restartCount
                , pod.podStatus.podPhase
                , objectMeta.creationTimestamp
                , objectMeta.labels.version
                ); 

        } else {
            console.log("{}\t{}\t{}"
                , objectMeta.name
                , pod.restartCount
                , pod.podStatus.podPhase 
                );
        }
    }
}


async function tailPod(fPod, namespace) {
	var pods = fetchPods(false, namespace);
	var pod = findPodByName(pods, fPod);


}


async function fetchPods(namespace) {

	var parameters = new Map();
	parameters.set('{namespace}', namespace);
    var uri = replaceParametersURI(OPTIONS.URI_PODS, parameters);


    return new Promise(function (resolve, reject)) {
        try {
            var pods = await executeHttp(uri);
            resolve(pods);
        } catch(er){
            reject(er);
        }
    }
}




async function executeHttp(uri) {
	console.log('Executing http to: ' + uri);
	 return new Promise(function (resolve, reject) {

        REQUEST(OPTIONS.hostname + '/' + uri, { json: true }, (err, res, body) => {
        if (err) { 
            console.log(err);
            reject(err); 
        }
            resolve(body);
        });
    });
}


function replaceParametersURI(uri, params) {
	//TODO: Return the uri with params
	var convUri = uri;
	for (var key of params.keys()) {
		convUri = convUri.replace(key, params.get(key));
	}

	return convUri;
}