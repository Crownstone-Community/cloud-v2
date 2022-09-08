class SphereIndexCacheClass {
  spheres : Record<sphereId, {counter: number, timestamp: number}> = {};


  bump(sphereId: sphereId) {
    if (this.spheres[sphereId] === undefined) {
      this.spheres[sphereId] = {counter:0, timestamp: Date.now()}
    }

    this.spheres[sphereId].counter += 1;
    this.spheres[sphereId].counter = this.spheres[sphereId].counter % 0xffffffff;
    this.spheres[sphereId].timestamp = Date.now();
  }


  getLatest(sphereId: sphereId) {
    if (this.spheres[sphereId] === undefined) {
      this.spheres[sphereId] = {counter:0, timestamp: Date.now()}
    }
    return {...this.spheres[sphereId]};
  }

}

export const SphereIndexCache = new SphereIndexCacheClass();
