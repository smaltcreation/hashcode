class CacheServer {
  constructor(id, capacity) {
    this.id = id;
    this.remainingSpace = capacity;
    this.videos = new Map();
  }

  hasVideo(video) {
    return this.videos.has(video.id);
  }

  addVideo(video) {
    this.videos.set(video.id, video);
    this.remainingSpace -= video.size;
  }
}

module.exports = CacheServer;
