package com.freshnative;

import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class StonePaymentModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public StonePaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "StonePayment";
    }

    @ReactMethod
    public void pay(ReadableMap params) {
        android.util.Log.e("STONE_PAY", "PAY CHAMADO");
        Uri.Builder uriBuilder = new Uri.Builder()
            .scheme("payment-app")
            .authority("pay")
            .appendQueryParameter("return_scheme", "meuapp");

        if (params.hasKey("amount")) {
            uriBuilder.appendQueryParameter("amount", String.valueOf(params.getInt("amount")));
        }

        if (params.hasKey("orderId")) {
            uriBuilder.appendQueryParameter("order_id", params.getString("orderId"));
        }

        if (params.hasKey("transactionType")) {
            String type = params.getString("transactionType");
            if (type != null && !type.isEmpty()) {
                uriBuilder.appendQueryParameter("transaction_type", type);
            }
        }

        if (params.hasKey("installmentType")) {
            String type = params.getString("installmentType");
            if (type != null && !type.isEmpty()) {
                uriBuilder.appendQueryParameter("installment_type", type);
            }
        }

        if (params.hasKey("installmentCount")) {
            int count = params.getInt("installmentCount");
            if (count > 0) {
                uriBuilder.appendQueryParameter("installment_count", String.valueOf(count));
            }
        }

        if (params.hasKey("editableAmount")) {
            uriBuilder.appendQueryParameter(
                "editable_amount",
                params.getBoolean("editableAmount") ? "1" : "0"
            );
        }

        Uri uri = uriBuilder.build();

        android.util.Log.e("STONE_PAY", uri.toString());

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        reactContext.startActivity(intent);
    }
}
