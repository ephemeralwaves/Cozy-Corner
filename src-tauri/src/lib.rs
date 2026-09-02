use std::sync::atomic::{AtomicBool, Ordering};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent};

const PLAYER_URL: &str = "https://thinkcolorful.org/ytplayer/";
static PLAYER_OPENED: AtomicBool = AtomicBool::new(false);

fn radio_eval(app: &tauri::AppHandle, script: &str) {
    if let Some(window) = app.get_webview_window("radio") {
        let _ = window.eval(script);
    }
}

fn ensure_radio_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("radio").is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(app, "radio", WebviewUrl::External(PLAYER_URL.parse().unwrap()))
        .title("YouTube Player")
        .inner_size(480.0, 580.0)
        .resizable(true)
        .visible(false)
        .skip_taskbar(true)
        .build()?;

    Ok(())
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn radio_toggle_window(app: tauri::AppHandle) -> Result<(), String> {
    ensure_radio_window(&app).map_err(|e| e.to_string())?;
    if let Some(window) = app.get_webview_window("radio") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            PLAYER_OPENED.store(true, Ordering::Relaxed);
            show_radio(&app);
        }
    }
    Ok(())
}

fn show_radio(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("radio") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn radio_play_pause(app: tauri::AppHandle) -> Result<(), String> {
    ensure_radio_window(&app).map_err(|e| e.to_string())?;
    if !PLAYER_OPENED.swap(true, Ordering::Relaxed) {
        show_radio(&app);
    }
    radio_eval(
        &app,
        r#"
        (function () {
          const p = window.youtubePlayer;
          if (!p || !p.player) return;
          p.playMusic();
        })();
        "#,
    );
    Ok(())
}

#[tauri::command]
fn radio_stop(app: tauri::AppHandle) -> Result<(), String> {
    radio_eval(
        &app,
        r#"
        (function () {
          const p = window.youtubePlayer;
          if (!p) return;
          p.stopMusic();
        })();
        "#,
    );
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            quit_app,
            radio_toggle_window,
            radio_play_pause,
            radio_stop
        ])
        .setup(|app| {
            let _ = ensure_radio_window(app.handle());

            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let customize = MenuItem::with_id(app, "customize", "Customize", true, None::<&str>)?;
            let player = MenuItem::with_id(app, "player", "YouTube Player", true, None::<&str>)?;
            let play = MenuItem::with_id(app, "play", "Play / Pause", true, None::<&str>)?;
            let stop = MenuItem::with_id(app, "stop", "Stop music", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &hide, &customize, &player, &play, &stop, &quit])?;

            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "customize" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                            let _ = window.eval(
                                "window.dispatchEvent(new Event('cozy-customize'))",
                            );
                        }
                    }
                    "player" => {
                        let _ = radio_toggle_window(app.clone());
                    }
                    "play" => {
                        let _ = radio_play_pause(app.clone());
                    }
                    "stop" => {
                        let _ = radio_stop(app.clone());
                    }
                    _ => {}
                })
                .build(app)?;
            let _ = tray;

            #[cfg(target_os = "macos")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_visible_on_all_workspaces(true);
                    let _ = window.set_shadow(false);
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Cozy Corner");
}
