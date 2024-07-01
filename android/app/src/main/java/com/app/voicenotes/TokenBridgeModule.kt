class TokenBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {


 companion object {
     const val WEARABLE_TOKEN_PATH = "/token_path"
 }
 override fun getName(): String {
   return "TokenBridge"
 }


 @ReactMethod
 fun sendTokenToWatch(token: String) {
   // Send the token to the Wear OS app
   Log.d("MainApplication", "sendTokenToWatch: $token")
   sendMessageToWatch(token)
 }


 private fun sendMessageToWatch(token: String) {
   Log.d("MainApplication", "sendMessageToWatch started")
   CoroutineScope(Dispatchers.IO).launch {
     try {
       val nodeClient = Wearable.getNodeClient(reactApplicationContext)
       nodeClient.connectedNodes.addOnSuccessListener { nodes ->
         nodes.forEach { node ->
           val sendMessageTask = Wearable.getMessageClient(reactApplicationContext)
             .sendMessage(node.id, WEARABLE_TOKEN_PATH, token.toByteArray())
           sendMessageTask.addOnSuccessListener {
            Log.d("MainApplication", "Message sent successfully")


           }.addOnFailureListener {
             it.printStackTrace()
             Log.e("MainApplication", "Failed to send message", it)
           }
         }
       }.addOnFailureListener {
         it.printStackTrace()
         Log.e("MainApplication", "No connected nodes found")
       }
     } catch (e: Exception) {
       e.printStackTrace()
       Log.e("MainApplication", "Failed to get connected nodes", e)
     }
   }
 }
}
