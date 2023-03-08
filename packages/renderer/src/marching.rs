use crate::{common::Ray, scene, camera::Camera};
use glam::{Vec3, Vec2};

pub fn shade(uv: Vec2, camera: &Camera) -> Vec3 {
    let ray = camera.get_ray(uv);

    let march_t = march(&ray);

    if march_t > 999. {
        Vec3::ONE
    } else {
        Vec3::ZERO
    }
}

fn march(ray: &Ray) -> f32 {
    let mut t = 0f32;
    for _ in 0..100 {
        let p = ray.at(t);
        let d = scene::sd_scene(p);
        if d < 0.001 {
            break;
        }
        t += d;
        if t > 1000. {
            break;
        }
    }

    return t;
}
