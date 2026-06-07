package com.forgeos.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        applySystemBarInsets(root);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);

        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });
        webView.addJavascriptInterface(new AndroidStorageBridge(this), "androidStorage");
        webView.loadUrl("https://appassets.androidplatform.net/assets/web/index.html");

        setContentView(root);
        root.post(root::requestApplyInsets);
    }

    private void applySystemBarInsets(View view) {
        view.setOnApplyWindowInsetsListener((target, insets) -> {
            int topInset;
            int bottomInset;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets systemBars = insets.getInsets(WindowInsets.Type.systemBars());
                topInset = systemBars.top;
                bottomInset = systemBars.bottom;
            } else {
                topInset = insets.getSystemWindowInsetTop();
                bottomInset = insets.getSystemWindowInsetBottom();
            }
            target.setPadding(0, topInset, 0, bottomInset);
            return insets;
        });
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    public static final class AndroidStorageBridge {
        private final Context context;
        private final File dataFile;
        private final File backupFile;
        private final File rollbackFile;
        private final File tempFile;

        AndroidStorageBridge(Context context) {
            this.context = context.getApplicationContext();
            File dataDir = this.context.getFilesDir();
            dataFile = new File(dataDir, "forge-data.json");
            backupFile = new File(dataDir, "forge-data.json.bak");
            rollbackFile = new File(dataDir, "forge-data.json.rollback");
            tempFile = new File(dataDir, "forge-data.json.tmp");
        }

        @JavascriptInterface
        public String loadData() {
            String primary = readJsonFile(dataFile);
            if (primary != null) return primary;

            String backup = readJsonFile(backupFile);
            if (backup != null) {
                writeData(backup);
                return backup;
            }

            return "{}";
        }

        @JavascriptInterface
        public boolean saveData(String json) {
            return writeData(json);
        }

        @JavascriptInterface
        public boolean saveRollback(String json) {
            return writeJsonFile(rollbackFile, json);
        }

        @JavascriptInterface
        public String getDataFilePath() {
            return dataFile.getAbsolutePath();
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
                return info.versionName == null ? "0.0.0" : info.versionName;
            } catch (Exception ignored) {
                return "0.0.0";
            }
        }

        private String readJsonFile(File file) {
            try {
                if (!file.exists()) return null;
                String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
                new JSONObject(content);
                return content;
            } catch (Exception ignored) {
                return null;
            }
        }

        private boolean writeData(String json) {
            if (!writeJsonFile(tempFile, json)) return false;
            if (dataFile.exists() && !dataFile.delete()) return false;
            if (!tempFile.renameTo(dataFile)) return false;
            return writeJsonFile(backupFile, json);
        }

        private boolean writeJsonFile(File file, String json) {
            try {
                new JSONObject(json);
                File parent = file.getParentFile();
                if (parent != null && !parent.exists() && !parent.mkdirs()) return false;
                try (FileOutputStream stream = new FileOutputStream(file, false)) {
                    stream.write(json.getBytes(StandardCharsets.UTF_8));
                }
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }
    }
}
