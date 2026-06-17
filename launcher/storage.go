package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// Data file location mirrors vite.config.ts (forge-dev-appdata-storage) and
// electron/main.cjs: FORGE_DATA_DIR > %APPDATA%/Forge > ./.forge-data.
// Same path ⇒ data is shared across the Electron build, the vite dev server,
// and this launcher — no migration needed when switching.
func dataFilePath() string {
	if dir := os.Getenv("FORGE_DATA_DIR"); dir != "" {
		return filepath.Join(dir, "forge-data.json")
	}
	if appData := os.Getenv("APPDATA"); appData != "" {
		return filepath.Join(appData, "Forge", "forge-data.json")
	}
	return filepath.Join(".forge-data", "forge-data.json")
}

type storageRecord map[string]string

var storageMu sync.Mutex

// readRecordLocked reads the primary file; on corruption/missing it falls
// back to the .bak copy and restores the primary (matches main.cjs behavior).
// Caller must hold storageMu.
func readRecordLocked() storageRecord {
	dataFile := dataFilePath()
	bak := dataFile + ".bak"

	if b, err := os.ReadFile(dataFile); err == nil {
		if rec, ok := parseRecord(b); ok {
			return rec
		}
	}

	// Primary missing/corrupt — try the backup.
	if b, err := os.ReadFile(bak); err == nil {
		if rec, ok := parseRecord(b); ok {
			_ = os.MkdirAll(filepath.Dir(dataFile), 0o755)
			_ = os.WriteFile(dataFile, b, 0o644) // best-effort restore
			return rec
		}
	}
	return storageRecord{}
}

func parseRecord(b []byte) (storageRecord, bool) {
	var rec storageRecord
	if err := json.Unmarshal(b, &rec); err != nil {
		return nil, false
	}
	if rec == nil {
		rec = storageRecord{}
	}
	return rec, true
}

// writeRecordLocked atomically writes (tmp+rename) and refreshes the .bak.
// Caller must hold storageMu.
func writeRecordLocked(rec storageRecord) error {
	dataFile := dataFilePath()
	if err := os.MkdirAll(filepath.Dir(dataFile), 0o755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(rec, "", "  ")
	if err != nil {
		return err
	}
	tmp := dataFile + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	if err := os.Rename(tmp, dataFile); err != nil {
		return err
	}
	_ = copyFile(dataFile, dataFile+".bak") // best-effort backup
	return nil
}

func copyFile(src, dst string) error {
	b, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, b, 0o644)
}

// Public operations used by the HTTP handler.

func storageGet(name string) (any, bool) {
	storageMu.Lock()
	defer storageMu.Unlock()
	rec := readRecordLocked()
	raw, ok := rec[name]
	if !ok {
		return nil, false
	}
	var v any
	if json.Unmarshal([]byte(raw), &v) != nil {
		return nil, false
	}
	return v, true
}

func storagePut(name string, body []byte) error {
	var v any
	if err := json.Unmarshal(body, &v); err != nil {
		return err
	}
	canonical, err := json.Marshal(v)
	if err != nil {
		return err
	}
	storageMu.Lock()
	defer storageMu.Unlock()
	rec := readRecordLocked()
	rec[name] = string(canonical)
	return writeRecordLocked(rec)
}

func storageDelete(name string) error {
	storageMu.Lock()
	defer storageMu.Unlock()
	rec := readRecordLocked()
	delete(rec, name)
	return writeRecordLocked(rec)
}
