use glam::Vec3;

struct Ray {
    o: Vec3,
    r: Vec3,
}

impl Ray {
    pub fn at(self: &Ray, t: f32) -> Vec3 {
        self.o + self.r * t
    }
}

pub fn render(u: f32, v: f32) -> Vec3 {
    let focal_length = 2.5;
    let ray_dir = Vec3::new(u, v, focal_length).normalize();
    let ray_origin = Vec3::new(0., 0., -5.);
    let ray = Ray { o: ray_origin, r: ray_dir };

    let has_hit = march(&ray);
    match has_hit {
        true => Vec3::ONE,
        false => Vec3::ZERO
    }
}

fn march(ray: &Ray) -> bool {
    let mut t = 0f32;

    for _ in 0..100 {
        let p = ray.at(t);
        let d = sdf(p);
        if d < 0.001 { 
            return true;
        }
        t += d;
        if t > 1000. {
            break;
        }
    }

    return false;
}

fn sdf(p: Vec3) -> f32 {
    return p.length() - 1.;
}