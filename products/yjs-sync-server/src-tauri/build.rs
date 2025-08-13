use std::fs;

fn main() {
    tauri_build::build();
    
    // Copy the Node.js server files to be bundled with the app
    println!("cargo:rerun-if-changed=../dist");
    
    // The resources will be bundled by Tauri's resource system
    let src_dist = "../dist";
    if std::path::Path::new(src_dist).exists() {
        println!("cargo:rerun-if-changed={}", src_dist);
        // Let Tauri handle the bundling via tauri.conf.json resources
    } else {
        println!("cargo:warning=Source dist directory not found at {}", src_dist);
    }
}

