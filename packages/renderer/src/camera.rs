use glam::{Affine3A, Quat, Vec2, Vec3};
use crate::common::Ray;

pub struct Camera {
    transform: Affine3A,
    focal_length: f32,
}

impl Camera {
    pub fn new(translation: Vec3, rotation: Quat, focal_length: f32) -> Camera {
        Camera {
            transform: Affine3A::from_rotation_translation(rotation, translation),
            focal_length,
        }
    }

    pub fn get_ray(self: &Camera, uv: Vec2) -> Ray {
        let camera_dir = Vec3::new(uv.x, uv.y, -self.focal_length).normalize();
        let r = self.transform.transform_vector3(camera_dir);
        let o = self.transform.transform_point3(Vec3::ZERO);
        Ray { o, d: r }
    }
}
