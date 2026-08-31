package com.freshnative

import android.content.Intent
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

override fun getMainComponentName(): String = "PdvPay"

override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
    )

override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()

    super.onCreate(savedInstanceState)

    handleIntent(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)

    setIntent(intent)

    handleIntent(intent)
}

private fun handleIntent(intent: Intent?) {
    val uri = intent?.data ?: return

    if (uri.scheme != "meuapp" || uri.host != "pay-response") {
        return
    }

    val params = Bundle()

    uri.queryParameterNames.forEach { key ->
        params.putString(key, uri.getQueryParameter(key))
    }

    val eventName = "StonePaymentResponse"

    val reactApplication = application as ReactApplication

    val reactHost = reactApplication.reactHost ?: return

    val reactContext = reactHost.currentReactContext ?: return

    reactContext
        .getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        )
        .emit(
            eventName,
            Arguments.fromBundle(params)
        )
}

}