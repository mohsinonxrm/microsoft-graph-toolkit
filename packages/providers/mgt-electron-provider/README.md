# Microsoft Graph Toolkit Electron Provider
The [Microsoft Graph Toolkit (mgt)](https://aka.ms/mgt) library is a collection of authentication providers and UI components powered by Microsoft Graph. 

The `@microsoft/mgt-electron-provider` package exposes the `ElectronAuthenticator` and `ElectronProvider` classes which use [MSAL node](https://www.npmjs.com/package/@azure/msal-node) to sign in users and acquire tokens to use with Microsoft Graph.


## Usage

1. Install the packages

    ```bash
    npm install @microsoft/mgt-element @microsoft/mgt-electron-provider
    ```

2. Initialize the provider in your renderer process (Front end, eg. renderer.ts)

    ```ts
    import {Providers} from '@microsoft/mgt-element';
    import {ElectronProvider} from '@microsoft/mgt-electron-provider/dist/Provider';

    // initialize the auth provider globally
    Providers.globalProvider = new ElectronProvider();
    ```

3. Initialize ElectronAuthenticator in Main.ts (Back end)

    ```ts
    import { ElectronAuthenticator, MsalElectronConfig } from '@microsoft/mgt-electron-provider/dist/Authenticator'; 
    ...
    let mainWindow =  new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        nodeIntegration: true //Make sure this is true
      }
    });
    let config: MsalElectronConfig = {
      clientId: '<your_client_id>',
      authority: '<your_authority_url>', //optional, uses common authority by default
      mainWindow: mainWindow, //This is the BrowserWindow instance that requires authentication
      scopes: [
        'user.read', 
      ],
    };
    ElectronAuthenticator.initialize(config);
    ```
Note : Make sure `nodeIntegration` is set to `true` under `webPreferences` while creating a new BrowserWindow instance. 

See [provider usage documentation](https://learn.microsoft.com/graph/toolkit/providers) to learn about how to use the providers with the mgt components, to sign in/sign out, get access tokens, call Microsoft Graph, and more. See [Electron provider documentation](https://learn.microsoft.com/graph/toolkit/providers/electron).

### Cache Plugin

[MSAL Node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) supports an in-memory cache by default and provides the ICachePlugin interface to perform cache serialization, but does not provide a default way of storing the token cache to disk. If you need persistent cache storage to enable silent log-ins or cross-platform caching, we recommend using the default implementation provided by MSAL Node [here](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/extensions/msal-node-extensions). You can import this plugin, and pass the instance of the cache plugin while initializing ElectronAuthenticator.

```ts
let config: MsalElectronConfig = {
  ...
  cachePlugin: new PersistenceCachePlugin(filePersistence)
};
```
    
For more details on how to implement this, refer to the sample for this extension [here](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/extensions/samples/msal-node-extensions).  
    


## See also
* [Build an electron app and integrate Microsoft Graph Toolkit](https://learn.microsoft.com/graph/toolkit/get-started/build-an-electron-app)
* [Microsoft Graph Toolkit docs](https://aka.ms/mgt-docs)
* [Microsoft Graph Toolkit repository](https://aka.ms/mgt)
* [Microsoft Graph Toolkit playground](https://mgt.dev)
  
