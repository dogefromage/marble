use std::cmp::{max, min};
use glam::{Vec3, Vec2};
use crate::{marching, scene};

fn vec3_to_rgb(color: Vec3) -> (i32, i32, i32) {
    let r = (255.99 * color.x) as i32;
    let g = (255.99 * color.y) as i32;
    let b = (255.99 * color.z) as i32;
    return (
        max(0, min(r, 255)),
        max(0, min(g, 255)),
        max(0, min(b, 255)),
    );
}

fn write_ppm(width: i32, height: i32, pixels: Vec<Vec3>) {
    println!("P3\n{} {}\n255", width, height);
    for j in (0..height).rev() {
        for i in 0..width {
            let coord = (width * j + i) as usize;
            let (r, g, b) = vec3_to_rgb(pixels[coord]);
            println!("{} {} {}", r, g, b);
        }
    }
}

pub fn render(width: i32, height: i32) {
    let mut pixels = Vec::with_capacity((width * height) as usize);
    let camera = scene::get_camera();
    for j in 0..height {
        for i in 0..width {
            let mut uv = Vec2 {
                x: (2 * i - width) as f32,
                y: (2 * j - height) as f32,
            };
            uv /= height as f32;
            let res = marching::shade(uv, &camera);
            pixels.push(res);
        }
    }
    write_ppm(width, height, pixels);
}