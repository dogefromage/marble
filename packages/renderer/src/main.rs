#![allow(dead_code)]

mod marching;
use glam::{Vec2, Vec3};
use std::cmp::{max, min};
extern crate yaml_rust;
use yaml_rust::{YamlEmitter, YamlLoader};

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

fn main() {
    // let width: i32 = 400;
    // let height: i32 = 300;

    load_scene();

    // let mut pixels = Vec::with_capacity((width * height) as usize);
    // for j in 0..height {
    //     for i in 0..width {
    //         let mut uv = Vec2 {
    //             x: (2 * i - width) as f32,
    //             y: (2 * j - height) as f32,
    //         };
    //         uv /= height as f32;

    //         let res = marching::render(uv.x, uv.y);
    //         pixels.push(res);
    //     }
    // }

    // write_ppm(width, height, pixels);
}

fn load_scene() {
    let s = "
scene:
    sd_sphere:
        radius: 1
        p: 'ray_pos'
";
    let docs = YamlLoader::load_from_str(s).unwrap();
    let doc = &docs[0];

    for key in doc.as_hash().unwrap().keys().into_iter() {
        println!("{}", key.as_str().unwrap());
    }
}
