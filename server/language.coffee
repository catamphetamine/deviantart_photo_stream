Object.clone = (object) -> JSON.parse(JSON.stringify(object))

Array.prototype.has = (item) -> @indexOf(item) >= 0