class Video {
  constructor(id, size) {
    this.id = id;
    this.size = size;
    this.requestsByEndpoints = new Map();
  }

  addRequests(endpointId, requests) {
    this.requestsByEndpoints.set(endpointId, requests);
  }
}

module.exports = Video;
