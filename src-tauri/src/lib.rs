use std::fs;
use std::path::{Path, PathBuf};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Find candidate Wuthering Waves "Client" folders — from the running game
/// process first, then common install locations.
fn collect_client_roots() -> Vec<PathBuf> {
    let mut roots: Vec<PathBuf> = Vec::new();

    let sys = sysinfo::System::new_all();
    for process in sys.processes().values() {
        if let Some(exe) = process.exe() {
            let lower = exe.to_string_lossy().to_lowercase();
            if lower.contains("client-win64-shipping") || lower.contains("wuthering waves") {
                for anc in exe.ancestors() {
                    if anc.file_name().and_then(|n| n.to_str()) == Some("Client") {
                        roots.push(anc.to_path_buf());
                        break;
                    }
                }
            }
        }
    }

    let bases = [
        "Wuthering Waves\\Wuthering Waves Game\\Client",
        "Wuthering Waves Game\\Client",
        "Program Files\\Wuthering Waves\\Wuthering Waves Game\\Client",
        "Program Files\\Epic Games\\WutheringWavesj3oFh\\Wuthering Waves Game\\Client",
        "Wuthering Waves\\Client",
    ];
    for drive in ["C:\\", "D:\\", "E:\\", "F:\\"] {
        for base in bases {
            let p = Path::new(drive).join(base);
            if p.exists() {
                roots.push(p);
            }
        }
    }

    roots.sort();
    roots.dedup();
    roots
}

/// Scan the game logs for the most recent Convene-history URL.
#[tauri::command]
fn find_convene_url() -> Result<Option<String>, String> {
    let re = regex::Regex::new(
        r#"https://aki-gm-resources(?:-oversea)?\.aki-game\.(?:net|com)/aki/gacha/index\.html#/record[^\s"]+"#,
    )
    .map_err(|e| e.to_string())?;

    let mut found: Option<String> = None;
    for root in collect_client_roots() {
        let candidates = [
            root.join("Saved").join("Logs").join("Client.log"),
            root.join("Binaries")
                .join("Win64")
                .join("ThirdParty")
                .join("KrPcSdk_Global")
                .join("KRSDKRes")
                .join("KRSDKWebView")
                .join("debug.log"),
        ];
        for c in candidates {
            if let Ok(content) = fs::read_to_string(&c) {
                if let Some(m) = re.find_iter(&content).last() {
                    found = Some(m.as_str().to_string());
                }
            }
        }
    }
    Ok(found)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_process::init());
    }

    builder
        .invoke_handler(tauri::generate_handler![greet, find_convene_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
