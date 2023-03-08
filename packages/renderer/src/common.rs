use glam::Vec3;

pub struct Ray {
    pub o: Vec3,
    pub d: Vec3,
}

impl Ray {
    pub fn at(self: &Ray, t: f32) -> Vec3 {
        self.o + self.d * t
    }
}
