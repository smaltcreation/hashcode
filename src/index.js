const getStdin = require('get-stdin');

const Video = require('./entities/Video');
const Endpoint = require('./entities/Endpoint');

getStdin().then(stdin => {
  try {
    main(stdin.trim().split('\n'));
  } catch (e) {
    console.log(e.message);
  }
});

function main(stdin) {
  const [ totalVideos, totalEndpoints, totalRequests, totalCacheServers, cacheServerCapacity ] = stdin
    .shift()
    .split(' ')
    .map(x => parseInt(x));

  console.log(`${totalVideos} videos`);
  console.log(`${totalEndpoints} endpoints`);
  console.log(`${totalRequests} requests`);
  console.log(`${totalCacheServers} cache servers, capacity = ${cacheServerCapacity}`);

  // Videos
  const videos = new Map();

  stdin.shift().split(' ').forEach((videoSize, videoId) => {
    videos.set(videoId, new Video(videoId, parseInt(videoSize)));
  });

  // Endpoints
  const endpoints = new Map();

  for (let endpointId = 0; endpointId < totalEndpoints; endpointId++) {
    const [ datacenterLatency, totalConnectedCacheServers ] = stdin.shift().split(' ').map(x => parseInt(x));
    const endpoint = new Endpoint(endpointId, datacenterLatency, totalConnectedCacheServers);

    for (let i = 0; i < totalConnectedCacheServers; i++) {
      const [ cacheServerId, latency ] = stdin.shift().split(' ').map(x => parseInt(x));

      endpoint.addCacheServerLatency(cacheServerId, latency);
    }

    endpoints.set(endpointId, endpoint);
  }

  // Requests
  for (let i = 0; i < totalRequests; i++) {
    const [ videoId, endpointId, requests ] = stdin.shift().split(' ').map(x => parseInt(x));

    videos.get(videoId).addRequests(endpointId, requests);
  }

  console.log('ready');
}
