use glam::Vec3A;



pub struct Octree {
    root: Octant
}

impl Octree {
    pub fn new() -> Octree {
        
    }
}

enum OctantColor {
    White,
    Gray,
    Black,
}

struct Octant {
    color: OctantColor,
}