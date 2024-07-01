class TokenBridgePackage : ReactPackage {
   override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
       return listOf(TokenBridgeModule(reactContext))
   }


   override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
       return emptyList()
   }
}
