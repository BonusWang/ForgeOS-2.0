package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

//go:embed all:web
var webFS embed.FS

const storagePrefix = "/__forge_data__"

func main() {
	// Bind a free loopback port so multiple instances never clash and the
	// user never has to manage port conflicts.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("failed to bind: %v", err)
	}
	port := ln.Addr().(*net.TCPAddr).Port
	appURL := fmt.Sprintf("http://127.0.0.1:%d/", port)

	webRoot, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatalf("embedded web assets missing: %v", err)
	}
	fileServer := http.FileServer(http.FS(webRoot))

	mux := http.NewServeMux()
	mux.HandleFunc(storagePrefix+"/", storageHandler)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// SPA fallback: serve the requested asset, or index.html for unknown
		// paths so client-side state keeps working on refresh.
		clean := strings.TrimPrefix(r.URL.Path, "/")
		if clean != "" {
			if f, err := webRoot.Open(clean); err == nil {
				f.Close()
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	})

	server := &http.Server{Handler: mux}
	go func() {
		if err := server.Serve(ln); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Give the server a beat to start accepting connections before opening
	// the browser, otherwise the first request can race the listener.
	time.Sleep(100 * time.Millisecond)
	openURL(appURL)

	log.Printf("Forge-OS running at %s", appURL)
	log.Printf("Data file: %s", dataFilePath())
	log.Println("Press Ctrl+C to stop.")

	select {} // block forever
}

// storageHandler mirrors the /__forge_data__ contract in vite.config.ts:
//   GET    /__forge_data__/__storage_url__  → { path: <dataFile> }
//   GET    /__forge_data__/{name}           → stored value or null
//   PUT    /__forge_data__/{name}           → { ok: true }
//   DELETE /__forge_data__/{name}           → { ok: true }
func storageHandler(w http.ResponseWriter, r *http.Request) {
	raw := strings.TrimPrefix(r.URL.Path, storagePrefix+"/")
	name, err := url.PathUnescape(strings.Trim(raw, "/"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad storage name"})
		return
	}

	if name == "__storage_url__" {
		writeJSON(w, http.StatusOK, map[string]string{"path": dataFilePath()})
		return
	}
	if name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing storage name"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		v, ok := storageGet(name)
		if !ok {
			writeJSON(w, http.StatusOK, nil) // null, matches vite middleware
			return
		}
		writeJSON(w, http.StatusOK, v)
	case http.MethodPut:
		body, err := io.ReadAll(r.Body)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read body failed"})
			return
		}
		if err := storagePut(name, body); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	case http.MethodDelete:
		if err := storageDelete(name); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	default:
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
