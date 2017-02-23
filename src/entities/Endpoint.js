class Endpoint {
  constructor(endpointId, datacenterLatency, totalConnectedCacheServers) {
    this.endpointId = endpointId;
    this.datacenterLatency = datacenterLatency;
    this.totalConnectedCacheServers = totalConnectedCacheServers;
    this.cacheServersLatencies = [];
  }

  addCacheServerLatency(cacheServerId, latency) {
    this.cacheServersLatencies.push({
      cacheServerId,
      latency,
    });
  }

  sortCacheServers() {
    this.cacheServersLatencies.sort((a, b) => a.latency - b.latency);
  }
}

module.exports = Endpoint;
