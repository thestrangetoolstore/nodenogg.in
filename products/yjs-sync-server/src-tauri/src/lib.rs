use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::State;

// Server state management
pub struct ServerState {
    process: Arc<Mutex<Option<Child>>>,
}

impl ServerState {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
        }
    }
}

#[tauri::command]
async fn start_server(state: State<'_, ServerState>) -> Result<(), String> {
    let mut process = state.process.lock().map_err(|e| e.to_string())?;
    
    if process.is_some() {
        return Err("Server is already running".to_string());
    }
    
    // Get the path to the Node.js server
    let exe_path = std::env::current_exe()
        .map_err(|e| e.to_string())?;
    let exe_dir = exe_path
        .parent()
        .ok_or("Failed to get parent directory")?;
    
    // For macOS app bundles, resources are in Contents/Resources/
    let possible_paths = vec![
        exe_dir.join("../Resources/_up_/dist/index.cjs"), // macOS app bundle (actual location)
        exe_dir.join("../Resources/index.cjs"),           // macOS app bundle (alternative)
        exe_dir.join("resources/dist/index.cjs"),         // Alternative bundling
        exe_dir.join("../../../dist/index.cjs"),          // Development path
    ];
    
    let mut server_path = None;
    for path in &possible_paths {
        if path.exists() {
            server_path = Some(path.clone());
            break;
        }
    }
    
    let server_path = server_path.ok_or_else(|| {
        format!("Server file not found. Checked paths: {:?}", possible_paths)
    })?;
    
    // Try different Node.js executable paths
    let node_paths = vec![
        "node",                    // System PATH
        "/usr/local/bin/node",     // Common Homebrew location
        "/opt/homebrew/bin/node",  // Apple Silicon Homebrew
        "/usr/bin/node",           // System location
    ];
    
    let mut last_error = String::new();
    for node_path in node_paths {
        match Command::new(node_path)
            .arg(&server_path)
            .spawn() {
            Ok(child) => {
                *process = Some(child);
                return Ok(());
            }
            Err(e) => {
                last_error = format!("Failed with {}: {}", node_path, e);
                continue;
            }
        }
    }
    
    Err(format!("Could not find Node.js executable. Last error: {}. Server path: {:?}", last_error, server_path))
}

#[tauri::command]
async fn stop_server(state: State<'_, ServerState>) -> Result<(), String> {
    let mut process = state.process.lock().map_err(|e| e.to_string())?;
    
    if let Some(mut child) = process.take() {
        child.kill().map_err(|e| format!("Failed to kill server: {}", e))?;
        child.wait().map_err(|e| format!("Failed to wait for server: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn get_server_status(state: State<'_, ServerState>) -> Result<bool, String> {
    let mut process = state.process.lock().map_err(|e| e.to_string())?;
    
    if let Some(child) = process.as_mut() {
        // Check if the process is still running
        match child.try_wait() {
            Ok(Some(_)) => {
                // Process has exited
                *process = None;
                Ok(false)
            }
            Ok(None) => {
                // Process is still running
                Ok(true)
            }
            Err(_) => {
                // Error checking status, assume not running
                *process = None;
                Ok(false)
            }
        }
    } else {
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(ServerState::new())
    .invoke_handler(tauri::generate_handler![
        start_server,
        stop_server,
        get_server_status
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
