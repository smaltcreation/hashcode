const getStdin = require('get-stdin');

const Video = require('./entities/Video');
const Endpoint = require('./entities/Endpoint');
const CacheServer = require('./entities/CacheServer');

getStdin().then(stdin => {
  try {
    main(stdin.trim().split('\n'));
  } catch (e) {
    console.log(e);
  }
});

function main(stdin) {
  const [ totalVideos, totalEndpoints, totalRequests, totalCacheServers, cacheServerCapacity ] = stdin
    .shift()
    .split(' ')
    .map(x => parseInt(x));

  // console.log(`${totalVideos} videos`);
  // console.log(`${totalEndpoints} endpoints`);
  // console.log(`${totalRequests} requests`);
  // console.log(`${totalCacheServers} cache servers, capacity = ${cacheServerCapacity}`);

  // Cache servers
  const cacheServers = new Map();

  for (let cacheServerId = 0; cacheServerId < totalCacheServers; cacheServerId++) {
    const cacheServer = new CacheServer(cacheServerId, cacheServerCapacity);
    cacheServers.set(cacheServerId, cacheServer);
  }

  // Videos
  const videos = new Map();

  stdin.shift().split(' ').forEach((videoSize, videoId) => {
    if (videoSize <= cacheServerCapacity) {
      videos.set(videoId, new Video(videoId, parseInt(videoSize)));
    }
  });

  // Endpoints
  const endpoints = new Map();

  for (let endpointId = 0; endpointId < totalEndpoints; endpointId++) {
    const [ datacenterLatency, totalConnectedCacheServers ] = stdin.shift().split(' ').map(x => parseInt(x));
    const endpoint = new Endpoint(endpointId, datacenterLatency, totalConnectedCacheServers);

    if (totalConnectedCacheServers !== 0) {
      for (let i = 0; i < totalConnectedCacheServers; i++) {
        const [ cacheServerId, latency ] = stdin.shift().split(' ').map(x => parseInt(x));

        endpoint.addCacheServerLatency(cacheServerId, latency);
      }

      endpoints.set(endpointId, endpoint);
    }
  }

  // console.log(videos);
  // console.log(endpoints);

  // Requests
  for (let i = 0; i < totalRequests; i++) {
    const [ videoId, endpointId, requests ] = stdin.shift().split(' ').map(x => parseInt(x));

    if (videos.has(videoId)) {
      videos.get(videoId).addRequests(endpointId, requests);
    }
  }

  // Solve
  videos.forEach(video => {
    let maxRequests = 0;
    let bestEndpointId = null;

    video.requestsByEndpoints.forEach((requests, endpointId) => {
      if (requests > maxRequests) {
        maxRequests = requests;
        bestEndpointId = endpointId;
      }
    });

    if (!endpoints.has(bestEndpointId)) {
      return false;
    }

    const bestEndpoint = endpoints.get(bestEndpointId);
    let minLatency = Infinity;
    let bestCacheServerId = null;

    bestEndpoint.cacheServersLatencies.forEach((latency, cacheServerId) => {
      if (latency < minLatency) {
        minLatency = latency;
        bestCacheServerId = cacheServerId;
      }
    });

    const bestCacheServer = cacheServers.get(bestCacheServerId);

    if (!bestCacheServer.hasVideo(video) && bestCacheServer.remainingSpace >= video.size) {
      bestCacheServer.addVideo(video);
    }
  });

  // Output
  const outputs = [];

  cacheServers.forEach(cacheServer => {
    if (cacheServer.videos.size !== 0) {
      const videosIds = Array.from(cacheServer.videos.keys());
      outputs.push(`${cacheServer.id} ${videosIds.join(' ')}`);
    }
  });

  outputs.unshift(outputs.length);
  console.log(outputs.join('\n'));
}
