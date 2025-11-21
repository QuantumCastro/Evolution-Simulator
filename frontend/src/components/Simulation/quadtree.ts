export type Rect = { x: number; y: number; width: number; height: number };

export type QuadNode<T> = {
  x: number;
  y: number;
  data: T;
};

const inBounds = (rect: Rect, x: number, y: number) =>
  x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

export class Quadtree<T> {
  private readonly capacity: number;
  private readonly boundary: Rect;
  private points: QuadNode<T>[] = [];
  private divided = false;
  private northeast?: Quadtree<T>;
  private northwest?: Quadtree<T>;
  private southeast?: Quadtree<T>;
  private southwest?: Quadtree<T>;

  constructor(boundary: Rect, capacity = 8) {
    this.boundary = boundary;
    this.capacity = capacity;
  }

  insert(node: QuadNode<T>): boolean {
    if (!inBounds(this.boundary, node.x, node.y)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(node);
      return true;
    }

    if (!this.divided) this.subdivide();

    return (
      this.northeast!.insert(node) ||
      this.northwest!.insert(node) ||
      this.southeast!.insert(node) ||
      this.southwest!.insert(node)
    );
  }

  query(range: Rect, found: QuadNode<T>[] = []): QuadNode<T>[] {
    if (!this.intersects(range)) return found;

    for (const point of this.points) {
      if (inBounds(range, point.x, point.y)) found.push(point);
    }

    if (this.divided) {
      this.northeast?.query(range, found);
      this.northwest?.query(range, found);
      this.southeast?.query(range, found);
      this.southwest?.query(range, found);
    }

    return found;
  }

  queryRadius(x: number, y: number, radius: number): QuadNode<T>[] {
    const range: Rect = { x: x - radius, y: y - radius, width: radius * 2, height: radius * 2 };
    return this.query(range);
  }

  clear() {
    this.points = [];
    this.divided = false;
    this.northeast = this.northwest = this.southeast = this.southwest = undefined;
  }

  private subdivide() {
    const { x, y, width, height } = this.boundary;
    const halfW = width / 2;
    const halfH = height / 2;

    this.northeast = new Quadtree({ x: x + halfW, y, width: halfW, height: halfH }, this.capacity);
    this.northwest = new Quadtree({ x, y, width: halfW, height: halfH }, this.capacity);
    this.southeast = new Quadtree(
      { x: x + halfW, y: y + halfH, width: halfW, height: halfH },
      this.capacity,
    );
    this.southwest = new Quadtree({ x, y: y + halfH, width: halfW, height: halfH }, this.capacity);
    this.divided = true;
  }

  private intersects(range: Rect) {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    );
  }
}
