package com.freshnative;

import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class StonePrinterModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public StonePrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "StonePrinter";
    }

    @ReactMethod
    public void print(String printableContent) {
        Uri uri = new Uri.Builder()
            .scheme("printer-app")
            .authority("print")
            .appendQueryParameter("SHOW_FEEDBACK_SCREEN", "false")
            .appendQueryParameter("SCHEME_RETURN", "meuapp")
            .appendQueryParameter("PRINTABLE_CONTENT", printableContent)
            .build();

        android.util.Log.d("STONE_PRINT", uri.toString());

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        reactContext.startActivity(intent);
    }
}