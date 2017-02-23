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

      endpoint.sortCacheServers();
      endpoints.set(endpointId, endpoint);
    }
  }

  // console.log(videos);
  // console.log(endpoints);

  // Requests
  const ratios = [];

  for (let i = 0; i < totalRequests; i++) {
    const [ videoId, endpointId, requests ] = stdin.shift().split(' ').map(x => parseInt(x));

    if (videos.has(videoId)) {
      const video = videos.get(videoId);
      video.addRequests(endpointId, requests);

      ratios.push({
        videoId,
        endpointId,
        value: requests / video.size,
      });
    }
  }

  // Sort ratios
  ratios.sort((a, b) => b.value - a.value);

  // Solve
  ratios.forEach(ratio => {
    const video = videos.get(ratio.videoId);
    const endpoint = endpoints.get(ratio.endpointId);

    if (endpoint === undefined) {
      return false;
    }

    endpoint.cacheServersLatencies.some(options => {
      const cacheServer = cacheServers.get(options.cacheServerId);
      const videoAdded = !cacheServer.hasVideo(video) && cacheServer.remainingSpace >= video.size;

      if (videoAdded) {
        cacheServer.addVideo(video);
      }

      return videoAdded;
    });
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
