class Endpoint {
  constructor(endpointId, datacenterLatency, totalConnectedCacheServers) {
    this.endpointId = endpointId;
    this.datacenterLatency = datacenterLatency;
    this.totalConnectedCacheServers = totalConnectedCacheServers;
    this.cacheServersLatencies = new Map();
  }

  addCacheServerLatency(cacheServerId, latency) {
    this.cacheServersLatencies.set(cacheServerId, latency);
  }
}

module.exports = Endpoint;
