use glam::{Vec3, Quat};

use crate::camera::Camera;

fn sd_sphere(p: Vec3, r: f32) -> f32 {
    p.length() - r
}

fn sd_box(p: Vec3, b: Vec3) -> f32 {
    let q = p.abs() - b;
    q.max(Vec3::ZERO).length() + q.max_element().min(0.)
}

pub fn sd_scene(p: Vec3) -> f32 {
    let a = sd_sphere(p, 1.3);
    let b = sd_box(p, Vec3::ONE);
    // diff 
    b.max(-a)
}

pub fn get_camera() -> Camera {
    let pos = Vec3::new(5., -11.2, 6.);
    // must reverse xyz
    let rot = Quat::from_euler(glam::EulerRot::ZYX, 0.4, 0., 1.1236);
    
    Camera::new(pos, rot, 3.)
}