use std::sync::Mutex;
use tauri::State;

// Admin mode state
struct AdminModeState(Mutex<bool>);

#[tauri::command]
fn get_admin_mode(state: State<AdminModeState>) -> bool {
    *state.0.lock().unwrap()
}

#[tauri::command]
fn set_admin_mode(enabled: bool, state: State<AdminModeState>) -> bool {
    let mut admin_mode = state.0.lock().unwrap();
    *admin_mode = enabled;
    enabled
}

#[tauri::command]
fn toggle_admin_mode(state: State<AdminModeState>) -> bool {
    let mut admin_mode = state.0.lock().unwrap();
    *admin_mode = !*admin_mode;
    *admin_mode
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AdminModeState(Mutex::new(false)))
    .invoke_handler(tauri::generate_handler![
      get_admin_mode,
      set_admin_mode,
      toggle_admin_mode
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
